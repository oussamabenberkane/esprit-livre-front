import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Filter, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mockFiltersData = {
  categories: ['Fantasie', 'Science fiction', 'Romans', 'Histoire', 'Biographie', 'Philosophie', 'Art', 'Cuisine'],
  authors: ['Albert Camus', 'Dostoïevski', 'Victor Hugo', 'Marcel Proust', 'Simone de Beauvoir', 'Jean-Paul Sartre'],
  titles: ['L\'Étranger', 'Crime et Châtiment', 'Les Misérables', 'À la recherche du temps perdu', 'Le Deuxième Sexe'],
  languages: ['Français', 'English', 'العربية']
};

// Extracted PriceFilter component
const PriceFilter = ({ filters, onPriceChange, onPriceInputBlur, onMinSliderChange, onMaxSliderChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col space-y-4">
      <label className="text-sm font-semibold text-gray-800">{t('filters.price.label')}</label>
      <div className="w-[90%] mx-auto">
        <div className="relative h-2 mb-6">
          <div className="absolute w-full h-1 bg-gray-200 rounded-full top-1/2 -translate-y-1/2 left-0 right-0"></div>

          <div
            className="absolute h-1 bg-blue-600 rounded-full top-1/2 -translate-y-1/2 transition-all pointer-events-none"
            style={{
              left: `${((filters.price.min || 0) / 10000) * 100}%`,
              right: `${100 - ((filters.price.max || 10000) / 10000) * 100}%`
            }}
          />

          <input
            type="range"
            min="0"
            max="10000"
            step="50"
            value={filters.price.min || 0}
            onChange={onMinSliderChange}
            className="absolute w-full appearance-none bg-transparent cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-600 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform"
            style={{ top: '50%', transform: 'translateY(-50%)', zIndex: 4, left: 0 }}
          />

          <input
            type="range"
            min="0"
            max="10000"
            step="50"
            value={filters.price.max || 10000}
            onChange={onMaxSliderChange}
            className="absolute w-full appearance-none bg-transparent cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-600 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform"
            style={{ top: '50%', transform: 'translateY(-50%)', zIndex: 5, left: 0 }}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={filters.price.min === '' ? '' : filters.price.min}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d+$/.test(value)) {
                onPriceChange('min', value);
              }
            }}
            onBlur={() => onPriceInputBlur('min')}
            className="flex-1 min-w-0 h-10 px-2 text-sm bg-gray-50 rounded-lg border border-gray-200 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder={t('filters.price.min')}
          />
          <span className="text-sm text-gray-500 font-medium flex-shrink-0">-</span>
          <input
            type="text"
            inputMode="numeric"
            value={filters.price.max === '' ? '' : filters.price.max}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d+$/.test(value)) {
                onPriceChange('max', value);
              }
            }}
            onBlur={() => onPriceInputBlur('max')}
            className="flex-1 min-w-0 h-10 px-2 text-sm bg-gray-50 rounded-lg border border-gray-200 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder={t('filters.price.max')}
          />
          <span className="text-sm text-gray-700 font-semibold whitespace-nowrap flex-shrink-0">{t('filters.price.currency')}</span>
        </div>
      </div>
    </div>
  );
};

// Extracted FilterDropdown component
const FilterDropdown = ({
  type,
  label,
  placeholder,
  searchable = true,
  filters,
  searchTerms,
  activeDropdown,
  filterRefs,
  dropdownRefs,
  onSearchTermChange,
  onToggleDropdown,
  onCloseDropdown,
  onSetActiveDropdown,
  onAddFilterItem,
  onRemoveFilterItem,
  getFilteredOptions,
  isMobile = false
}) => {
  const { t } = useTranslation();
  const isActive = activeDropdown === type;
  const selectedItems = filters[type] || [];
  const searchTerm = searchTerms[type] || '';
  const filteredOptions = getFilteredOptions(type, searchTerm);
  const inputRef = useRef(null);

  return (
    <div
      ref={el => filterRefs.current[type] = el}
      className={`flex flex-col space-y-3 ${isMobile ? 'transition-all duration-300 ease-in-out' : ''}`}
    >
      <label className="text-sm font-semibold text-gray-800">{label}</label>

      <div className="relative">
        <div
          ref={el => dropdownRefs.current[type] = el}
          className={`flex items-center bg-gray-50 rounded-lg border-2 transition-all duration-200 ${isActive ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
            }`}
        >
          <div
            className="flex items-center flex-1 h-11 px-3 cursor-text"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.focus();
              }
              if (!isActive) {
                onSetActiveDropdown(type);
              }
            }}
          >
            {searchable && <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />}
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                onSearchTermChange(type, e.target.value);
              }}
              onFocus={() => {
                onSetActiveDropdown(type);
              }}
              placeholder={placeholder}
              className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-700 placeholder-gray-400 cursor-text"
            />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleDropdown(type);
            }}
            className="h-11 px-3 absolute right-1 hover:bg-gray-100 rounded-r-lg transition-colors flex items-center flex-shrink-0"
          >
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transform transition-transform duration-200${isActive ? 'rotate-180' : ''
                }`}
            />
          </button>
        </div>

        <div
          className={`${isMobile ? 'overflow-hidden' : 'relative z-50'} transition-all duration-300 ease-in-out ${isActive ? 'max-h-64 mt-2 opacity-100 visible' : 'max-h-0 mt-0 opacity-0 invisible'
            }`}
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-600">
                {t('filters.resultsCount', { count: filteredOptions.length })}
              </span>
              <button
                onClick={onCloseDropdown}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-52 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const displayText = typeof option === 'object' ? option.name : option;
                  const key = typeof option === 'object' ? option.id : option;
                  return (
                    <button
                      key={key}
                      onClick={() => onAddFilterItem(type, option)}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors flex items-center border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-3 h-3 border-2 border-gray-300 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{displayText}</span>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-6 text-sm text-gray-500 text-center">
                  {t('filters.noResults')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${selectedItems.length > 0 && !searchTerm ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        {selectedItems.length > 0 && !searchTerm && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-blue-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-blue-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-blue-500 [&::-webkit-scrollbar-thumb]:transition-colors">
              {selectedItems.map((item) => {
                const displayText = typeof item === 'object' ? item.name : item;
                const key = typeof item === 'object' ? item.id : item;
                return (
                  <div
                    key={key}
                    className="flex items-center bg-white px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex-shrink-0 shadow-sm border border-blue-200"
                  >
                    <span className="mr-2 text-gray-700">{displayText}</span>
                    <button
                      onClick={() => onRemoveFilterItem(type, item)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FiltersSection = ({ initialFilters, onApplyFilters, categoriesData = [], authorsData = [] }) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    price: { min: 0, max: 10000 },
    categories: [],
    authors: [],
    languages: []
  });

  const [searchTerms, setSearchTerms] = useState({
    categories: '',
    authors: '',
    languages: ''
  });

  const [activeDropdown, setActiveDropdown] = useState(null);
  const filterRefs = useRef({});
  const dropdownRefs = useRef({});

  // Apply initial filters from URL params
  useEffect(() => {
    if (initialFilters) {
      const mappedFilters = {};

      // Map category IDs from URL to category objects
      if (initialFilters.categories && initialFilters.categories.length > 0) {
        // Check if we already have objects with names (from URL params)
        const firstCat = initialFilters.categories[0];
        if (typeof firstCat === 'object' && firstCat.name) {
          // Already have full objects with names - use them directly
          mappedFilters.categories = initialFilters.categories;
        } else if (categoriesData.length > 0) {
          // Need to look up in categoriesData
          mappedFilters.categories = initialFilters.categories
            .map(catId => {
              // Try to find by ID first (new behavior)
              const byId = categoriesData.find(cat => cat.id === parseInt(catId) || cat.id === catId);
              if (byId) {
                return {
                  id: byId.id,
                  name: byId.nameFr || byId.nameEn || byId.name
                };
              }
              // Fallback to name matching for backward compatibility
              const byName = categoriesData.find(cat =>
                (cat.nameFr === catId || cat.nameEn === catId || cat.name === catId)
              );
              if (byName) {
                return {
                  id: byName.id,
                  name: byName.nameFr || byName.nameEn || byName.name
                };
              }
              return null;
            })
            .filter(Boolean);
        }
        // If we don't have names yet and categoriesData isn't loaded, wait
      }

      // Map author IDs from URL to author objects
      if (initialFilters.authors && initialFilters.authors.length > 0) {
        // Check if we already have objects with names (from URL params)
        const firstAuthor = initialFilters.authors[0];
        if (typeof firstAuthor === 'object' && firstAuthor.name) {
          // Already have full objects with names - use them directly
          mappedFilters.authors = initialFilters.authors;
        } else if (authorsData.length > 0) {
          // Need to look up in authorsData
          mappedFilters.authors = initialFilters.authors
            .map(authorId => {
              // Try to find by ID first (new behavior)
              const byId = authorsData.find(author => author.id === parseInt(authorId) || author.id === authorId);
              if (byId) {
                return {
                  id: byId.id,
                  name: byId.name
                };
              }
              // Fallback to name matching for backward compatibility
              const byName = authorsData.find(author => author.name === authorId);
              if (byName) {
                return {
                  id: byName.id,
                  name: byName.name
                };
              }
              return null;
            })
            .filter(Boolean);
        }
        // If we don't have names yet and authorsData isn't loaded, wait
      }

      // Only update filters if we have mapped data
      if (Object.keys(mappedFilters).length > 0) {
        setFilters(prev => ({
          ...prev,
          ...mappedFilters
        }));
      }

      // Auto-apply filters when coming from URL (e.g., from search)
      // This includes search-only cases (no categories/authors)
      if (initialFilters.search || initialFilters.categories || initialFilters.authors) {
        // Small delay to ensure filters are set before applying
        setTimeout(() => {
          applyFilters();
        }, 100);
      }
    }
  }, [initialFilters, categoriesData, authorsData]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll and horizontal overflow when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      // Store original styles
      const originalBodyOverflow = document.body.style.overflow;
      const originalBodyOverflowX = document.body.style.overflowX;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyWidth = document.body.style.width;

      // Get current scroll position
      const scrollY = window.scrollY;

      // Lock body and html
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // Cleanup function
      return () => {
        document.body.style.position = originalBodyPosition;
        document.body.style.top = '';
        document.body.style.width = originalBodyWidth;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.overflowX = originalBodyOverflowX;
        document.documentElement.style.overflow = originalHtmlOverflow;

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMobile && activeDropdown && filterRefs.current[activeDropdown]) {
      setTimeout(() => {
        const filterContainer = filterRefs.current[activeDropdown];
        if (filterContainer) {
          // Find the dropdown options menu within this filter
          const dropdownMenu = filterContainer.querySelector('.bg-white.border');
          if (dropdownMenu) {
            // Get the position of the dropdown menu
            const rect = dropdownMenu.getBoundingClientRect();
            const scrollContainer = document.querySelector('.flex-1.overflow-y-auto');

            if (scrollContainer) {
              // Calculate scroll position to show dropdown + padding (24px extra space)
              const extraPadding = 24;
              const targetScrollTop = scrollContainer.scrollTop + rect.bottom - scrollContainer.clientHeight + extraPadding;

              // Smooth scroll to target position
              scrollContainer.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
              });
            }
          }
        }
      }, 400); // Wait for dropdown animation to complete
    }
  }, [activeDropdown, isMobile]);

  const handlePriceChange = (type, value) => {
    if (value === '') {
      setFilters(prev => ({
        ...prev,
        price: {
          ...prev.price,
          [type]: ''
        }
      }));
      return;
    }

    const numValue = parseInt(value) || 0;
    let clampedValue = Math.max(0, Math.min(10000, numValue));

    setFilters(prev => {
      const newPrice = { ...prev.price };

      if (type === 'min') {
        clampedValue = Math.min(clampedValue, prev.price.max || 10000);
        newPrice.min = clampedValue;
      } else {
        clampedValue = Math.max(clampedValue, prev.price.min || 0);
        newPrice.max = clampedValue;
      }

      return {
        ...prev,
        price: newPrice
      };
    });
  };

  const handlePriceInputBlur = (type) => {
    if (filters.price[type] === '') {
      setFilters(prev => ({
        ...prev,
        price: {
          ...prev.price,
          [type]: type === 'min' ? 0 : 10000
        }
      }));
    }
  };

  const handleMinSliderChange = (e) => {
    const value = parseInt(e.target.value);
    const maxValue = filters.price.max || 10000;
    // Min should stop 50 before max (one step before)
    const clampedValue = Math.min(value, maxValue - 50);
    setFilters(prev => ({
      ...prev,
      price: {
        ...prev.price,
        min: clampedValue
      }
    }));
  };

  const handleMaxSliderChange = (e) => {
    const value = parseInt(e.target.value);
    const minValue = filters.price.min || 0;
    // Max should stop 50 after min (one step after)
    const clampedValue = Math.max(value, minValue + 50);
    setFilters(prev => ({
      ...prev,
      price: {
        ...prev.price,
        max: clampedValue
      }
    }));
  };

  const addFilterItem = (type, item) => {
    setFilters(prev => ({
      ...prev,
      [type]: [...prev[type], item]
    }));
    // Clear the search term when a filter is selected
    setSearchTerms(prev => ({ ...prev, [type]: '' }));
    // Keep the dropdown open for continued selection
  };

  const removeFilterItem = (type, item) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(i =>
        typeof i === 'object' ? i.id !== item.id : i !== item
      )
    }));
  };

  const hasActiveFilters = () => {
    return (
      filters.price.min > 0 ||
      filters.price.max < 10000 ||
      filters.categories.length > 0 ||
      filters.authors.length > 0 ||
      filters.languages.length > 0
    );
  };

  const resetFilters = () => {
    setFilters({
      price: { min: 0, max: 10000 },
      categories: [],
      authors: [],
      languages: []
    });
    setSearchTerms({
      categories: '',
      authors: '',
      languages: ''
    });
    setActiveDropdown(null);
  };

  const applyFilters = () => {
    console.log('Applying filters:', filters);

    // Extract values from filter objects
    const extractValues = (items, type) => {
      if (!items || items.length === 0) return [];
      // For categories, return IDs (API expects categoryId)
      if (type === 'categories') {
        return items.map(item => typeof item === 'object' ? item.id : item);
      }
      // For authors, return IDs (API expects authorId)
      if (type === 'authors') {
        return items.map(item => typeof item === 'object' ? item.id : item);
      }
      // For other types, return values as-is
      return items.map(item => typeof item === 'object' ? item.name : item);
    };

    // Call the parent callback with current filters
    if (onApplyFilters) {
      const filterPayload = {
        categories: extractValues(filters.categories, 'categories'),
        authors: extractValues(filters.authors, 'authors'),
        languages: extractValues(filters.languages, 'languages'),
        minPrice: filters.price.min,
        maxPrice: filters.price.max
      };

      // Include search from initialFilters if present
      if (initialFilters && initialFilters.search) {
        filterPayload.search = initialFilters.search;
      }

      onApplyFilters(filterPayload);
    }

    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const getFilteredOptions = (type, searchTerm) => {
    let options = [];

    // Use real data if available, fall back to mock data
    if (type === 'categories') {
      options = categoriesData.length > 0
        ? categoriesData.map(cat => ({
          id: cat.id,
          name: cat.nameFr || cat.nameEn || cat.name
        }))
        : (mockFiltersData[type] || []).map((name, idx) => ({ id: idx, name }));
    } else if (type === 'authors') {
      options = authorsData.length > 0
        ? authorsData.map(author => ({
          id: author.id,
          name: author.name
        }))
        : (mockFiltersData[type] || []).map((name, idx) => ({ id: idx, name }));
    } else {
      options = (mockFiltersData[type] || []).map((name, idx) => ({ id: idx, name }));
    }

    const selectedItems = filters[type] || [];

    return options.filter(option =>
      !selectedItems.some(selected => selected.id === option.id) &&
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const toggleDropdown = (type) => {
    setActiveDropdown(prev => prev === type ? null : type);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  const handleSearchTermChange = (type, value) => {
    setSearchTerms(prev => ({ ...prev, [type]: value }));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!activeDropdown) return;

      const activeDropdownRef = dropdownRefs.current[activeDropdown];
      const clickedInsideActiveDropdown = activeDropdownRef && activeDropdownRef.contains(e.target);

      if (!clickedInsideActiveDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // Desktop: No scroll behavior needed - section expands naturally
  // Mobile scroll behavior handled separately in mobile-specific useEffect

  if (isMobile) {
    return (
      <>
        <div className="flex items-center gap-2 p-4">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg transition-colors shadow-md"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">{t('filters.heading')}</span>
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop with fade animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Side menu with slide and fade animation */}
              <motion.div
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{
                  type: "tween",
                  duration: 0.35,
                  ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier for smoother exit
                }}
                className="fixed left-0 top-0 h-full w-[85vw] max-w-[420px] bg-white z-50 shadow-2xl overflow-x-hidden"
              >
                <div className="h-full flex flex-col overflow-x-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-white truncate">{t('filters.heading')}</h2>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {hasActiveFilters() && (
                        <button
                          onClick={applyFilters}
                          className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap"
                        >
                          {t('filters.applyMobile')}
                        </button>
                      )}
                      <button
                        onClick={() => setIsMenuOpen(false)}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors flex-shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto overflow-x-hidden p-5">
                    <div className="space-y-6 overflow-x-hidden max-w-full">
                      <div className="w-full min-w-0">
                        <PriceFilter
                          filters={filters}
                          onPriceChange={handlePriceChange}
                          onPriceInputBlur={handlePriceInputBlur}
                          onMinSliderChange={handleMinSliderChange}
                          onMaxSliderChange={handleMaxSliderChange}
                        />
                      </div>
                      <div className="w-full min-w-0">
                        <FilterDropdown
                          type="categories"
                          label={t('filters.category.label')}
                          placeholder={t('filters.category.placeholder')}
                          searchable={true}
                          filters={filters}
                          searchTerms={searchTerms}
                          activeDropdown={activeDropdown}
                          filterRefs={filterRefs}
                          dropdownRefs={dropdownRefs}
                          onSearchTermChange={handleSearchTermChange}
                          onToggleDropdown={toggleDropdown}
                          onCloseDropdown={closeDropdown}
                          onSetActiveDropdown={setActiveDropdown}
                          onAddFilterItem={addFilterItem}
                          onRemoveFilterItem={removeFilterItem}
                          getFilteredOptions={getFilteredOptions}
                          isMobile={true}
                        />
                      </div>
                      <div className="w-full min-w-0">
                        <FilterDropdown
                          type="authors"
                          label={t('filters.author.label')}
                          placeholder={t('filters.author.placeholder')}
                          searchable={true}
                          filters={filters}
                          searchTerms={searchTerms}
                          activeDropdown={activeDropdown}
                          filterRefs={filterRefs}
                          dropdownRefs={dropdownRefs}
                          onSearchTermChange={handleSearchTermChange}
                          onToggleDropdown={toggleDropdown}
                          onCloseDropdown={closeDropdown}
                          onSetActiveDropdown={setActiveDropdown}
                          onAddFilterItem={addFilterItem}
                          onRemoveFilterItem={removeFilterItem}
                          getFilteredOptions={getFilteredOptions}
                          isMobile={true}
                        />
                      </div>
                      <div className="w-full min-w-0">
                        <FilterDropdown
                          type="languages"
                          label={t('filters.language.label')}
                          placeholder={t('filters.language.placeholder')}
                          searchable={false}
                          filters={filters}
                          searchTerms={searchTerms}
                          activeDropdown={activeDropdown}
                          filterRefs={filterRefs}
                          dropdownRefs={dropdownRefs}
                          onSearchTermChange={handleSearchTermChange}
                          onToggleDropdown={toggleDropdown}
                          onCloseDropdown={closeDropdown}
                          onSetActiveDropdown={setActiveDropdown}
                          onAddFilterItem={addFilterItem}
                          onRemoveFilterItem={removeFilterItem}
                          getFilteredOptions={getFilteredOptions}
                          isMobile={true}
                        />
                      </div>
                    </div>
                  </div>

                  {hasActiveFilters() && (
                    <div className="p-5 border-t border-gray-200 bg-gray-50">
                      <button
                        onClick={resetFilters}
                        className="w-full bg-red-500 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-md"
                      >
                        {t('filters.reset')}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="w-full bg-white p-6 overflow-hidden transition-all duration-500 ease-in-out">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <span className="text-base font-semibold text-gray-800">{t('filters.heading')}</span>
        </div>

        <AnimatePresence>
          {hasActiveFilters() && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={applyFilters}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              {t('filters.apply')}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-start gap-[clamp(0.75rem,2vw,1.25rem)] flex-wrap pb-2 transition-all duration-300 ease-in-out">
        <div className="flex-1 min-w-[clamp(200px,22%,100%)]">
          <PriceFilter
            filters={filters}
            onPriceChange={handlePriceChange}
            onPriceInputBlur={handlePriceInputBlur}
            onMinSliderChange={handleMinSliderChange}
            onMaxSliderChange={handleMaxSliderChange}
          />
        </div>

        <div className="flex-1 min-w-[clamp(180px,22%,100%)]">
          <FilterDropdown
            type="categories"
            label={t('filters.category.label')}
            placeholder={t('filters.category.placeholderShort')}
            searchable={true}
            filters={filters}
            searchTerms={searchTerms}
            activeDropdown={activeDropdown}
            filterRefs={filterRefs}
            dropdownRefs={dropdownRefs}
            onSearchTermChange={handleSearchTermChange}
            onToggleDropdown={toggleDropdown}
            onCloseDropdown={closeDropdown}
            onSetActiveDropdown={setActiveDropdown}
            onAddFilterItem={addFilterItem}
            onRemoveFilterItem={removeFilterItem}
            getFilteredOptions={getFilteredOptions}
          />
        </div>

        <div className="flex-1 min-w-[clamp(180px,22%,100%)]">
          <FilterDropdown
            type="authors"
            label={t('filters.author.label')}
            placeholder={t('filters.author.placeholderShort')}
            searchable={true}
            filters={filters}
            searchTerms={searchTerms}
            activeDropdown={activeDropdown}
            filterRefs={filterRefs}
            dropdownRefs={dropdownRefs}
            onSearchTermChange={handleSearchTermChange}
            onToggleDropdown={toggleDropdown}
            onCloseDropdown={closeDropdown}
            onSetActiveDropdown={setActiveDropdown}
            onAddFilterItem={addFilterItem}
            onRemoveFilterItem={removeFilterItem}
            getFilteredOptions={getFilteredOptions}
          />
        </div>

        <div className="flex-1 min-w-[clamp(160px,20%,100%)]">
          <FilterDropdown
            type="languages"
            label={t('filters.language.label')}
            placeholder={t('filters.language.placeholderShort')}
            searchable={false}
            filters={filters}
            searchTerms={searchTerms}
            activeDropdown={activeDropdown}
            filterRefs={filterRefs}
            dropdownRefs={dropdownRefs}
            onSearchTermChange={handleSearchTermChange}
            onToggleDropdown={toggleDropdown}
            onCloseDropdown={closeDropdown}
            onSetActiveDropdown={setActiveDropdown}
            onAddFilterItem={addFilterItem}
            onRemoveFilterItem={removeFilterItem}
            getFilteredOptions={getFilteredOptions}
          />
        </div>
      </div>

      <AnimatePresence>
        {hasActiveFilters() && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: "1.5rem" }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="pt-6 border-t border-gray-200 overflow-hidden"
          >
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              onClick={resetFilters}
              className="bg-red-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
            >
              {t('filters.reset')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FiltersSection;