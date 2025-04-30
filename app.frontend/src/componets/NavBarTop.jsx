import { useState } from 'react';
import searchIcon from '../assets/search.svg';

function NavBarTop() {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-lg flex items-center justify-between max-w-11/12 min-w-5/6 h-14 px-4">
      {/* Iconița locației */}
      <div className="flex items-center justify-center bg-red-500 text-white w-10 h-10 rounded-full mr-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 11c1.656 0 3-1.344 3-3s-1.344-3-3-3-3 1.344-3 3 1.344 3 3 3zm0 0v10m0-10a4.5 4.5 0 100-9 4.5 4.5 0 000 9z"
          />
        </svg>
      </div>

      {/* Ceva Text */}



      {/* Iconița glob */}
      <div className="flex items-center justify-center bg-blue-500 text-white w-10 h-10 rounded-full ml-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2a10 10 0 110 20 10 10 0 010-20zm0 0c-3.866 0-7 4.03-7 9s3.134 9 7 9 7-4.03 7-9-3.134-9-7-9zm0 0v18m0-18a10 10 0 000 18"
          />
        </svg>
      </div>
    </div>
  );
}

export default NavBarTop;