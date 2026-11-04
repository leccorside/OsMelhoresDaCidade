# Os Melhores da Cidade 🌟

Plataforma multicidades de alta performance para descoberta de gastronomia, eventos, hospedagem e comércios locais em municípios brasileiros, iniciando por **Caldas Novas (GO)** e desenhada para expansão nacional.

---

## 🚀 Tecnologias Principais

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, TanStack Query, Zustand, Lucide React, Leaflet.
- **Backend**: NestJS 11, TypeScript, Prisma ORM 6, PostgreSQL 16, JWT, Argon2, Swagger/OpenAPI.
- **Infraestrutura**: Docker & Docker Compose, Nginx.
- **Diferencial Arquitetural**: SEO Nativo de alta performance (SSR, SSG, ISR, Schema.org JSON-LD), PWA instalável, isolamento multi-tenant por município.

---

## 📦 Estrutura do Monorepo

```text
os-melhores-da-cidade/
├── apps/
│   ├── web/        # Aplicação Next.js 15 com App Router e SEO
│   └── api/        # Backend NestJS 11 com Prisma ORM
├── packages/
│   └── shared/     # Tipos, enums e contratos compartilhados
├── docker/         # Dockerfiles e configuração Nginx
├── docker-compose.yml
├── CONTEXTO.md     # Visão geral e decisões técnicas
├── DOCUMENTACAO.md # Guia completo de instalação e arquitetura
├── PASSOS.md       # Acompanhamento das etapas do projeto
└── README.md
```

---

## 🛠️ Como Iniciar

### Com Docker Compose (Recomendado)

```bash
docker compose up -d --build
```

Acesse:
- **Frontend**: [http://localhost](http://localhost) (ou [http://localhost:3000](http://localhost:3000))
- **API REST**: [http://localhost/api/v1](http://localhost/api/v1)
- **Documentação Swagger**: [http://localhost/docs](http://localhost/docs)

---

## 📄 Licença

Uso proprietário sob demanda para a plataforma **Os Melhores da Cidade**.

