import React, { useRef, useEffect } from 'react';

const SearchBar = ({ searchQuery, onSearchChange, darkMode, onLocationSearch, isSearching, onSuggestionsChange }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const handleSearch = () => {
    if (searchQuery.trim() && onLocationSearch) {
      onLocationSearch(searchQuery.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    onSearchChange(e);
    
    // Clear suggestions if empty
    if (!value.trim()) {
      onSuggestionsChange([]);
    }
  };

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (window.google?.maps?.places && inputRef.current && !autocompleteRef.current) {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      
      const handlePlacesPredictions = (query) => {
        if (!query.trim()) {
          onSuggestionsChange([]);
          return;
        }

        const request = {
          input: query,
          language: 'ro',
          componentRestrictions: { country: 'ro' }, // Restrict to Romania
          types: ['establishment', 'geocode'], // Include businesses and addresses
        };

        autocompleteService.getPlacePredictions(request, (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            const suggestions = predictions.map(prediction => ({
              description: prediction.description,
              place_id: prediction.place_id,
              structured_formatting: prediction.structured_formatting
            }));
            onSuggestionsChange(suggestions);
          } else {
            onSuggestionsChange([]);
          }
        });
      };

      // Debounce function to avoid too many API calls
      let timeoutId;
      const debouncedSearch = (query) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => handlePlacesPredictions(query), 300);
      };

      autocompleteRef.current = debouncedSearch;
    }
  }, [onSuggestionsChange]);

  // Trigger autocomplete when searchQuery changes
  useEffect(() => {
    if (autocompleteRef.current && searchQuery) {
      autocompleteRef.current(searchQuery);
    }
  }, [searchQuery]);

  return (
    <div className={`flex items-center rounded-full overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-sm`}>
      <span className="text-gray-500 ml-4">📍</span>
      <input
        ref={inputRef}
        type="text"
        placeholder="Căutați destinații, atracții..."
        className={`w-full py-3 px-3 outline-none border-none ${darkMode ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'} text-sm`}
        value={searchQuery}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
      />
      <button 
        className="p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-r-full"
        onClick={handleSearch}
        disabled={isSearching}
        title="Căutați și calculați traseu"
      >
        {isSearching ? (
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        ) : (
          <span className="text-gray-500 mr-1">🔍</span>
        )}
      </button>
    </div>
  );
};

export default SearchBar;