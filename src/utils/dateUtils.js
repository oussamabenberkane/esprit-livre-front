/**
 * Format a date string to a human-readable format
 * @param {string} dateString - ISO 8601 date string
 * @param {string} locale - Locale for formatting ('en' or 'fr')
 * @returns {string} Formatted date string (e.g., "13 Dec 2025" or "13 déc 2025")
 */
export const formatMemberSinceDate = (dateString, locale = 'en') => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }

    const day = date.getDate();
    const year = date.getFullYear();

    // Month names
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsFr = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aoû', 'sep', 'oct', 'nov', 'déc'];

    const months = locale === 'fr' ? monthsFr : monthsEn;
    const month = months[date.getMonth()];

    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};
