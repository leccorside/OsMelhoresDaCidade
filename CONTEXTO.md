# CONTEXTO DO PROJETO — OS MELHORES DA CIDADE

## 1. Visão Geral
**Os Melhores da Cidade** é uma plataforma digital brasileira multicidades desenhada para funcionar como um portal e guia de referência em gastronomia, turismo, lazer, eventos, hospedagens e comércio local. A aplicação tem como ponto de partida inicial a cidade turística de **Caldas Novas (GO)**, sendo projetada arquiteturalmente para operar em milhares de municípios brasileiros sob uma única base de código, garantindo isolamento contextual e geográfico para cada cidade.

## 2. Arquitetura do Sistema
O projeto é estruturado em um monorepo modular e desacoplado:
- **`apps/web`**: Frontend moderno com React 19, Next.js 15 (App Router), Tailwind CSS, Framer Motion e Lucide React. Responsável pela renderização de alta performance, SEO dinâmico, metadados, suporte a PWA e interface para os visitantes.
- **`apps/api`**: Backend robusto em NestJS com TypeScript, Prisma ORM, PostgreSQL, autenticação JWT com refresh tokens rotativos, Argon2, validação estrita com DTOs e documentação interativa Swagger.
- **`packages/shared`**: Biblioteca compartilhada de tipos TypeScript, contratos de dados, enums e utilitários de SEO.
- **`docker/`**: Configurações de containerização para PostgreSQL 16, backend NestJS, frontend Next.js e Nginx como proxy reverso integrado.

## 3. Stack Tecnológica
- **Linguagem Principal**: TypeScript 5+
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, TanStack Query, Zustand, React Hook Form, Zod, Lucide React, Framer Motion, Recharts, Leaflet / OpenStreetMap.
- **Backend**: NestJS 11, Prisma ORM 6, PostgreSQL 16, Passport JWT, Argon2, Helmet, Sharp.
- **Infraestrutura**: Docker & Docker Compose, Nginx Alpine.

## 4. Decisões Técnicas
- **Abordagem Monorepo**: Compartilhamento centralizado de modelos de dados e tipagens entre API e Web via NPM Workspaces.
- **Simplicidade Operacional Sem Filas Pesadas**: Conforme especificação restrita do projeto, não são utilizadas filas ou serviços complexos adicionais como Redis, BullMQ ou microsserviços. Métricas e agendamentos são tratados com persistência relacional otimizada no PostgreSQL.
- **Multi-tenant Geográfico**: O contexto municipal é definido no roteamento (`/[city]`), garantindo escopo geográfico isolado em consultas SQL com índices compostos `[cityId, slug]`.

## 5. Estratégia de SEO e Renderização
- **SSR (Server-Side Rendering)**: Para páginas com conteúdo dinâmico que mudam frequentemente.
- **SSG / ISR (Incremental Static Regeneration)**: Páginas de cidades e estabelecimentos possuem revalidação incremental periódica (`revalidate = 3600`), entregando velocidade instantânea de CDN com HTML completo pré-renderizado para o Googlebot e Bingbot.
- **Metadados Dinâmicos (Metadata API)**: Geração automatizada de `title`, `description`, `canonical`, `openGraph`, `twitter` e `alternates`.
- **JSON-LD Schema.org**: Implementação estruturada de `WebPage`, `LocalBusiness`, `Restaurant`, `Event` e `BreadcrumbList`.

## 6. PWA (Progressive Web App)
- Suporte nativo via `manifest.webmanifest`, ícones adaptativos (maskable) 192x192 e 512x512, service worker para cache inteligente e visual mobile imersivo simulando aplicativo nativo com barra de navegação inferior.

## 7. Perfis e Funcionalidades
1. **Público**: Descoberta de locais, busca preditiva, filtros por categorias, visualização de mapa interativo e agenda de eventos.
2. **Usuário Autenticado (`USER`)**: Gestão de favoritos, avaliações com notas de 1 a 5, respostas e eventos salvos (`/app`).
3. **Comerciante (`MERCHANT`)**: Gestão de seus estabelecimentos, cardápios, serviços, horários de funcionamento, respostas a avaliações e métricas de conversão (`/comerciante`).
4. **Administrador (`ADMIN`)**: Gestão master de cidades, aprovação e moderação de estabelecimentos, eventos, avaliações, blog CMS, banners e painel dedicado de SEO (`/admin`).

## 8. Pendências e Próximos Passos
- Execução sequencial dos passos de desenvolvimento (Design System, Módulo Geográfico, Autenticação, Telas Públicas, Painéis e Otimizações Finais).

