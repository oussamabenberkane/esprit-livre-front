# Favorites System Implementation

## Overview

This document describes the comprehensive favorites system implementation that supports both **authenticated** and **non-authenticated** users with seamless state management and synchronization.

---

## Architecture

### State Management: React Context API + useReducer

- **Context**: `FavoritesContext.jsx` provides application-wide favorites state
- **Reducer Pattern**: Clean, predictable state updates
- **No external dependencies**: Uses built-in React features

### Persistence Strategy

| User Type | Storage Method | Sync Behavior |
|-----------|---------------|---------------|
| **Non-authenticated** | localStorage | Direct read/write |
| **Authenticated** | Server API | Fetch from server on mount |
| **Login transition** | Hybrid | Merge localStorage + server, then sync to server |

---

## Files Structure

```
src/
├── contexts/
│   └── FavoritesContext.jsx          # State management & business logic
├── services/
│   └── favorites.service.js          # API calls & localStorage utilities
├── components/
│   ├── common/
│   │   └── BookCard.jsx              # Updated to use context
│   └── profil/
│       └── Favorites.jsx             # Updated to use context
└── App.jsx                           # Wrapped with FavoritesProvider
```

---

## API Integration

### Endpoints Used

1. **POST** `/api/likes/toggle/:bookId`
   - Toggles like/unlike for a book
   - Returns: `{ bookId, isLiked, likeCount }`

2. **GET** `/api/books/liked?page=0&size=100`
   - Fetches all liked books for authenticated user
   - Supports pagination and filters
   - Returns: `{ books: [], totalElements, totalPages }`

---

## How It Works

### 1. **Non-Authenticated Users**

```javascript
// User clicks favorite on a book
toggleFavorite(bookId)
  ↓
localStorage.getItem('el_favorites')  // Get current favorites
  ↓
Add/Remove bookId
  ↓
localStorage.setItem('el_favorites', updatedArray)  // Save
  ↓
Update UI state
```

### 2. **Authenticated Users**

```javascript
// User clicks favorite on a book
toggleFavorite(bookId)
  ↓
POST /api/likes/toggle/:bookId  // API call
  ↓
Update local state with server response
  ↓
Update UI state
```

### 3. **Login Transition (The Magic)**

```javascript
// User logs in
initializeFavorites()
  ↓
GET localStorage favorites → [1, 2, 3]
  ↓
GET /api/books/liked → [2, 4, 5]
  ↓
Merge both → [1, 2, 3, 4, 5]  // Union, no duplicates
  ↓
Sync local-only favorites to server
  ↓
  POST /api/likes/toggle/1
  POST /api/likes/toggle/3
  ↓
Clear localStorage  // Server is now source of truth
  ↓
Update UI state with merged favorites
```

---

## Usage Examples

### In a Component

```jsx
import { useFavorites } from '../contexts/FavoritesContext';

function MyComponent() {
  const {
    favorites,          // Array of book IDs
    favoriteBooks,      // Array of full book objects
    isLoading,
    error,
    isSyncing,          // True during login merge
    toggleFavorite,     // Toggle favorite state
    isFavorited,        // Check if book is favorited
    loadFavoriteBooks,  // Load full book objects
    getFavoritesCount,  // Get count
    refreshFavorites    // Re-sync favorites
  } = useFavorites();

  const handleFavoriteClick = async (bookId) => {
    const isNowFavorited = await toggleFavorite(bookId);
    console.log(`Book ${bookId} is now ${isNowFavorited ? 'favorited' : 'unfavorited'}`);
  };

  return (
    <div>
      {isFavorited(bookId) ? '❤️' : '🤍'}
      <span>{getFavoritesCount()} favorites</span>
    </div>
  );
}
```

### BookCard Integration

The `BookCard` component now automatically:
- Shows correct favorite state (heart icon filled/unfilled)
- Syncs favorites across all instances
- Updates in real-time when favorites change elsewhere
- Works for both authenticated and non-authenticated users

---

## Merging Logic

### Why Merge?

When a user adds favorites as a guest, then logs in:
- **Old approach**: User loses all guest favorites ❌
- **New approach**: User keeps both guest and server favorites ✅

### Merge Algorithm

```javascript
function mergeFavorites(localBookIds, serverBooks) {
  const serverBookIds = serverBooks.map(book => book.id);
  const merged = [...new Set([...localBookIds, ...serverBookIds])];
  return merged;  // [1, 2, 3, 4, 5] - unique values only
}
```

### Conflict Resolution

- **Duplicates**: Automatically removed using `Set`
- **Deleted books**: Still synced (API will validate)
- **Network errors**: Falls back to localStorage
- **Partial sync failures**: Continues with remaining books

---

## Error Handling

### Network Errors

```javascript
try {
  await toggleFavorite(bookId);
} catch (error) {
  // For non-authenticated: localStorage still works
  // For authenticated: User sees error, can retry
  console.error('Failed to toggle favorite:', error);
}
```

### Sync Failures

```javascript
// During login merge
const failedIds = [];
for (const bookId of localBookIds) {
  try {
    await toggleFavorite(bookId);
  } catch (error) {
    failedIds.push(bookId);  // Track failures
  }
}
// User is notified if sync partially failed
```

---

## Testing Scenarios

### ✅ Scenario 1: Guest User
1. User browses as guest
2. Clicks favorite on books 1, 2, 3
3. Favorites saved to localStorage
4. Refresh page → Favorites persist

### ✅ Scenario 2: Authenticated User
1. User logs in
2. Clicks favorite on books 4, 5
3. Favorites saved to server
4. Refresh page → Favorites loaded from server

### ✅ Scenario 3: Guest → Login
1. User favorites books 1, 2, 3 as guest (localStorage)
2. User logs in (server has books 2, 4, 5)
3. System merges → [1, 2, 3, 4, 5]
4. Syncs books 1, 3 to server
5. Clears localStorage
6. User sees all 5 favorites

### ✅ Scenario 4: Logout
1. User logs out
2. Context resets
3. Any new favorites go to localStorage
4. On next login, merge happens again

---

## Performance Considerations

### Optimizations

1. **Debouncing**: Not needed - toggle is user-initiated
2. **Batch Sync**: Syncs local favorites sequentially on login
3. **Caching**: Server favorites cached in context
4. **Lazy Loading**: Full book objects loaded only on Favorites page

### Memory Usage

- **localStorage**: Stores only book IDs (array of numbers)
- **Context State**: Stores IDs + full book objects when needed
- **Cleanup**: localStorage cleared after successful sync

---

## Future Enhancements

### Potential Improvements

1. **Optimistic UI Updates**
   - Update UI immediately, sync in background
   - Rollback on failure

2. **Offline Support**
   - Queue favorites changes
   - Sync when connection restored

3. **Analytics**
   - Track favorite patterns
   - Recommend books based on favorites

4. **Favorites Collections**
   - Create named collections
   - Share collections with others

---

## Troubleshooting

### Favorites not syncing after login

**Check**:
1. Is `/api/likes/toggle/:bookId` endpoint accessible?
2. Check browser console for network errors
3. Verify authentication token is valid

**Solution**:
```javascript
// Force refresh favorites
const { refreshFavorites } = useFavorites();
await refreshFavorites();
```

### Favorites duplicated

**Check**:
1. Verify merge logic is removing duplicates
2. Check if `Set` is being used correctly

**Solution**: Already handled in `mergeFavorites()` function

### localStorage not clearing

**Check**:
1. Browser permissions for localStorage
2. Check `syncLocalFavoritesToServer` completion

**Manual Clear**:
```javascript
localStorage.removeItem('el_favorites');
```

---

## Best Practices

### DO ✅

- Use `useFavorites()` hook in components
- Handle async errors gracefully
- Show loading states during sync
- Inform users about sync progress

### DON'T ❌

- Directly manipulate localStorage outside `favorites.service.js`
- Skip error handling on API calls
- Assume favorites are always in sync
- Use favorites context outside FavoritesProvider

---

## Migration Guide

### From Old Implementation

**Before**:
```jsx
const [favorited, setFavorited] = useState(false);

const handleFavorite = () => {
  setFavorited(!favorited);
  // Manual API call
  apiToggleFavorite(bookId);
};
```

**After**:
```jsx
const { isFavorited, toggleFavorite } = useFavorites();

const handleFavorite = async () => {
  await toggleFavorite(bookId);
  // Everything handled automatically
};
```

---

## Security Considerations

1. **localStorage**: Only stores book IDs (no sensitive data)
2. **API Authentication**: Uses existing auth tokens
3. **XSS Protection**: No eval() or innerHTML used
4. **CSRF Protection**: Uses JHipster's built-in CSRF handling

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Review this documentation
4. Check `FavoritesContext.jsx` for state debugging

---

**Last Updated**: 2025-01-21
**Version**: 1.0.0
**Author**: Claude Code Implementation
