import React from 'react';

const SearchSuggestions = ({ suggestions, onSelectSuggestion, darkMode, searchQuery, isLoading }) => {
  const handleSuggestionClick = (suggestion) => {
    // Pass the full suggestion object or just the description
    const searchText = typeof suggestion === 'string' ? suggestion : suggestion.description;
    onSelectSuggestion(searchText);
  };

  const handleSearchCurrent = () => {
    if (searchQuery.trim()) {
      onSelectSuggestion(searchQuery);
    }
  };

  if (!suggestions.length && !searchQuery) {
    return null;
  }

  return (
    <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-50 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
      <div className="p-2 max-h-64 overflow-y-auto">
        {/* Loading indicator */}
        {isLoading && (
          <div className={`p-2 rounded flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
            <span>Se caută...</span>
          </div>
        )}

        {/* Opțiunea de căutare a textului curent */}
        {searchQuery && !isLoading && (
          <div 
            className={`p-2 rounded cursor-pointer hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors flex items-center`}
            onClick={handleSearchCurrent}
          >
            <span className="text-gray-500 mr-2">🔍</span>
            <span>Căutați "{searchQuery}"</span>
          </div>
        )}
        
        {/* Google Places suggestions ordered by distance */}
        {suggestions.length > 0 && !isLoading && suggestions.map((suggestion, index) => {
          const isStringType = typeof suggestion === 'string';
          const displayText = isStringType ? suggestion : suggestion.description;
          const mainText = isStringType ? suggestion : (suggestion.structured_formatting?.main_text || suggestion.description);
          const secondaryText = isStringType ? '' : suggestion.structured_formatting?.secondary_text;
          const distanceText = isStringType ? '' : suggestion.distanceText;

          return (
            <div
              key={index}
              className={`p-2 rounded cursor-pointer hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors flex items-center justify-between`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center flex-1 min-w-0">
                <span className="text-gray-500 mr-2 flex-shrink-0">📍</span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium truncate">{mainText}</span>
                  {secondaryText && (
                    <span className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {secondaryText}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Distance badge */}
              {distanceText && distanceText !== 'Distanță necunoscută' && (
                <div className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                }`}>
                  {distanceText}
                </div>
              )}
            </div>
          );
        })}

        {/* No results message */}
        {suggestions.length === 0 && searchQuery && !isLoading && (
          <div className={`p-2 rounded flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <span className="text-gray-500 mr-2">❌</span>
            <span>Nu s-au găsit rezultate</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchSuggestions;