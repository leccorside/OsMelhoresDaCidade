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

O projeto utiliza um bloco dedicado de portas (**4100 a 4103**) para não conflitar com nenhum outro projeto local (Apache, PostgreSQL padrão, outros apps Node/React):

```bash
docker compose up -d --build
```

Acesse:
- **Gateway Principal (Nginx)**: [http://localhost:4100](http://localhost:4100) (Portal completo unificado)
- **Frontend Direto (Next.js)**: [http://localhost:4101](http://localhost:4101)
- **API REST Direta (NestJS)**: [http://localhost:4102/api/v1](http://localhost:4102/api/v1)
- **Documentação Swagger**: [http://localhost:4100/docs](http://localhost:4100/docs) (ou direto em [http://localhost:4102/docs](http://localhost:4102/docs))
- **PostgreSQL**: `localhost:4103` (user: `postgres`, pass: `postgres`, db: `os_melhores_da_cidade`)

---

## 📄 Licença

Uso proprietário sob demanda para a plataforma **Os Melhores da Cidade**.

