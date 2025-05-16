import { useState } from 'react'
import searchIcon from '../assets/search.svg'
function NavBar() {

  return (
    <>
   <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-lg flex items-center justify-around max-w-11/12 min-w-5/6 h-12 px-4">

    <input type="text" placeholder='Ce iti doresti sa vizitezi ?' className='w-full '/>
    
    <img src={searchIcon} alt="Iconita Cautare" className='max-w-8'/>


   </div>


    </>
  )
}

export default NavBar
