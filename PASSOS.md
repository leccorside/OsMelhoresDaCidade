# PLANO DE EXECUÇÃO — OS MELHORES DA CIDADE

Este documento registra o progresso sistemático de cada uma das 17 etapas definidas no `PROMPT.md`.

---

## 📌 Status das Etapas

| Passo | Descrição | Status | Critérios de Aceitação & Validação |
|---|---|---|---|
| **PASSO 1** | Arquitetura, Monorepo e SEO Inicial | **CONCLUÍDO** | Monorepo criado, Next.js 15 App Router configurado, NestJS configurado, Prisma Schema modelado com todas as entidades, Docker & Docker Compose definidos, utilitários de SEO e documentação (`CONTEXTO.md`, `DOCUMENTACAO.md`, `PASSOS.md`, `README.md`). |
| **PASSO 2** | Design System & Componentes Base | **CONCLUÍDO** | Implementação fiel da identidade visual do Google Stitch (`DESIGN.md`), cores institucionais (#FF3B4F, #D91F35, #171717, #10B981, #F59E0B), tipografia Inter, componentes `Button`, `Badge`, `StarRating`, `Breadcrumbs`, `ListingCard`, `EventCard`, `CategoryCard`, `OmniSearchBar`, `Header`, `Footer`, e bottom bar mobile PWA (`MobileNav`). |
| **PASSO 3** | Geografia & Cidades | **CONCLUÍDO** | Módulo de Geografia implementado no NestJS (`GeographyController` e `GeographyService`), rotas de estados, cidades IBGE e bairros, seed de base de dados com Caldas Novas (GO) e bairros, store client Zustand com persistência em LocalStorage (`cityStore.ts`) e serviço de integração (`geography.ts`). |
| **PASSO 4** | Autenticação & RBAC | **CONCLUÍDO** | Módulo de Autenticação (`AuthModule`) no NestJS com Argon2, JWT e refresh tokens rotativos no PostgreSQL, controle RBAC (`RolesGuard`, `JwtAuthGuard`), endpoints de registro, login, refresh, logout, verificação de e-mail e recuperação de senha. No frontend, criação de `authStore.ts`, serviço `auth.ts` e páginas de Login e Cadastro (`/login` e `/cadastro`). |
| **PASSO 5** | Portal Público | **CONCLUÍDO** | Implementação completa do portal público: Home Nacional, Home Municipal, Diretório Geral de Lugares (`/[city]/lugares`) com filtros por categoria/bairro/preço/ordem e sidebar idêntica ao Stitch, Página de Categorias (`/[city]/categorias`), Página de Categoria Específica (`/[city]/lugares/[category]`) e Detalhes do Estabelecimento (`/[city]/lugar/[slug]`) com galeria, horários, comodidades, cardápio, contatos diretos (WhatsApp/Telefone) e Schema.org JSON-LD. No NestJS, criação do `ListingsModule` com listagem filtrada e busca textual. |
| **PASSO 6** | Estabelecimentos & Catálogo | **CONCLUÍDO** | Modelagem e regras de negócio de estabelecimentos: CRUD, horários de funcionamento, comodidades, itens de serviço/cardápio, métricas diárias, fotos e campos dedicados de SEO individual (slug, metaTitle, metaDescription) validados e moderáveis. |
| **PASSO 7** | Painel do Comerciante | **CONCLUÍDO** | Layout administrativo com sidebar e navegação (`/comerciante`), Dashboard consolidado com métricas de cliques em WhatsApp, rotas e visualizações, tabela de estabelecimentos com status (Publicado/Moderação) e tela completa de cadastro (`/comerciante/estabelecimentos/novo`). |
| **PASSO 8** | Eventos & Agenda Cultural | **CONCLUÍDO** | Módulo de Eventos (`EventsModule`) no NestJS com filtragem por data, cidade e gratuidade. No frontend, criação de `events.ts`, Agenda de Eventos (`/[city]/eventos`) com filtros e visualização calendário, e Detalhes do Evento (`/[city]/eventos/[slug]`) com lineup, ingressos oficiais, local e Schema.org JSON-LD `Event`. |
| **PASSO 9** | Avaliações & Favoritos | **CONCLUÍDO** | Módulos `ReviewsModule` e `FavoritesModule` no NestJS. Regra de unicidade de avaliação por usuário/local com recálculo automático de rating e suporte a respostas de comerciantes. Favoritos de estabelecimentos e eventos salvos com endpoints dedicados. |
| **PASSO 10** | Painel do Usuário | **CONCLUÍDO** | Área autenticada do usuário (`/app`) com layout responsivo e sidebar, Dashboard com métricas de favoritos e eventos, tela de Lugares Favoritos (`/app/favoritos`) e tela de Histórico de Avaliações (`/app/avaliacoes`) com exibição de réplicas do estabelecimento. |
| **PASSO 11** | Painel Administrador Master | *Aguardando* | Gestão global (`/admin`), aprovação e moderação de comerciantes, estabelecimentos, eventos, categorias e cidades. |
| **PASSO 12** | CMS: Blog & Banners | *Aguardando* | Módulo de notícias/artigos com editor, tags, categorias, vinculação por município e gestão de banners publicitários. |
| **PASSO 13** | SEO Avançado & Otimizações | *Aguardando* | Auditoria e aprimoramento de sitemap XML com múltiplos índices, JSON-LD completo em todas as entidades e tags canônicas. |
| **PASSO 14** | PWA & Offline Support | *Aguardando* | Configuração refinada do Service Worker, instalação facilitada no Android e iOS, suporte a telas offline. |
| **PASSO 15** | Mapas & Métricas Locais | *Aguardando* | Integração de Leaflet e OpenStreetMap com marcadores interativos e agregação de cliques de contato e rotas. |
| **PASSO 16** | Internacionalização (i18n) | *Aguardando* | Suporte multilíngue para Português (padrão), Inglês e Espanhol com rotas localizadas e tags `hreflang`. |
| **PASSO 17** | Finalização, Testes & Deploy | *Aguardando* | Bateria de testes automatizados, validação de segurança, build de produção e checklist completo de entrega. |

