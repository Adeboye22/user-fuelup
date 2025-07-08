import Hero from '@/components/Hero';
import { Truck } from 'lucide-react';
import React, { useEffect } from 'react';
import Marquee from 'react-fast-marquee';
import { FaChevronDown } from 'react-icons/fa';

const Home = () => {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

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
          <Hero />
          
          {/* Scroll indicator */}
          <div 
            className="absolute bottom-8 lg:bottom-12 left-1/2 transform -translate-x-1/2 text-white"
          >
            <a href="#services" className="flex flex-col items-center">
              <span className="text-sm font-light mb-2">Scroll Dow</span>
              <FaChevronDown className="text-green-500" />
            </a>
          </div>
        </div>
      </section>

      {/* Announcement Bar */}
      <div className="bg-yellow-600/80 shadow-lg">
        <div className="container mx-auto py-3">
          <Marquee
            speed={40}
            pauseOnHover={true}
            gradient={false}
            className="text-white"
          >
            <p className="text-lg font-medium mx-4">You don't have to compromise your comfort just to get fuel. You order from the nearest filling station, we deliver!</p>
            <span className="text-2xl mx-4 inline-block scale-x-[-1] text-emerald-600 rounded-full bg-emerald-800/10 p-4">
              <Truck />
            </span>
            <p className="text-lg font-medium mx-4">Petrol (PMS) at N00.00, Diesel (AGO) at N00.00, Kerosene (DPK) at N00.00.</p>
            <span className="text-2xl mx-4 inline-block scale-x-[-1] text-emerald-600 rounded-full bg-emerald-800/10 p-4">
              <Truck />
            </span>
          </Marquee>
        </div>
      </div>
    </div>
  );
};

export default Home;