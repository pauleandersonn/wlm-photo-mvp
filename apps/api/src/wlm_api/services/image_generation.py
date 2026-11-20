"""Image Generation Service - Multi-provider abstraction for AI image generation."""
import os
import base64
import httpx
import json
import uuid
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from enum import Enum
from PIL import Image
import io

from ....config import get_settings


class ImageProvider(str, Enum):
    OPENAI_DALLE = "openai_dalle"
    GOOGLE_IMAGEN = "google_imagen"
    XAI_GROK = "xai_grok"
    REPLICATE = "replicate"
    FAL = "fal"


class ImageStyle(str, Enum):
    HYPERREALISTIC = "hyperrealistic"
    PIXAR_3D = "pixar_3d"
    CARTOON = "cartoon"
    ARTISTIC = "artistic"


@dataclass
class GenerationRequest:
    prompt: str
    negative_prompt: Optional[str] = None
    style: ImageStyle = ImageStyle.HYPERREALISTIC
    reference_images: List[str] = None  # base64 encoded
    width: int = 1024
    height: int = 1024
    steps: int = 30
    guidance_scale: float = 7.5
    seed: Optional[int] = None


@dataclass
class GenerationResult:
    success: bool
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    provider: Optional[ImageProvider] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = None


class ImageGenerationProvider(ABC):
    """Abstract base class for image generation providers."""

    @abstractmethod
    async def generate(self, request: GenerationRequest) -> GenerationResult:
        pass

    @abstractmethod
    def is_available(self) -> bool:
        pass


class OpenAIImageProvider(ImageGenerationProvider):
    """OpenAI DALL-E 3 provider."""

    def __init__(self):
        self.settings = get_settings()
        self.api_key = os.getenv("OPENAI_API_KEY") or self.settings.ai_api_key
        self.base_url = "https://api.openai.com/v1"

    def is_available(self) -> bool:
        return bool(self.api_key)

    def _build_prompt(self, request: GenerationRequest) -> str:
        style_modifiers = {
            ImageStyle.HYPERREALISTIC: "hyper-realistic photography, 8k resolution, professional lighting, sharp focus, wedding photography style",
            ImageStyle.PIXAR_3D: "Pixar 3D animation style, Disney quality, cinematic lighting, adorable characters, volumetric lighting",
            ImageStyle.CARTOON: "vibrant 2D cartoon illustration, clean lines, expressive characters, wedding celebration art",
            ImageStyle.ARTISTIC: "artistic digital painting, watercolor style, romantic wedding atmosphere",
        }
        base = request.prompt
        style = style_modifiers.get(request.style, "")
        if request.negative_prompt:
            return f"{base}, {style}. Negative: {request.negative_prompt}"
        return f"{base}, {style}"

    async def generate(self, request: GenerationRequest) -> GenerationResult:
        if not self.is_available():
            return GenerationResult(success=False, error="OpenAI API key not configured", provider=ImageProvider.OPENAI_DALLE)

        prompt = self._build_prompt(request)

        payload = {
            "model": "dall-e-3",
            "prompt": prompt,
            "n": 1,
            "size": f"{request.width}x{request.height}",
            "quality": "hd",
            "response_format": "b64_json",
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.base_url}/images/generations",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()

                b64_image = data["data"][0]["b64_json"]

                # Save to storage
                settings = get_settings()
                from .storage import get_storage
                storage = get_storage()
                media_id = uuid.uuid4().hex[:12]
                key = f"ai-generated/{media_id}.png"

                image_data = base64.b64decode(b64_image)
                storage.write(key, image_data)
                image_url = storage.get_url(key)

                return GenerationResult(
                    success=True,
                    image_url=image_url,
                    image_base64=b64_image,
                    provider=ImageProvider.OPENAI_DALLE,
                    metadata={"model": "dall-e-3", "size": f"{request.width}x{request.height}"},
                )
        except Exception as e:
            return GenerationResult(
                success=False,
                error=str(e),
                provider=ImageProvider.OPENAI_DALLE,
            )


class GoogleImagenProvider(ImageGenerationProvider):
    """Google Imagen 3 provider via Vertex AI."""

    def __init__(self):
        self.settings = get_settings()
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        self.location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
        self.credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    def is_available(self) -> bool:
        return bool(self.project_id and self.credentials_path)

    def _build_prompt(self, request: GenerationRequest) -> str:
        style_modifiers = {
            ImageStyle.HYPERREALISTIC: "photorealistic, 8k, professional wedding photography, natural lighting",
            ImageStyle.PIXAR_3D: "Pixar 3D animation, Disney style, cinematic lighting, 3D render",
            ImageStyle.CARTOON: "cartoon illustration, vibrant colors, clean lines, wedding theme",
            ImageStyle.ARTISTIC: "digital art, watercolor, romantic wedding atmosphere",
        }
        base = request.prompt
        style = style_modifiers.get(request.style, "")
        if request.negative_prompt:
            return f"{base}, {style}. Avoid: {request.negative_prompt}"
        return f"{base}, {style}"

    async def generate(self, request: GenerationRequest) -> GenerationResult:
        if not self.is_available():
            return GenerationResult(success=False, error="Google Cloud credentials not configured", provider=ImageProvider.GOOGLE_IMAGEN)

        try:
            # Use Vertex AI REST API
            import google.auth
            from google.auth.transport.requests import Request

            credentials, _ = google.auth.default()
            credentials.refresh(Request())
            token = credentials.token

            prompt = self._build_prompt(request)

            payload = {
                "instances": [{"prompt": prompt}],
                "parameters": {
                    "sampleCount": 1,
                    "aspectRatio": f"{request.width}:{request.height}",
                    "guidanceScale": request.guidance_scale,
                },
            }

            url = f"https://{self.location}-aiplatform.googleapis.com/v1/projects/{self.project_id}/locations/{self.location}/publishers/google/models/imagen-3.0-generate-001:predict"

            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    url,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()

                # Imagen returns base64 in predictions
                predictions = data.get("predictions", [])
                if not predictions:
                    return GenerationResult(success=False, error="No image generated", provider=ImageProvider.GOOGLE_IMAGEN)

                b64_image = predictions[0].get("bytesBase64Encoded", "")

                settings = get_settings()
                from .storage import get_storage
                storage = get_storage()
                media_id = uuid.uuid4().hex[:12]
                key = f"ai-generated/{media_id}.png"

                image_data = base64.b64decode(b64_image)
                storage.write(key, image_data)
                image_url = storage.get_url(key)

                return GenerationResult(
                    success=True,
                    image_url=image_url,
                    image_base64=b64_image,
                    provider=ImageProvider.GOOGLE_IMAGEN,
                    metadata={"model": "imagen-3", "size": f"{request.width}x{request.height}"},
                )
        except Exception as e:
            return GenerationResult(
                success=False,
                error=str(e),
                provider=ImageProvider.GOOGLE_IMAGEN,
            )


class XAIGrokProvider(ImageGenerationProvider):
    """xAI Grok image generation provider."""

    def __init__(self):
        self.settings = get_settings()
        self.api_key = os.getenv("XAI_API_KEY")
        self.base_url = "https://api.x.ai/v1"

    def is_available(self) -> bool:
        return bool(self.api_key)

    def _build_prompt(self, request: GenerationRequest) -> str:
        style_modifiers = {
            ImageStyle.HYPERREALISTIC: "hyper-realistic, 8k, wedding photography, professional lighting",
            ImageStyle.PIXAR_3D: "Pixar 3D style, Disney animation, cinematic, volumetric lighting",
            ImageStyle.CARTOON: "cartoon style, vibrant, expressive, wedding illustration",
            ImageStyle.ARTISTIC: "artistic, digital painting, romantic wedding",
        }
        base = request.prompt
        style = style_modifiers.get(request.style, "")
        if request.negative_prompt:
            return f"{base}, {style}. Negative: {request.negative_prompt}"
        return f"{base}, {style}"

    async def generate(self, request: GenerationRequest) -> GenerationResult:
        if not self.is_available():
            return GenerationResult(success=False, error="xAI API key not configured", provider=ImageProvider.XAI_GROK)

        prompt = self._build_prompt(request)

        # xAI uses OpenAI-compatible API
        payload = {
            "model": "grok-2-image",
            "prompt": prompt,
            "n": 1,
            "size": f"{request.width}x{request.height}",
            "response_format": "b64_json",
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.base_url}/images/generations",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()

                b64_image = data["data"][0]["b64_json"]

                settings = get_settings()
                from .storage import get_storage
                storage = get_storage()
                media_id = uuid.uuid4().hex[:12]
                key = f"ai-generated/{media_id}.png"

                image_data = base64.b64decode(b64_image)
                storage.write(key, image_data)
                image_url = storage.get_url(key)

                return GenerationResult(
                    success=True,
                    image_url=image_url,
                    image_base64=b64_image,
                    provider=ImageProvider.XAI_GROK,
                    metadata={"model": "grok-2-image", "size": f"{request.width}x{request.height}"},
                )
        except Exception as e:
            return GenerationResult(
                success=False,
                error=str(e),
                provider=ImageProvider.XAI_GROK,
            )


class ReplicateProvider(ImageGenerationProvider):
    """Replicate provider for various models (SDXL, Flux, etc.)."""

    def __init__(self):
        self.settings = get_settings()
        self.api_key = os.getenv("REPLICATE_API_TOKEN")
        self.base_url = "https://api.replicate.com/v1"

    def is_available(self) -> bool:
        return bool(self.api_key)

    def _get_model(self, style: ImageStyle) -> str:
        models = {
            ImageStyle.HYPERREALISTIC: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            ImageStyle.PIXAR_3D: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            ImageStyle.CARTOON: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            ImageStyle.ARTISTIC: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        }
        return models.get(style, models[ImageStyle.HYPERREALISTIC])

    async def generate(self, request: GenerationRequest) -> GenerationResult:
        if not self.is_available():
            return GenerationResult(success=False, error="Replicate API token not configured", provider=ImageProvider.REPLICATE)

        prompt = request.prompt
        if request.negative_prompt:
            prompt += f" --neg {request.negative_prompt}"

        model = self._get_model(request.style)

        payload = {
            "version": model.split(":")[-1],
            "input": {
                "prompt": prompt,
                "width": request.width,
                "height": request.height,
                "num_outputs": 1,
                "guidance_scale": request.guidance_scale,
                "num_inference_steps": request.steps,
            },
        }

        if request.seed:
            payload["input"]["seed"] = request.seed

        try:
            async with httpx.AsyncClient(timeout=180.0) as client:
                # Start prediction
                response = await client.post(
                    f"{self.base_url}/predictions",
                    headers={
                        "Authorization": f"Token {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                response.raise_for_status()
                prediction = response.json()

                # Poll for completion
                prediction_id = prediction["id"]
                get_url = f"{self.base_url}/predictions/{prediction_id}"

                for _ in range(60):  # max 5 minutes
                    await httpx.AsyncClient().get(get_url, headers={"Authorization": f"Token {self.api_key}"})
                    result = response.json()
                    if result["status"] == "succeeded":
                        output_url = result["output"][0]
                        # Download and store
                        async with httpx.AsyncClient() as dl_client:
                            img_response = await dl_client.get(output_url)
                            img_response.raise_for_status()
                            image_data = img_response.content

                        settings = get_settings()
                        from .storage import get_storage
                        storage = get_storage()
                        media_id = uuid.uuid4().hex[:12]
                        key = f"ai-generated/{media_id}.png"
                        storage.write(key, image_data)
                        image_url = storage.get_url(key)

                        return GenerationResult(
                            success=True,
                            image_url=image_url,
                            provider=ImageProvider.REPLICATE,
                            metadata={"model": model, "size": f"{request.width}x{request.height}"},
                        )
                    elif result["status"] == "failed":
                        return GenerationResult(success=False, error=result.get("error", "Generation failed"), provider=ImageProvider.REPLICATE)

                    import asyncio
                    await asyncio.sleep(5)

                return GenerationResult(success=False, error="Timeout waiting for generation", provider=ImageProvider.REPLICATE)
        except Exception as e:
            return GenerationResult(success=False, error=str(e), provider=ImageProvider.REPLICATE)


class FalProvider(ImageGenerationProvider):
    """Fal.ai provider for fast inference."""

    def __init__(self):
        self.settings = get_settings()
        self.api_key = os.getenv("FAL_KEY")
        self.base_url = "https://fal.run/fal-ai"

    def is_available(self) -> bool:
        return bool(self.api_key)

    def _get_endpoint(self, style: ImageStyle) -> str:
        endpoints = {
            ImageStyle.HYPERREALISTIC: "fal-ai/flux-pro/v1.1",
            ImageStyle.PIXAR_3D: "fal-ai/flux-pro/v1.1",
            ImageStyle.CARTOON: "fal-ai/flux-pro/v1.1",
            ImageStyle.ARTISTIC: "fal-ai/flux-pro/v1.1",
        }
        return endpoints.get(style, "fal-ai/flux-pro/v1.1")

    async def generate(self, request: GenerationRequest) -> GenerationResult:
        if not self.is_available():
            return GenerationResult(success=False, error="Fal.ai key not configured", provider=ImageProvider.FAL)

        prompt = request.prompt
        if request.negative_prompt:
            prompt += f" Negative: {request.negative_prompt}"

        endpoint = self._get_endpoint(request.style)

        payload = {
            "prompt": prompt,
            "image_size": f"{request.width}x{request.height}",
            "num_inference_steps": request.steps,
            "guidance_scale": request.guidance_scale,
            "num_images": 1,
        }

        if request.seed:
            payload["seed"] = request.seed

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.base_url}/{endpoint}",
                    headers={
                        "Authorization": f"Key {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()

                image_url = data["images"][0]["url"]

                # Download and store locally
                async with httpx.AsyncClient() as dl_client:
                    img_response = await dl_client.get(image_url)
                    img_response.raise_for_status()
                    image_data = img_response.content

                settings = get_settings()
                from .storage import get_storage
                storage = get_storage()
                media_id = uuid.uuid4().hex[:12]
                key = f"ai-generated/{media_id}.png"
                storage.write(key, image_data)
                local_url = storage.get_url(key)

                return GenerationResult(
                    success=True,
                    image_url=local_url,
                    provider=ImageProvider.FAL,
                    metadata={"model": "flux-pro", "size": f"{request.width}x{request.height}"},
                )
        except Exception as e:
            return GenerationResult(success=False, error=str(e), provider=ImageProvider.FAL)


class ImageGenerationService:
    """Main service orchestrating multiple providers."""

    def __init__(self):
        self.providers: Dict[ImageProvider, ImageGenerationProvider] = {
            ImageProvider.OPENAI_DALLE: OpenAIImageProvider(),
            ImageProvider.GOOGLE_IMAGEN: GoogleImagenProvider(),
            ImageProvider.XAI_GROK: XAIGrokProvider(),
            ImageProvider.REPLICATE: ReplicateProvider(),
            ImageProvider.FAL: FalProvider(),
        }

    def get_available_providers(self) -> List[ImageProvider]:
        return [p for p, provider in self.providers.items() if provider.is_available()]

    async def generate(
        self,
        request: GenerationRequest,
        preferred_provider: Optional[ImageProvider] = None,
        fallback: bool = True,
    ) -> GenerationResult:
        """Generate image with preferred provider, fallback to others if needed."""

        providers_to_try = []
        if preferred_provider and preferred_provider in self.providers:
            providers_to_try.append(preferred_provider)

        if fallback:
            for p in self.get_available_providers():
                if p not in providers_to_try:
                    providers_to_try.append(p)

        if not providers_to_try:
            return GenerationResult(success=False, error="No image generation providers configured")

        last_error = None
        for provider_enum in providers_to_try:
            provider = self.providers[provider_enum]
            if not provider.is_available():
                continue

            result = await provider.generate(request)
            if result.success:
                return result
            last_error = result.error

        return GenerationResult(
            success=False,
            error=f"All providers failed. Last error: {last_error}",
            provider=providers_to_try[-1] if providers_to_try else None,
        )


# Global instance
image_generation_service = ImageGenerationService()