import React, { useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="text-gray-100 font-sans">
      {/* Hero Section with fullscreen height */}
      <section className="relative flex items-center justify-center overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/assets/Nozzle.jpg')] bg-cover bg-center bg-fixed"></div>
          <div className="absolute inset-0 bg-black/75"></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto py-32 lg:py-28 px-4 relative z-10">
          Hero
          
          {/* Scroll indicator */}
          <div 
            className="absolute bottom-8 lg:bottom-12 left-1/2 transform -translate-x-1/2 text-white"
          >
            <a href="#services" className="flex flex-col items-center">
              <span className="text-sm font-light mb-2">Scroll Down</span>
              <FaChevronDown className="text-green-500" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;