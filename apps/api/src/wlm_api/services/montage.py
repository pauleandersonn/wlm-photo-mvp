import io
import uuid
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from typing import Optional
from ....models import Event, ThemeStyle
from ....services.storage import get_storage


class MontageEngine:
    WIDTH = 1200
    HEIGHT = 1800
    MARGIN = 50

    def __init__(self):
        self.storage = get_storage()

    async def load_image_from_url(self, url: str) -> Image.Image:
        """Load image from URL or data URI."""
        if url.startswith("data:"):
            # Data URI
            header, data = url.split(",", 1)
            mime = header.split(":")[1].split(";")[0]
            import base64
            img_data = base64.b64decode(data)
            return Image.open(io.BytesIO(img_data)).convert("RGB")
        elif url.startswith("http"):
            # HTTP URL - would need httpx to fetch
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, timeout=30)
                resp.raise_for_status()
                return Image.open(io.BytesIO(resp.content)).convert("RGB")
        else:
            # Local path
            path = self.storage.get_path(url)
            if path and path.exists():
                return Image.open(path).convert("RGB")
            raise FileNotFoundError(f"Image not found: {url}")

    def get_theme_colors(self, theme: ThemeStyle) -> dict:
        if theme == ThemeStyle.blacktie:
            return {
                "bg": "#121214",
                "bg_grad_start": "#1c1c20",
                "bg_grad_end": "#0e0e10",
                "border_primary": "#d4af37",
                "border_secondary": "rgba(212, 175, 55, 0.4)",
                "text_primary": "#f5eedb",
                "text_accent": "#d4af37",
                "text_secondary": "#888890",
                "card_bg": "#1e1e24",
                "quote_text": "#e0ded8",
                "label_bg_grad": "rgba(0,0,0,0.85)",
            }
        elif theme == ThemeStyle.botanical:
            return {
                "bg": "#f4f6f2",
                "bg_grad_start": "#f4f6f2",
                "bg_grad_end": "#f4f6f2",
                "border_primary": "#4a6b53",
                "border_secondary": "rgba(74, 107, 83, 0.3)",
                "text_primary": "#223326",
                "text_accent": "#4a6b53",
                "text_secondary": "#887d73",
                "card_bg": "#ffffff",
                "quote_text": "#3d342d",
                "label_bg_grad": "rgba(0,0,0,0.85)",
            }
        elif theme == ThemeStyle.minimalist:
            return {
                "bg": "#ffffff",
                "bg_grad_start": "#ffffff",
                "bg_grad_end": "#ffffff",
                "border_primary": "#111827",
                "border_secondary": "rgba(17, 24, 39, 0.3)",
                "text_primary": "#111827",
                "text_accent": "#111827",
                "text_secondary": "#887d73",
                "card_bg": "#ffffff",
                "quote_text": "#3d342d",
                "label_bg_grad": "rgba(0,0,0,0.85)",
            }
        else:  # champagne
            return {
                "bg": "#faf8f3",
                "bg_grad_start": "#faf8f3",
                "bg_grad_end": "#faf8f3",
                "border_primary": "#c5a059",
                "border_secondary": "rgba(197, 160, 89, 0.35)",
                "text_primary": "#2b231d",
                "text_accent": "#b08d44",
                "text_secondary": "#887d73",
                "card_bg": "#ffffff",
                "quote_text": "#3d342d",
                "label_bg_grad": "rgba(0,0,0,0.85)",
            }

    def hex_to_rgb(self, hex_color: str) -> tuple:
        hex_color = hex_color.lstrip("#")
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    def parse_rgba(self, rgba_str: str) -> tuple:
        """Parse rgba(r,g,b,a) string."""
        if rgba_str.startswith("rgba"):
            parts = rgba_str.replace("rgba(", "").replace(")", "").split(",")
            return (int(parts[0]), int(parts[1]), int(parts[2]), float(parts[3]))
        return self.hex_to_rgb(rgba_str) + (1.0,)

    async def render_classic_souvenir(
        self,
        event: Event,
        couple_img: Image.Image,
        guest_img: Image.Image,
        guest_name: str,
    ) -> str:
        """Render classic 10x15 montage and save to storage. Returns storage key."""
        colors = self.get_theme_colors(event.theme_style)
        is_dark = event.theme_style == ThemeStyle.blacktie

        # Create canvas
        canvas = Image.new("RGB", (self.WIDTH, self.HEIGHT), colors["bg"])

        # Background gradient for dark theme
        if is_dark:
            grad = Image.new("RGB", (self.WIDTH, self.HEIGHT))
            draw_grad = ImageDraw.Draw(grad)
            start_rgb = self.hex_to_rgb(colors["bg_grad_start"])
            end_rgb = self.hex_to_rgb(colors["bg_grad_end"])
            for y in range(self.HEIGHT):
                ratio = y / self.HEIGHT
                r = int(start_rgb[0] * (1 - ratio) + end_rgb[0] * ratio)
                g = int(start_rgb[1] * (1 - ratio) + end_rgb[1] * ratio)
                b = int(start_rgb[2] * (1 - ratio) + end_rgb[2] * ratio)
                draw_grad.line([(0, y), (self.WIDTH, y)], fill=(r, g, b))
            canvas = grad

        draw = ImageDraw.Draw(canvas)

        # Double border
        border_primary = self.parse_rgba(colors["border_primary"])
        border_secondary = self.parse_rgba(colors["border_secondary"])

        draw.rectangle(
            [self.MARGIN, self.MARGIN, self.WIDTH - self.MARGIN, self.HEIGHT - self.MARGIN],
            outline=border_primary[:3],
            width=2,
        )
        draw.rectangle(
            [
                self.MARGIN + 12,
                self.MARGIN + 12,
                self.WIDTH - self.MARGIN - 12,
                self.HEIGHT - self.MARGIN - 12,
            ],
            outline=border_secondary[:3],
            width=1,
        )

        # Try to load fonts
        try:
            font_playfair_large = ImageFont.truetype("PlayfairDisplay-BoldItalic.ttf", 64)
            font_playfair_medium = ImageFont.truetype("PlayfairDisplay-BoldItalic.ttf", 28)
            font_playfair_small = ImageFont.truetype("PlayfairDisplay-Italic.ttf", 26)
            font_jakarta_bold = ImageFont.truetype("PlusJakartaSans-Bold.ttf", 18)
            font_jakarta_medium = ImageFont.truetype("PlusJakartaSans-Medium.ttf", 16)
            font_jakarta_small = ImageFont.truetype("PlusJakartaSans-Medium.ttf", 13)
            font_jakarta_tiny = ImageFont.truetype("PlusJakartaSans-Medium.ttf", 11)
        except OSError:
            # Fallback to default
            font_playfair_large = ImageFont.load_default()
            font_playfair_medium = ImageFont.load_default()
            font_playfair_small = ImageFont.load_default()
            font_jakarta_bold = ImageFont.load_default()
            font_jakarta_medium = ImageFont.load_default()
            font_jakarta_small = ImageFont.load_default()
            font_jakarta_tiny = ImageFont.load_default()

        # Top header
        text_primary = self.parse_rgba(colors["text_primary"])
        text_accent = self.parse_rgba(colors["text_accent"])

        # "WE LOVE MEMORY • FOTO LEMBRANÇA"
        draw.text(
            (self.WIDTH // 2, 110),
            "WE LOVE MEMORY • FOTO LEMBRANÇA",
            font=font_jakarta_bold,
            fill=text_primary[:3],
            anchor="mm",
        )

        # Couple names
        draw.text(
            (self.WIDTH // 2, 185),
            event.couple_names,
            font=font_playfair_large,
            fill=text_primary[:3],
            anchor="mm",
        )

        # Date & venue
        draw.text(
            (self.WIDTH // 2, 225),
            f"{event.date_formatted} • {event.venue}",
            font=font_playfair_medium,
            fill=text_accent[:3],
            anchor="mm",
        )

        # Photo layout
        photo_y = 270
        photo_height = 1140
        photo_width = 490
        slot1_x = 90
        slot2_x = 620
        card_radius = 16

        def draw_photo_card(img: Image.Image, x: int, y: int, w: int, h: int, label: str, sub_label: str):
            # Card background with shadow
            card_bg = self.parse_rgba(colors["card_bg"])

            # Create card with rounded corners
            card = Image.new("RGBA", (w, h), card_bg)
            card_draw = ImageDraw.Draw(card)

            # Draw rounded rect background
            card_draw.rounded_rectangle(
                [(0, 0), (w, h)],
                radius=card_radius,
                fill=card_bg[:3],
            )

            # Paste image with cover fit
            img_aspect = img.width / img.height
            box_aspect = w / h
            if img_aspect > box_aspect:
                new_w = int(img.height * box_aspect)
                new_h = img.height
                left = (img.width - new_w) // 2
                top = 0
            else:
                new_w = img.width
                new_h = int(img.width / box_aspect)
                left = 0
                top = (img.height - new_h) // 2
            img_cropped = img.crop((left, top, left + new_w, top + new_h))
            img_resized = img_cropped.resize((w, h), Image.Resampling.LANCZOS)

            # Apply rounded corners to image
            mask = Image.new("L", (w, h), 0)
            mask_draw = ImageDraw.Draw(mask)
            mask_draw.rounded_rectangle([(0, 0), (w, h)], radius=card_radius, fill=255)
            img_resized.putalpha(mask)

            card.paste(img_resized, (0, 0), img_resized)

            # Bottom gradient for label
            grad_h = 160
            for i in range(grad_h):
                alpha = int(0.85 * (i / grad_h))
                card_draw.line(
                    [(0, h - grad_h + i), (w, h - grad_h + i)],
                    fill=(0, 0, 0, alpha),
                )

            # Label text
            card_draw.text(
                (w // 2, h - 60),
                label,
                font=font_playfair_medium,
                fill=(255, 255, 255),
                anchor="mm",
            )
            card_draw.text(
                (w // 2, h - 32),
                sub_label.upper(),
                font=font_jakarta_small,
                fill=self.hex_to_rgb("#d4af37"),
                anchor="mm",
            )

            # Gold outline
            card_draw.rounded_rectangle(
                [(0, 0), (w - 1, h - 1)],
                radius=card_radius,
                outline=self.hex_to_rgb("#c5a059"),
                width=2,
            )

            # Paste card onto canvas
            canvas.paste(card, (x, y), card)

        # Resize and draw photos
        couple_resized = couple_img.resize((photo_width, photo_height), Image.Resampling.LANCZOS)
        guest_resized = guest_img.resize((photo_width, photo_height), Image.Resampling.LANCZOS)

        draw_photo_card(couple_resized, slot1_x, photo_y, photo_width, photo_height, "Os Noivos", "Foto Oficial")
        draw_photo_card(guest_resized, slot2_x, photo_y, photo_width, photo_height, guest_name or "Convidado Especial", "Lembrança Digital")

        # Bottom footer
        # Decorative separator
        draw.text(
            (self.WIDTH // 2, 1480),
            "❖   ❧   ❖",
            font=font_jakarta_small,
            fill=self.hex_to_rgb("#c5a059"),
            anchor="mm",
        )

        # Quote
        quote_color = self.parse_rgba(colors["quote_text"])
        draw.text(
            (self.WIDTH // 2, 1530),
            '"Obrigado por celebrar este amor e fazer parte da nossa história!"',
            font=font_playfair_small,
            fill=quote_color[:3],
            anchor="mm",
        )

        # Disclaimer
        disclaimer_color = self.parse_rgba(colors["text_secondary"])
        draw.text(
            (self.WIDTH // 2, 1575),
            "Edição Comemorativa 10 × 15 cm • Guarde sua lembrança digital",
            font=font_jakarta_medium,
            fill=disclaimer_color[:3],
            anchor="mm",
        )

        # Save to storage
        media_id = uuid.uuid4().hex[:12]
        key = f"memories/{event.id}/classic_{media_id}.jpg"

        # Save to bytes
        img_bytes = io.BytesIO()
        canvas.save(img_bytes, format="JPEG", quality=95, dpi=(300, 300))
        img_bytes.seek(0)

        self.storage.write(key, img_bytes.read())

        return key


montage_engine = MontageEngine()