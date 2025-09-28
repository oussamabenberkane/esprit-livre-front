# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Esprit Livre", a React-based bookstore frontend application built with Vite and styled with TailwindCSS. The application is a single-page application focused on book browsing, categories, and user interaction features.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

## Architecture

### Tech Stack
- **React 19.1.1** with hooks (useState)
- **Vite** as build tool with SWC for fast refresh
- **TailwindCSS 4.1.13** for styling with Vite plugin
- **Framer Motion** for animations
- **Lucide React** for icons

### Project Structure
```
src/
├── components/
│   ├── common/          # Reusable components (Navbar, BookCard)
│   ├── home/           # Homepage-specific components (CategoryCard, HeroSection, author)
│   ├── animations/     # Animation components (LanguageToggle)
│   └── buttons/        # Button components (SeeMore)
├── pages/              # Page components (homePage)
├── App.jsx            # Main app component - renders HomePage
└── main.jsx           # Entry point
```

### Key Components

**Navbar**: Fixed positioned navigation with logo, search bar, language toggle, and user actions (cart, favorites, user account). Uses absolute positioning with blue-800 background.

**HomePage**: Main landing page featuring:
- Hero carousel with marketing banners
- Category cards in horizontal scroll
- Recommended books grid
- Author spotlight section

**CategoryCard**: Displays book categories with background images and blur overlays.

**BookCard**: Product card component with book details, badges, stock status, and action buttons.

### Styling Conventions
- Uses TailwindCSS with custom font family 'Poppins'
- Primary brand color: `#00417a` (blue)
- Layout uses flexbox and CSS Grid
- Mobile-first responsive design
- Custom classes for text sizing and spacing

### Asset Management
- Images stored in `public/assets/` directory
- Books: `assets/books/`
- Categories: `assets/categories/`
- Authors: `assets/authors/`
- Banners: `assets/banners/`

### Data Handling
Currently uses static data arrays for:
- Books with properties: id, title, author, price, coverImage, badge, stockStatus
- Categories with properties: title, imageSrc, imagePosition, blurOpacity
- Marketing images for hero carousel

### Configuration Notes
- ESLint configured for React with hooks and refresh plugins
- Vite uses SWC plugin for React
- Modern ESLint flat config format used
- Custom rule: unused vars ignored if uppercase (constants pattern)