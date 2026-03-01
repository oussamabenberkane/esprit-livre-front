# i18n Compliance Audit Report — `el-user-app`

**Date:** March 1, 2026
**i18n Library:** `react-i18next`
**Languages:** French (`fr`) — default, English (`en`)
**Translation files:** `src/i18n/locales/fr.json`, `src/i18n/locales/en.json`

---

## Executive Summary

The codebase has very solid i18n foundations — most pages and components correctly use `useTranslation()` / `t()`. However, the audit identified **3 missing translation keys**, **1 page with zero i18n coverage**, **several hardcoded aria-labels and fallback strings**, **a team page data inconsistency**, and **8 unused keys** accumulating in the locale files.

---

## Category 1 — Hardcoded User-Facing Text

### 1.1 `src/pages/Auth.jsx` — No i18n at all (Critical)

This page has **zero** `useTranslation` usage. Every visible string is hardcoded in English.

| Line | Hardcoded Text | Severity |
|------|----------------|----------|
| 33 | `'Failed to start authentication process. Please try again.'` (error shown to user) | High |
| 71 | `Esprit Livre` (brand name — acceptable) | Low |
| 81 | `Welcome` | High |
| 82 | `Sign in or create an account to continue` | High |
| 104 | `"Connecting..."` / `"Continue with Google"` (button text) | High |
| 123 | `Access thousands of books` | High |
| 131 | `Save your favorite books` | High |
| 139 | `Fast and secure checkout` | High |
| 151 | `By continuing, you agree to our Terms of Service and Privacy Policy` | High |

**Suggested fix — add keys to both locale files:**
```json
"auth": {
  "welcome": "Welcome",
  "subtitle": "Sign in or create an account to continue",
  "connecting": "Connecting...",
  "continueWithGoogle": "Continue with Google",
  "feature1": "Access thousands of books",
  "feature2": "Save your favorite books",
  "feature3": "Fast and secure checkout",
  "termsText": "By continuing, you agree to our Terms of Service and Privacy Policy",
  "errorFallback": "Failed to start authentication process. Please try again."
}
```

---

### 1.2 `src/components/common/BookCard.jsx` — Inconsistent "Preorder" Badge (High)

| Line | Issue |
|------|-------|
| 16 | Default prop `stockStatus = { available: true, text: "en stock" }` — hardcoded French text in the prop default (the `text` field is never actually rendered; the component uses `t()` directly — but still incorrect) |
| 121 | `Preorder` — hardcoded English badge. The badge above the image renders this directly, while the stock status indicator just 8 lines below (line 163) correctly uses `t('bookCard.stockStatus.preorder')`. **Two UI elements show inconsistent text for the same condition.** |

**Refactoring example for line 121:**
```jsx
{/* Before */}
Preorder

{/* After */}
{t('bookCard.stockStatus.preorder')}
```

---

### 1.3 `src/components/common/Navigation.jsx` — Hardcoded Empty State (Medium)

| Line | Hardcoded Text |
|------|----------------|
| 134 | `No items to display` — user-visible empty state |
| 221 | `` `Go to set ${setIndex + 1}` `` — hardcoded English `aria-label` |

---

### 1.4 `src/pages/TeamPage.jsx` — Partially i18n'd Team Data (High)

The `teamMembers` array uses `t()` for names and roles of the first two members but leaves **all three descriptions** hardcoded in French, and **all of Yani's data** hardcoded despite translation keys existing in both locale files.

| Line | Hardcoded Value | Available Key |
|------|-----------------|---------------|
| 17 | `'Leader guidant la mission d\'Esprit Livre...'` | `team.members.lhadi.description` ✓ |
| 31 | `'Conçoit des systèmes backend fiables...'` | `team.members.oussama.description` ✓ |
| 41 | `'Yani Ferhaten'` | `team.members.yani.name` ✓ |
| 42 | `'Développeur Frontend'` | `team.members.yani.role` ✓ |
| 43 | `'Crée des interfaces modernes...'` | `team.members.yani.description` ✓ |

**Suggested fix:**
```jsx
// Before (mixed)
{
  name: t('team.members.lhadi.name'),
  role: t('team.members.lhadi.role'),
  description: 'Leader guidant la mission...',  // hardcoded
  ...
},
{
  name: 'Yani Ferhaten',                        // hardcoded
  role: 'Développeur Frontend',                  // hardcoded
  description: 'Crée des interfaces...',         // hardcoded
  ...
}

// After (consistent)
{
  name: t('team.members.lhadi.name'),
  role: t('team.members.lhadi.role'),
  description: t('team.members.lhadi.description'),
  ...
},
{
  name: t('team.members.yani.name'),
  role: t('team.members.yani.role'),
  description: t('team.members.yani.description'),
  ...
}
```

---

### 1.5 `src/components/allbooks/FiltersSection.jsx` — Hardcoded Mock Language Names (Low)

| Line | Hardcoded Text | Notes |
|------|----------------|-------|
| 7 | `['Fantasie', 'Science fiction', 'Romans', ...]` | French mock category fallback — only shown when API fails |
| 10 | `['Français', 'English', 'العربية']` | Mixed-language language names used as API fallback |

The category names and book titles are acceptable (they're proper literary terms). The **language names** however are displayed in French regardless of active locale.

---

## Category 2 — Hardcoded `aria-label` Attributes

These are accessibility attributes that are also exposed to screen readers and therefore need to be translated.

| File | Lines | Hardcoded Labels |
|------|-------|------------------|
| `src/pages/AllBooks.jsx` | 377, 486 | `"Previous page"`, `"Next page"` |
| `src/pages/CartCheckoutPage.jsx` | 1795, 1904 | `"Previous page"`, `"Next page"` |
| `src/pages/PacksPromotionnels.jsx` | 396, 501 | `"Previous page"`, `"Next page"` |
| `src/components/profil/Favorites.jsx` | 268, 373 | `"Previous page"`, `"Next page"` |
| `src/pages/BookDetails.jsx` | 536, 646 | `aria-label="Retour"` — **hardcoded French** |
| `src/components/home/HeroSection.jsx` | 144, 154 | `"Previous slide"`, `"Next slide"` |
| `src/components/common/Navbar.jsx` | 79 | `"Search"` |
| `src/components/common/Navigation.jsx` | 221 | `` `Go to set ${setIndex + 1}` `` |

> **Note:** `BookDetails.jsx` lines 536 and 646 are the most problematic — `aria-label="Retour"` is hardcoded French, which means English-locale users with screen readers will hear French.

**Suggested additions to locale files:**
```json
"aria": {
  "previousPage": "Previous page",
  "nextPage": "Next page",
  "back": "Back",
  "previousSlide": "Previous slide",
  "nextSlide": "Next slide",
  "search": "Search",
  "goToSet": "Go to set {{index}}"
}
```

---

## Category 3 — Missing Translation Keys

Keys used in `t()` calls that do **not** exist in either `en.json` or `fr.json`:

| File | Line | Key Used | Impact |
|------|------|----------|--------|
| `src/pages/AllBooks.jsx` | 353 | `allBooks.noBooksFound` | Has `'No books found'` fallback — English-only fallback shown in FR locale |
| `src/components/common/PackBooksPopup.jsx` | 91 | `packBooksPopup.loading` | OR-chained `'Loading books...'` fallback — English only in FR locale |
| `src/components/common/PackCard.jsx` | 248 | `packCard.viewAllBooks` | **No fallback** — screen readers will hear the raw key string `"packCard.viewAllBooks"` |

**Keys to add to both locale files:**
```json
// en.json additions
"allBooks": { "noBooksFound": "No books found" },
"packBooksPopup": { "loading": "Loading books..." },
"packCard": { "viewAllBooks": "View all books" }

// fr.json additions
"allBooks": { "noBooksFound": "Aucun livre trouvé" },
"packBooksPopup": { "loading": "Chargement des livres..." },
"packCard": { "viewAllBooks": "Voir tous les livres" }
```

---

## Category 4 — Risky `t()` Fallback Patterns

These use the `t('key', 'fallback')` or `t('key') || 'fallback'` patterns. Where keys exist in the locale files, the fallback is redundant but harmless. Where keys are missing (see Category 3), the fallback locks in English for French users.

| File | Line | Pattern | Key Exists? |
|------|------|---------|-------------|
| `src/pages/AllBooks.jsx` | 253 | `t('common.error', 'Error')` | ✅ Yes — fallback is safe but redundant |
| `src/pages/AllBooks.jsx` | 259 | `t('common.retry', 'Retry')` | ✅ Yes — fallback is safe but redundant |
| `src/pages/AllBooks.jsx` | 353 | `t('allBooks.noBooksFound', 'No books found')` | ❌ No — English shown to French users |
| `src/components/common/PackBooksPopup.jsx` | 91 | `t('packBooksPopup.loading') \|\| 'Loading books...'` | ❌ No — English shown to French users |
| `src/components/profil/Orders.jsx` | 408 | `t('orders.errorTitle') \|\| 'Error Loading Orders'` | ✅ Yes — fallback is safe but redundant |

---

## Category 5 — Unused Translation Keys

Keys defined in both `en.json` and `fr.json` but not referenced anywhere in the source code:

| Key | `en.json` Value | Notes |
|-----|----------------|-------|
| `bookCard.unknownAuthor` | `"Unknown Author"` | `BookCard` always renders the `author` prop directly; no fallback to this key |
| `packCard.seeMore` | `"See More"` | Not used in `PackCard.jsx` |
| `packCard.allBooks` | `"All Books"` | Not used in `PackCard.jsx` |
| `packCard.booksIncluded` | `"Books included"` | Not used in `PackCard.jsx` |
| `packCard.detailsButton` | `"Details"` | Not used in `PackCard.jsx` |
| `packCard.save` | `"Save"` | Savings shown as `-%` badge without i18n |
| `allBooks.digitalLibrary` | `"Digital Library"` | Not rendered anywhere |
| `allBooks.customerService` | `"Customer Service"` | Not rendered anywhere |
| `floatingCartBadge.dragToClose` | `"Drag to close"` | Not used in `FloatingCartBadge.jsx` |

---

## Category 6 — Inconsistencies Between Locale Files

| Key | `en.json` | `fr.json` | Issue |
|-----|-----------|-----------|-------|
| `bookDetails.estimatedDelivery` | `"Estimated delivery: 2-4 days"` | `"Livraison estimé pour 1-2 jours"` | **Different delivery times between languages** (2-4 days vs 1-2 days). Also, the time value is baked into the string — use interpolation instead. |
| `cart.deliveryDays` | `"2–4 days"` | `"1–2 jours"` | **Different delivery times between languages** — same root problem |
| `bookDetails.soldBy` | `"Sold and shipped by Esprit Livre"` | `"Vendu et expedié par Esprit Livre"` | Typo in French: `expedié` → `expédié` (missing accent) |
| `bookDetails.condition` | `"Condition: {{condition}}"` | `"Etat : {{condition}}"` | Typo in French: `Etat` → `État` (missing accent) |
| `bookDetails.recommendations` | `"Recommended books: "` | `"Livres recommandés:"` | Trailing space inconsistency (EN has it, FR does not) |
| `bookDetails.packRecommendations` | `"Recommended packs: "` | `"Packs recommandés:"` | Same trailing space inconsistency |

---

## Category 7 — Format & Display Notes

- `en.json` `bookDetails.author` = `"author:"` (lowercase) — consider whether this label needs capitalization for English ("Author:")
- `fr.json` `bookDetails.author` = `"auteur :"` — French typographic convention (space before colon) is correct ✅
- `formatOrderDate` in `src/components/profil/Orders.jsx:22` uses hardcoded `'fr-FR'` locale for `toLocaleDateString()` — this will always display dates in French format regardless of the active language

---

## Prioritized Fix List

| Priority | Issue | Files |
|----------|-------|-------|
| 🔴 P1 | `Auth.jsx` has **zero i18n** — 9 strings hardcoded in English | `src/pages/Auth.jsx` |
| 🔴 P1 | `packCard.viewAllBooks` key missing — raw key shown on screen | `src/components/common/PackCard.jsx` |
| 🔴 P1 | `TeamPage.jsx` — Yani's name/role/description hardcoded (FR), all 3 descriptions hardcoded | `src/pages/TeamPage.jsx` |
| 🔴 P1 | `BookCard.jsx:121` — "Preorder" badge hardcoded while same state below uses `t()` | `src/components/common/BookCard.jsx` |
| 🟠 P2 | Add missing keys `allBooks.noBooksFound`, `packBooksPopup.loading` to both locale files | Locale files |
| 🟠 P2 | `BookDetails.jsx` aria-labels hardcoded in French (`"Retour"`) | `src/pages/BookDetails.jsx` |
| 🟠 P2 | Pagination `aria-label` hardcoded in 5 files | AllBooks, CartCheckout, Packs, Favorites |
| 🟠 P2 | `Navigation.jsx` empty state and set navigation aria-label hardcoded | `src/components/common/Navigation.jsx` |
| 🟡 P3 | Fix `fr.json` typos: `expedié` → `expédié`, `Etat` → `État` | `src/i18n/locales/fr.json` |
| 🟡 P3 | Align delivery time estimates between `en.json` and `fr.json` | Locale files |
| 🟡 P3 | Remove 9 unused translation keys from both locale files | Locale files |
| 🟡 P3 | `Orders.jsx:22` — hardcoded `'fr-FR'` in `toLocaleDateString()` | `src/components/profil/Orders.jsx` |
| 🟢 P4 | `FiltersSection.jsx` mockFiltersData language names | `src/components/allbooks/FiltersSection.jsx` |
| 🟢 P4 | Remove OR-fallback patterns where keys already exist in locale files | `Orders.jsx`, `AllBooks.jsx` |
