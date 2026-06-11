// Anonymous visitor identifier for search analytics.
// Persisted in localStorage so guest activity can be sequenced across visits;
// sent to the API as the X-Visitor-Id header (see apiConfig.js).

const VISITOR_ID_KEY = 'el_visitor_id';

let inMemoryId = null;

export const getVisitorId = () => {
  if (inMemoryId) return inMemoryId;
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    inMemoryId = id;
    return id;
  } catch {
    // localStorage unavailable (private mode/blocked): fall back to a per-session id
    if (!inMemoryId) {
      inMemoryId = crypto.randomUUID();
    }
    return inMemoryId;
  }
};
