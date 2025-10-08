import { useState, useEffect, useRef } from 'react';
import { X, Filter, Search, ChevronDown } from 'lucide-react';

const mockFiltersData = {
  categories: ['Fantasie', 'Science fiction', 'Romans', 'Histoire', 'Biographie', 'Philosophie', 'Art', 'Cuisine'],
  authors: ['Albert Camus', 'Dostoïevski', 'Victor Hugo', 'Marcel Proust', 'Simone de Beauvoir', 'Jean-Paul Sartre'],
  titles: ['L\'Étranger', 'Crime et Châtiment', 'Les Misérables', 'À la recherche du temps perdu', 'Le Deuxième Sexe'],
  languages: ['Français', 'Anglais', 'Arabe', 'Espagnol', 'Italien', 'Allemand']
};

// Extracted PriceFilter component
const PriceFilter = ({ filters, onPriceChange, onPriceInputBlur, onMinSliderChange, onMaxSliderChange }) => {
  return (
    <div className="flex flex-col space-y-4">
      <label className="text-sm font-semibold text-gray-800">Prix</label>
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
            placeholder="Min"
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
            placeholder="Max"
          />
          <span className="text-sm text-gray-700 font-semibold whitespace-nowrap flex-shrink-0">DZD</span>
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
          className={`${isMobile ? 'overflow-hidden' : 'absolute top-full left-0 right-0 z-50'} transition-all duration-300 ease-in-out ${isActive ? 'max-h-64 mt-2 opacity-100 visible' : 'max-h-0 mt-0 opacity-0 invisible'
            }`}
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-600">
                {filteredOptions.length} résultat{filteredOptions.length !== 1 ? 's' : ''}
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
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => onAddFilterItem(type, option)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors flex items-center border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-3 h-3 border-2 border-gray-300 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{option}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-gray-500 text-center">
                  Aucun résultat trouvé
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
          <div className="flex gap-2 p-3 bg-blue-50 rounded-lg overflow-x-auto">
            <div className="flex gap-2 flex-nowrap">
              {selectedItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center bg-white px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex-shrink-0 shadow-sm border border-blue-200"
                >
                  <span className="mr-2 text-gray-700">{item}</span>
                  <button
                    onClick={() => onRemoveFilterItem(type, item)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FiltersSection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    price: { min: 0, max: 10000 },
    categories: [],
    authors: [],
    titles: [],
    languages: []
  });

  const [searchTerms, setSearchTerms] = useState({
    categories: '',
    authors: '',
    titles: '',
    languages: ''
  });

  const [activeDropdown, setActiveDropdown] = useState(null);
  const filterRefs = useRef({});
  const dropdownRefs = useRef({});

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    // Keep the dropdown open and maintain focus by not clearing search term
    // The input will stay focused allowing continued typing
  };

  const removeFilterItem = (type, item) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(i => i !== item)
    }));
  };

  const hasActiveFilters = () => {
    return (
      filters.price.min > 0 ||
      filters.price.max < 10000 ||
      filters.categories.length > 0 ||
      filters.authors.length > 0 ||
      filters.titles.length > 0 ||
      filters.languages.length > 0
    );
  };

  const resetFilters = () => {
    setFilters({
      price: { min: 0, max: 10000 },
      categories: [],
      authors: [],
      titles: [],
      languages: []
    });
    setSearchTerms({
      categories: '',
      authors: '',
      titles: '',
      languages: ''
    });
    setActiveDropdown(null);
  };

  const applyFilters = () => {
    console.log('Applying filters:', filters);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const getFilteredOptions = (type, searchTerm) => {
    const options = mockFiltersData[type] || [];
    const selectedItems = filters[type] || [];

    return options.filter(option =>
      !selectedItems.includes(option) &&
      option.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (isMobile) {
    return (
      <>
        <div className="flex items-center gap-2 p-4">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg transition-colors shadow-md"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtres</span>
          </button>
        </div>

        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
              onClick={() => setIsMenuOpen(false)}
            />

            <div className={`fixed left-0 top-0 h-full w-[85vw] max-w-[420px] bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}>
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                  <h2 className="text-lg font-semibold text-white">Filtres</h2>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters() && (
                      <button
                        onClick={applyFilters}
                        className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors shadow-sm"
                      >
                        Appliquer
                      </button>
                    )}
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                  <div className="space-y-6">
                    <div className="w-full">
                      <PriceFilter
                        filters={filters}
                        onPriceChange={handlePriceChange}
                        onPriceInputBlur={handlePriceInputBlur}
                        onMinSliderChange={handleMinSliderChange}
                        onMaxSliderChange={handleMaxSliderChange}
                      />
                    </div>
                    <div className="w-full">
                      <FilterDropdown
                        type="categories"
                        label="Catégorie"
                        placeholder="Rechercher une catégorie..."
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
                    <div className="w-full">
                      <FilterDropdown
                        type="authors"
                        label="Auteur"
                        placeholder="Rechercher un auteur..."
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
                    <div className="w-full">
                      <FilterDropdown
                        type="titles"
                        label="Titre"
                        placeholder="Rechercher un titre..."
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
                    <div className="w-full">
                      <FilterDropdown
                        type="languages"
                        label="Langue"
                        placeholder="Sélectionner une langue..."
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
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <span className="text-base font-semibold text-gray-800">Filtres</span>
        </div>

        {hasActiveFilters() && (
          <button
            onClick={applyFilters}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            Appliquer les filtres
          </button>
        )}
      </div>

      <div className="flex items-start gap-[clamp(0.75rem,2vw,1.25rem)] flex-wrap">
        <div className="flex-1 min-w-[clamp(180px,20%,100%)]">
          <PriceFilter
            filters={filters}
            onPriceChange={handlePriceChange}
            onPriceInputBlur={handlePriceInputBlur}
            onMinSliderChange={handleMinSliderChange}
            onMaxSliderChange={handleMaxSliderChange}
          />
        </div>

        <div className="flex-1 min-w-[clamp(160px,18%,100%)]">
          <FilterDropdown
            type="categories"
            label="Catégorie"
            placeholder="Rechercher..."
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

        <div className="flex-1 min-w-[clamp(160px,18%,100%)]">
          <FilterDropdown
            type="authors"
            label="Auteur"
            placeholder="Rechercher..."
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

        <div className="flex-1 min-w-[clamp(160px,18%,100%)]">
          <FilterDropdown
            type="titles"
            label="Titre"
            placeholder="Rechercher..."
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

        <div className="flex-1 min-w-[clamp(140px,15%,100%)]">
          <FilterDropdown
            type="languages"
            label="Langue"
            placeholder="Sélectionner..."
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

      {hasActiveFilters() && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={resetFilters}
            className="bg-red-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
};

export default FiltersSection;