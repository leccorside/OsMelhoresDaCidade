---
name: Urban Discovery Narrative
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#5c3f3f'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#916f6e'
  outline-variant: '#e5bdbc'
  surface-tint: '#bf002b'
  primary: '#ba002a'
  on-primary: '#ffffff'
  primary-container: '#e1223d'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb3b2'
  secondary: '#bb0025'
  on-secondary: '#ffffff'
  secondary-container: '#e02639'
  on-secondary-container: '#fffbff'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad9'
  primary-fixed-dim: '#ffb3b2'
  on-primary-fixed: '#410008'
  on-primary-fixed-variant: '#92001f'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b0'
  on-secondary-fixed: '#410007'
  on-secondary-fixed-variant: '#92001b'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 2rem
  margin-lg: 4rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system drives a premium, authoritative Brazilian metropolitan guide and commercial directory. The tone reflects the warmth, dynamism, and sophistication of contemporary Brazilian culture, blending high-end curation with approachable utility. It rejects cluttered traditional directory tropes in favor of an editorial, high-contrast digital lifestyle publication.

The aesthetic marries Modern Corporate reliability with refined lifestyle minimalism:
- **Tone:** Discerning, celebratory, precise, and effortlessly hospitable.
- **Visual Stance:** Crisp white surfaces, authoritative high-contrast typography, generous negative space, and vibrant, tropical-adjacent focal accents (Coral Red and Emerald Green).
- **User Reaction:** Trust in verified curation, sensory excitement about culinary and cultural exploration, and seamless spatial orientation across desktop and mobile.

## Colors

The palette balances vibrant editorial energy with functional clarity, avoiding visual noise while highlighting verified merchant data and photography.

### Palette Architecture
- **Primary Brand (`#FF3B4F`):** Used strictly for high-impact brand anchors, primary action buttons, pinned map markers, and interactive micro-highlights.
- **Hover & Accent (`#D91F35`):** Reserved for interactive states, focused states of primary actions, and deep crimson textural gradients.
- **Tertiary Accent (`#F59E0B`):** Dedicated to verified review scores, star aggregations, and editorial "Destaque" (Featured) badges.
- **Functional Success (`#10B981`):** Applied exclusively to live operational statuses like "Aberto agora" (Open now) and verified checkmarks.
- **Neutral Dark (`#171717`):** Primary canvas contrast used for editorial typography, dominant icons, top navigational banners, and structural footers.
- **Neutral Muted (`#777777`):** Applied to metadata, category breadcrumbs, neighborhood paths, and subtle icon accents.
- **Background Secondary (`#F8F9FA` / `#F5F5F5`):** Structural canvas tone separating content clusters and supporting search parameter panels.
- **Surface (`#FFFFFF`):** High-clarity elevated cards, dialog sheets, and discovery panels.

## Typography

The typographic hierarchy relies solely on **Inter** to project systematic precision, international legibility, and architectural rigor. 

### Hierarchy Guidelines
- **Display & Large Headlines:** Tracked tightly (-0.02em to -0.03em) with bold and extra-bold weights to anchor curated city editorial sections, guide covers, and destination headers.
- **Card & Section Titles (`headline-md`, `headline-sm`):** Built with semi-bold weights for rapid scanning in density-packed listing grids.
- **Editorial Copy (`body-lg`, `body-md`):** Balanced line-heights ensure effortless reading of long-form critic reviews and historical context.
- **Badges, Badging & Tags (`label-sm`, `label-md`):** Uppercase tracking with heavier weights (`700`) for operational badges (e.g., "ABERTO AGORA", "TOP 10", "RESERVAS").

## Layout & Spacing

The structural layout utilizes a responsive 12-column grid system paired with strict 8pt spatial pacing.

### Layout Mechanics
- **Desktop (>=1280px):** 12-column grid, max-width `1280px`, outer margin `margin-lg` (64px), column gutter `gutter-lg` (32px). Allows side-by-side split screens for interactive map browsing.
- **Tablet (768px - 1279px):** 8-column grid, dynamic container widths, outer margin `margin-md` (32px), column gutter `gutter` (24px).
- **Mobile (<768px):** 4-column fluid grid, outer margin `margin` (16px), column gutter `gutter-sm` (16px). Bottom sheets, horizontally scrolling carousels with peek margins, and sticky booking navigation.

### Vertical Cadence
- Content sections inside venue pages and guide landing pages maintain `space-xl` separation.
- Component-level spacing (within directory cards, modal sheets, and filter pills) strictly utilizes `space-xs` through `space-md`.

## Elevation & Depth

Visual hierarchy uses a refined hybrid approach: crisp, low-contrast structural boundaries reinforced by warm, atmospheric ambient shadows.

### Elevation Hierarchy
- **Level 0 (Flat Canvas):** Used for base page backgrounds (`#F8F9FA`) and contextual backdrops.
- **Level 1 (Card & Content Surface):** White surface (`#FFFFFF`) with a hairline border (`1px solid #F1F3F5`) and ambient drop: `0px 2px 8px -1px rgba(23, 23, 23, 0.04), 0px 1px 3px 0px rgba(23, 23, 23, 0.02)`.
- **Level 2 (Interactive Hover & Context Menus):** Applied when hovering over cards, filter popovers, or floating search triggers: `0px 12px 24px -4px rgba(23, 23, 23, 0.08), 0px 4px 8px -2px rgba(23, 23, 23, 0.03)`.
- **Level 3 (Sticky Navbars, Bottom Bars, Floating Maps):** Floating interactive chrome: `0px 20px 32px -6px rgba(23, 23, 23, 0.12), 0px 8px 12px -3px rgba(23, 23, 23, 0.04)`.
- **Level 4 (Modals, Lightboxes & Booking Drawers):** Heavy diffuse elevation combined with backdrop blur: `0px 32px 64px -12px rgba(23, 23, 23, 0.24)`.

## Shapes

The interface balances soft geometry with organic consumer accessibility. Base cards, containers, and modules adopt a modern rounded feel, while active pill shapes are reserved for action buttons, chips, and metadata flags.

### Shape Assignment
- **Directory Listing & Venue Cards:** `rounded-lg` (16px / 1rem) for an approachable, editorial look.
- **Hero Image Containers & Category Tiles:** `rounded-xl` (24px / 1.5rem) to frame architectural and culinary photography smoothly.
- **Buttons, Filter Pills, Quick Filters & Badges:** Fully rounded capsules (`9999px` / `rounded-full`) for tap ergonomics on mobile screens.
- **Input Fields & Search Bars:** `rounded-xl` for prominent omni-search banners; `rounded-md` for standard forms.

## Components

### Buttons
- **Primary:** Coral Red (`#FF3B4F`) fill, pure white text, pill shape (`rounded-full`), padded `12px 24px`. Hover moves to Dark Crimson (`#D91F35`) with an interactive micro-lift (`translate-y(-1px)`).
- **Secondary / Ghost:** Transparent fill, `1.5px` border in `#E5E7EB`, text `#171717`. On hover: surface transitions to `#F8F9FA` with border color `#171717`.
- **Destructive / Booking Direct:** Dark Crimson (`#D91F35`) or Charcoal Black (`#171717`) for high-intent actions (e.g., "Reservar Mesa").

### Status & Verification Badges
- **Status (Aberto agora):** Soft emerald background (`rgba(16, 185, 129, 0.1)`), emerald green label (`#10B981`), `rounded-full`, accompanied by an animated pulsing `6px` green dot.
- **Featured / Curated (Destaque):** Rich amber background (`rgba(245, 158, 11, 0.12)`), text and star icon `#F59E0B`.
- **Category Tag:** Minimal `#F1F3F5` background with Slate Grey text (`#777777`) and `#171717` on hover.

### Directory Listing Cards
- **Structure:** Crisp white surface (`#FFFFFF`), `1px` subtle outline (`#E5E7EB`), `rounded-lg` (16px) overflow containment.
- **Media Header:** 16:10 aspect ratio image with top floating badges (Status on top-left, Favorite heart button on top-right).
- **Content Area:** Neighborhood breadcrumb (`body-sm`), Establishment Name (`headline-sm`), Star Rating (`#F59E0B` icon + numerical value in `label-md`), and cuisine/price tier indicator (`$$$ • Frutos do Mar`).

### Filter Chips
- Capsule-shaped (`rounded-full`), padding `8px 16px`. Default state: `#FFFFFF` fill with `1px` border (`#E5E7EB`). Active selected state: `#171717` background with pure white text and borderless profile.

### Form Inputs & Search Bar
- **Global Search Component:** High-profile pill or `rounded-xl` container with subtle border (`#E5E7EB`), white background, ambient shadow level 2. Integrated Coral Red submit icon and segmented inputs ("O que você procura?", "Onde?").
- **Text Inputs:** Neutral border (`#E5E7EB`), text `#171717`, focus ring in Coral Red (`#FF3B4F`) at `2px` offset.

### Interactive Micro-Elements
- **Review Stars:** Sized `16px`, filled with Amber (`#F59E0B`), empty stars in `#E5E7EB`.
- **Verified Merchant Icon:** Charcoal Black shield with an interior crisp white checkmark.