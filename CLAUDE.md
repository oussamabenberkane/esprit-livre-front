# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Esprit Livre" is a React-based bookstore frontend application built with Vite and styled with TailwindCSS. The application features a responsive design with book browsing, categories, filtering, and user interaction capabilities.

## Development Commands

- **Start development server**: `npm run dev`
- **Start with QR code** (for mobile testing): `npm run dev:qr`
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

## Architecture

### Tech Stack
- **React 19.1.1** with hooks (useState, useEffect, useRef)
- **React Router DOM 7.9.3** for routing (currently not fully implemented)
- **Vite 7.1.7** as build tool with SWC for fast refresh
- **TailwindCSS 4.1.13** for styling with Vite plugin
- **Framer Motion 12.23.22** for animations
- **Lucide React 0.544.0** for icons

### Project Structure
```
src/
├── components/
│   ├── common/          # Reusable components (Navbar, Footer, BookCard, Navigation, PaginationDots, FloatingCartBadge)
│   ├── home/           # Homepage-specific components (CategoryCard, HeroSection, author, cartConfirmationPopup)
│   ├── allbooks/       # All books page components (FiltersSection)
│   ├── animations/     # Animation components (LanguageToggle)
│   └── buttons/        # Button components (SeeMore, SlideScroll)
├── pages/              # Page components (HomePage, AllBooks)
├── App.jsx            # Main app component with routing structure
└── main.jsx           # Entry point with React StrictMode
```

### Key Pages

**App.jsx**: Currently renders AllBooks page directly. Routing structure exists but needs full implementation.

**HomePage** (src/pages/homePage.jsx): Landing page with:
- Fixed Navbar component
- Hero carousel with auto-advance and manual navigation
- Three horizontally scrollable sections: Categories, Recommended Books, Featured Authors
- Custom scroll tracking with pagination dots for each section
- Footer component

**AllBooks** (src/pages/AllBooks.jsx): Catalog page with:
- Filters section for book discovery
- Paginated book grid (12 items per page)
- "See more" button for progressive loading
- Page count and navigation controls

### Key Components

**Navbar** (src/components/common/Navbar.jsx): Fixed-position navigation bar
- Responsive layout with different views for mobile/tablet/desktop
- Logo, search bar, language toggle (desktop: animated, mobile/tablet: simple button)
- Action icons: Cart (always visible), Favorites & User (desktop only), Menu (mobile only)
- Fully responsive with breakpoint-specific behavior

**BookCard** (src/components/common/BookCard.jsx): Product display component
- Book cover image, title, author, price
- Badge system (coup-de-coeur, nouveaute, precommande)
- Stock status indicator
- Interactive cart and favorite buttons with callbacks

**CategoryCard** (src/components/home/CategoryCard.jsx): Category navigation element
- Background image with customizable positioning
- Title overlay with adjustable blur effect
- Responsive sizing

**Scroll Components**: SlideScroll buttons and PaginationDots for horizontal navigation
- Used across all scrollable sections
- State-driven visibility and active indicators

### Styling System

**Fluid Design**: The app uses a comprehensive fluid typography and spacing system defined in index.css

Custom CSS variables in `@theme`:
- Fluid typography: `--font-size-fluid-*` (hero, h1, h2, h3, body, price, small, vsmall, tag)
- Fluid spacing: `--spacing-fluid-*` (xs, sm, md, lg, xl, 2xl, xxs, tiny)
- Component dimensions: card widths/heights, author card size, hero height
- Brand colors: `--color-brand-blue` (#00417a), `--color-brand-blue-light`, `--color-brand-gray`

**Utility Classes** (src/index.css):
- `.text-fluid-*` for responsive text sizing
- `.book-card-width/height`, `.cat-card-size`, `.author-card-size` for component dimensions
- `.container-main`, `.container-padding*` for layout constraints
- `.section-spacing` for consistent vertical rhythm
- `.gap-fluid-*`, `.p-fluid-*`, `.m-fluid-*` for responsive spacing
- `.scrollbar-hide` for clean horizontal scroll containers

**Responsive Strategy**:
- Mobile-first approach with clamp() functions
- Breakpoints: xs (450px), md (768px), lg (1024px)
- Different component variants for mobile/tablet/desktop (e.g., Navbar language toggle)

### Asset Management
- All images in `public/assets/` directory
- Books: `public/assets/books/`
- Categories: `public/assets/categories/`
- Authors: `public/assets/authors/`
- Banners: `public/assets/banners/`
- Image paths in code use relative paths starting with `/assets/` or `../public/assets/`

### Data Structure

Currently uses static mock data arrays:

**Books**:
```js
{
  id: string,
  title: string,
  author: string,
  price: string,
  coverImage: string,
  badge: { type: string, text: string },
  stockStatus: { available: boolean, text: string },
  isFavorited: boolean (optional)
}
```

**Categories**:
```js
{
  title: string,
  imageSrc: string,
  imagePosition: string,
  blurOpacity: number
}
```

**Authors**:
```js
{
  Image: string,
  Name: string
}
```

### Scroll Implementation Pattern

Horizontal scroll sections use a consistent pattern:
1. `useRef` for container reference
2. State for current index and scroll capability flags (canScrollLeft/Right)
3. Scroll position check function updating states
4. Scroll handler function for programmatic scrolling
5. `useEffect` hooks for scroll listeners and resize handling
6. Integration with PaginationDots and SlideScroll components

### Configuration

**Vite** (vite.config.js): React SWC plugin + TailwindCSS Vite plugin

**ESLint** (eslint.config.js):
- Modern flat config format
- React hooks recommended-latest rules
- React refresh Vite rules
- Custom rule: `no-unused-vars` ignores uppercase variables (pattern: `^[A-Z_]`)
- Ignores `dist` directory

**Font**: Poppins imported from Google Fonts in index.css