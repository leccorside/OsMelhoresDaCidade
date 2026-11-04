# DOCUMENTAÇÃO TÉCNICA — OS MELHORES DA CIDADE

## 1. Guia de Instalação e Execução

### Pré-requisitos
- Node.js 20+ ou 22+ LTS
- Docker e Docker Compose instalados
- NPM 10+

### Instalação das Dependências
Para instalar todas as dependências do monorepo:
```bash
npm install
```

### Inicialização com Docker Compose (Recomendado)
Para subir todos os serviços orquestrados (PostgreSQL, Backend NestJS, Frontend Next.js e Nginx):
```bash
docker compose up -d --build
```
Após a inicialização:
- **Portal Web**: `http://localhost` (ou `http://localhost:3000`)
- **API REST**: `http://localhost/api/v1` (ou `http://localhost:3333/api/v1`)
- **Swagger UI**: `http://localhost/docs` (ou `http://localhost:3333/docs`)

### Execução em Modo de Desenvolvimento Local (Sem Docker)
1. Inicie a base de dados PostgreSQL e configure o arquivo `.env`.
2. Execute as migrações e geração do client Prisma:
   ```bash
   cd apps/api
   npx prisma generate
   npx prisma migrate dev
   ```
3. Inicie o backend:
   ```bash
   npm run dev:api
   ```
4. Em outro terminal, inicie o frontend:
   ```bash
   npm run dev:web
   ```

---

## 2. Estrutura do Banco de Dados (Prisma ORM)

O banco relacional PostgreSQL gerencia todo o ciclo de vida da plataforma através das seguintes entidades:
- **Geografia**: `states`, `cities`, `neighborhoods`, `city_settings`.
- **Autenticação e Perfis**: `users`, `merchant_profiles`, `refresh_tokens`, `email_verification_tokens`, `password_reset_tokens`.
- **Estabelecimentos**: `categories`, `subcategories`, `listings`, `listing_owners`, `listing_images`, `listing_opening_hours`, `listing_special_hours`, `amenities`, `listing_amenities`, `listing_social_links`, `listing_service_categories`, `listing_service_items`, `listing_revisions`.
- **Eventos**: `event_categories`, `events`, `event_images`.
- **Interações**: `favorites`, `event_favorites`, `reviews`, `review_replies`, `review_reports`.
- **CMS e Comunicação**: `blog_categories`, `blog_tags`, `blog_posts`, `banners`, `contact_messages`.
- **Métricas e Configurações**: `app_settings`, `listing_daily_metrics`, `event_daily_metrics`.

---

## 3. Arquitetura de SEO e Renderização (Next.js 15)

### Estratégia de Renderização
1. **SSG / ISR para Cidades e Estabelecimentos**:
   - Rota: `/[city]` e `/[city]/lugar/[slug]`
   - `revalidate = 3600` (atualização automática em segundo plano a cada 1 hora).
   - Renderização inicial do lado do servidor fornecendo HTML puro com títulos, descrições, imagens e dados estruturados para rastreadores (Googlebot, Bingbot).
2. **Dynamic Sitemap (`/sitemap.xml`)**:
   - Gerado dinamicamente via `apps/web/src/app/sitemap.ts`, listando apenas cidades ativas, estabelecimentos aprovados e páginas institucionais com canonical e prioridades adequadas.
3. **Robots (`/robots.txt`)**:
   - Configurado via `apps/web/src/app/robots.ts`, autorizando indexação pública e protegendo rotas privadas (`/app/`, `/comerciante/`, `/admin/`, `/api/`).
4. **Schema.org JSON-LD**:
   - Utilitário centralizado em `apps/web/src/lib/seo.ts` com geradores para `WebPage`, `BreadcrumbList` e `LocalBusiness`.

---

## 4. PWA (Progressive Web App)
- Gerado em `apps/web/src/app/manifest.ts`.
- Identidade visual com cor de tema `#FF3B4F`, ícones 192x192 e 512x512 maskable, modo de exibição `standalone`.
- Suporte a experiência app-like mobile com bottom bar ergonômica.

