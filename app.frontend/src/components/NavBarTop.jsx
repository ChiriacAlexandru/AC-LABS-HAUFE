import { useState } from 'react';
import searchIcon from '../assets/search.svg';
import locationIcon from '../assets/location.svg';
import globeIcon from '../assets/globe.svg';
function NavBarTop() {
  return (
    <nav className=" fixed top-4 left-1/2 transform -translate-x-1/2 rounded-full flex items-center justify-between max-w-[90%] min-w-[90%] h-12 px-4">
    {/* Stânga: icon + text */}
    <div className="flex items-center h-12  bg-white rounded-full px-3 py-1 flex-grow mr-2">
      <div className="text-lg mr-2">
        <img src={locationIcon} className='max-w-[25px]' />
      </div>
      <span className="text-sm font-medium text-gray-800">Traseele mele</span>
    </div>
  
    {/* Dreapta: icon rotund */}
    <div className=" w-12  bg-white h-12 rounded-full flex items-center justify-center">
    <img src={globeIcon} className='max-w-[25px]' />
    </div>
  </nav>
  );
}

export default NavBarTop;