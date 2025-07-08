// Location.jsx - Redesigned location section
import React from 'react';
import Marquee from 'react-fast-marquee';
import { FaMapMarkerAlt, FaTruck } from 'react-icons/fa';

const Location = () => {
  const locations = [
    "Lekki Phase 1",
    "Lekki Phase 2"
  ];

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-green-500 mb-8">Service Locations</h2>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
          <div className="flex items-center justify-center mb-8">
            <FaTruck size={36} className="text-green-500 mr-4" />
            <h3 className="text-xl font-bold text-white">We deliver to the following areas:</h3>
          </div>
          
          <div className="space-y-4 mb-8">
            {locations.map((location, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between bg-gray-700 p-4 rounded-lg"
              >
                <span className="text-lg font-medium text-white">{location}</span>
                <FaMapMarkerAlt className="text-red-500 text-xl" />
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-gray-900 rounded-lg overflow-hidden">
            <Marquee speed={40} gradientWidth={50} gradientColor={[23, 23, 28]}>
              <span className="text-lg font-medium text-green-500 px-4">...other areas will be announced soon!</span>
            </Marquee>
          </div>
        </div>
      </div>
      
      
    </div>
  );
};

export default Location;