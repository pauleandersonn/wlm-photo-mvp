# We Love Memory — Foto Lembrança MVP

Sistema de foto lembrança digital para casamentos com montagem clássica e IA generativa.

## Arquitetura

```
wlm-photo-mvp/
├── apps/
│   ├── web/          # Next.js 14 + React 18 + Tailwind
│   └── api/          # FastAPI + SQLAlchemy + Alembic
└── packages/
    └── shared/       # Tipos compartilhados (futuro)
```

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2 |
| Banco | SQLite (dev) / PostgreSQL (prod) via Supabase |
| Storage | Local (dev) / Supabase Storage (prod) |
| Queue | Redis + RQ (para jobs de IA) |

## Funcionalidades MVP

- ✅ Cadastro de eventos (nomes, data, local, foto dos noivos)
- ✅ Captura de foto do convidado (câmera, upload, galeria)
- ✅ Montagem clássica 10×15 (Canvas 1200×1800 @ 300 DPI)
- ✅ Montagem IA (placeholder para 🍌 Nano Banana 2.1)
- ✅ Galeria com prévia, aprovação, regeneração
- ✅ Entrega digital por QR Code individual
- ✅ 4 temas visuais: Champagne, Minimalist, Botanical, Black Tie
- ✅ 3 estilos IA: Hiper-realista, Pixar 3D, Cartoon

## Instalação Rápida

### Pré-requisitos
- Node.js 18.17+
- Python 3.10+
- Redis (opcional, para queue de IA)

### Frontend (Next.js)
```bash
cd apps/web
npm install
npm run dev
# http://localhost:3000
```

### Backend (FastAPI)
```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e .
# ou: pip install -r requirements.txt
uvicorn wlm_api.main:app --reload
# http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Banco de dados
```bash
cd apps/api
alembic upgrade head
```

## Variáveis de Ambiente

### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`apps/api/.env`)
```env
DATABASE_URL=sqlite+aiosqlite:///./wlm.db
SECRET_KEY=dev-secret-change-in-production
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
SUPABASE_BUCKET=wlm-assets
REDIS_URL=redis://localhost:6379/0
AI_API_URL=
AI_API_KEY=
```

## Endpoints Principais

### Eventos
- `POST /api/v1/events` — Criar evento
- `GET /api/v1/events` — Listar eventos
- `GET /api/v1/events/{id}` — Obter evento
- `PATCH /api/v1/events/{id}` — Atualizar evento

### Memórias
- `POST /api/v1/memories` — Criar memória (inicia processamento)
- `GET /api/v1/memories?event_id=` — Listar memórias do evento
- `GET /api/v1/memories/{id}` — Obter memória
- `GET /api/v1/memories/by-token/{token}` — Obter por token de entrega
- `POST /api/v1/memories/{id}/approve` — Aprovar memória
- `POST /api/v1/memories/{id}/regenerate` — Regenerar (IA)

### Jobs
- `GET /api/v1/jobs?event_id=` — Listar jobs
- `GET /api/v1/jobs/{id}` — Obter job
- `GET /api/v1/jobs/{id}/status` — Status do job

### Upload
- `POST /api/v1/upload/guest-photo` — Upload foto convidado
- `POST /api/v1/upload/events/{id}/couple-photo` — Upload foto noivos
- `GET /api/v1/upload/serve/{path}` — Servir arquivo

### Tasks (Processamento)
- `POST /api/v1/tasks/process-classic/{memory_id}` — Processar montagem clássica
- `POST /api/v1/tasks/process-ai/{memory_id}` — Processar montagem IA

## Desenvolvimento

### Estrutura do Frontend
```
apps/web/src/
├── app/              # App Router (Next.js 14)
│   ├── layout.tsx
│   ├── page.tsx      # Página principal (SPA)
│   └── globals.css
├── components/       # Componentes React
│   ├── CaptureStation.tsx
│   ├── GalleryAndDelivery.tsx
│   ├── EventAdmin.tsx
│   └── QRCodeCard.tsx
├── lib/              # Utilitários
│   ├── api.ts        # Cliente API
│   ├── constants.ts  # Temas, defaults
│   └── montageEngine.ts  # Canvas rendering
├── types/            # Tipos TypeScript
└── hooks/            # Custom hooks (futuro)
```

### Estrutura do Backend
```
apps/api/src/wlm_api/
├── config.py         # Settings (Pydantic Settings)
├── db.py             # Database (SQLAlchemy async)
├── models.py         # Models (SQLAlchemy 2.0)
├── schemas.py        # Schemas (Pydantic v2)
├── main.py           # FastAPI app
├── services/
│   ├── storage.py    # Storage abstraction (Local/Supabase)
│   └── montage.py    # Montage engine (PIL)
└── routers/
    ├── events.py
    ├── memories.py
    ├── jobs.py
    ├── upload.py
    └── tasks.py
```

## Próximos Passos para Produção

1. **Autenticação** — JWT + roles (admin, operator)
2. **Supabase** — PostgreSQL + Storage + Auth
3. **IA Real** — Integração 🍌 Nano Banana 2.1 via worker RQ
4. **Consentimento LGPD** — Checkbox + timestamp + exclusão
5. **HTTPS + Domínio** — Deploy Fly.io + Cloudflare
6. **Testes E2E** — Playwright para fluxos críticos
7. **Monitoramento** — Sentry + Logs estruturados

## Licença

Proprietário — We Love Memory