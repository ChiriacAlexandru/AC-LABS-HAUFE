import React, { useState } from 'react';
import SearchBar from "../Search/SerchBar";
import SearchSuggestions from './SearchSuggestions';

const SearchContainer = ({
  searchQuery,
  onSearchChange,
  showSuggestions,
  suggestions,
  onSelectSuggestion,
  darkMode,
  onLocationSearch,
  isSearching
}) => {
  const [googleSuggestions, setGoogleSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const handleSuggestionsChange = (newSuggestions) => {
    setGoogleSuggestions(newSuggestions);
    setIsLoadingSuggestions(false);
  };

  const handleSearchChange = (e) => {
    onSearchChange(e);
    if (e.target.value.trim()) {
      setIsLoadingSuggestions(true);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    onSelectSuggestion(suggestion);
    setGoogleSuggestions([]); // Clear suggestions after selection
  };

  // Combine original suggestions with Google suggestions
  const combinedSuggestions = [
    ...googleSuggestions,
    ...suggestions.filter(s => 
      !googleSuggestions.some(gs => 
        (typeof gs === 'string' ? gs : gs.description).toLowerCase() === s.toLowerCase()
      )
    )
  ];

  return (
    <div className="relative mb-4 mt-2">
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        darkMode={darkMode}
        onLocationSearch={onLocationSearch}
        isSearching={isSearching}
        onSuggestionsChange={handleSuggestionsChange}
      />
      
      {showSuggestions && (searchQuery || combinedSuggestions.length > 0) && (
        <SearchSuggestions
          suggestions={combinedSuggestions}
          onSelectSuggestion={handleSelectSuggestion}
          darkMode={darkMode}
          searchQuery={searchQuery}
          isLoading={isLoadingSuggestions}
        />
      )}
    </div>
  );
};

export default SearchContainer;