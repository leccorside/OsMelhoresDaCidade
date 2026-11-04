# PLANO DE EXECUÇÃO — OS MELHORES DA CIDADE

Este documento registra o progresso sistemático de cada uma das 17 etapas definidas no `PROMPT.md`.

---

## 📌 Status das Etapas

| Passo | Descrição | Status | Critérios de Aceitação & Validação |
|---|---|---|---|
| **PASSO 1** | Arquitetura, Monorepo e SEO Inicial | **CONCLUÍDO** | Monorepo criado, Next.js 15 App Router configurado, NestJS configurado, Prisma Schema modelado com todas as entidades, Docker & Docker Compose definidos, utilitários de SEO e documentação (`CONTEXTO.md`, `DOCUMENTACAO.md`, `PASSOS.md`, `README.md`). |
| **PASSO 2** | Design System & Componentes Base | *Aguardando* | Implementação da identidade visual do Stitch (`DESIGN.md`), cores (#FF3B4F, #D91F35, #171717), botões, cards editoriais, badges, header, footer e layout responsivo. |
| **PASSO 3** | Geografia & Cidades | *Aguardando* | Módulo de estados, cidades (IBGE) e bairros no backend e rotas dinâmicas municipais no frontend com persistência de cidade no cliente. |
| **PASSO 4** | Autenticação & RBAC | *Aguardando* | JWT com access/refresh tokens rotativos, Argon2, perfis USER, MERCHANT e ADMIN, verificação de e-mail e rotas protegidas. |
| **PASSO 5** | Portal Público | *Aguardando* | Página nacional, home municipal de Caldas Novas, listagem com filtros, diretório de categorias e busca otimizada. |
| **PASSO 6** | Estabelecimentos & Catálogo | *Aguardando* | CRUD de estabelecimentos, galeria de fotos, horários de funcionamento, cardápios, serviços, comodidades e SEO por local. |
| **PASSO 7** | Painel do Comerciante | *Aguardando* | Dashboard do comerciante (`/comerciante`), métricas de cliques/visualizações, gestão de estabelecimentos e respostas a avaliações. |
| **PASSO 8** | Eventos & Agenda Cultural | *Aguardando* | Módulo de eventos, agenda por data/categoria, moderação administrativa e SEO de eventos Schema.org. |
| **PASSO 9** | Avaliações & Favoritos | *Aguardando* | Avaliações de 1 a 5 estrelas, controle de uma avaliação por usuário/local, respostas do comerciante e sistema de favoritos. |
| **PASSO 10** | Painel do Usuário | *Aguardando* | Área autenticada do usuário (`/app`), gestão de favoritos, histórico de avaliações, eventos salvos e preferências. |
| **PASSO 11** | Painel Administrador Master | *Aguardando* | Gestão global (`/admin`), aprovação e moderação de comerciantes, estabelecimentos, eventos, categorias e cidades. |
| **PASSO 12** | CMS: Blog & Banners | *Aguardando* | Módulo de notícias/artigos com editor, tags, categorias, vinculação por município e gestão de banners publicitários. |
| **PASSO 13** | SEO Avançado & Otimizações | *Aguardando* | Auditoria e aprimoramento de sitemap XML com múltiplos índices, JSON-LD completo em todas as entidades e tags canônicas. |
| **PASSO 14** | PWA & Offline Support | *Aguardando* | Configuração refinada do Service Worker, instalação facilitada no Android e iOS, suporte a telas offline. |
| **PASSO 15** | Mapas & Métricas Locais | *Aguardando* | Integração de Leaflet e OpenStreetMap com marcadores interativos e agregação de cliques de contato e rotas. |
| **PASSO 16** | Internacionalização (i18n) | *Aguardando* | Suporte multilíngue para Português (padrão), Inglês e Espanhol com rotas localizadas e tags `hreflang`. |
| **PASSO 17** | Finalização, Testes & Deploy | *Aguardando* | Bateria de testes automatizados, validação de segurança, build de produção e checklist completo de entrega. |

