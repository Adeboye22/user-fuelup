import React from 'react';

const ContactSection = () => {
  return (
    <section className="py-16 relative bg-gray-100 dark:bg-gray-900">
        {/* Background with overlay */}
        <div className='absolute top-0 left-0 w-full h-full'>
          <img src="/assets/map.jpg" className='absolute top-0 left-0 w-full h-full object-cover' alt="cta nozzle" />
          {/* <div className='absolute top-0 left-0 w-full h-full bg-gray-100/30 dark:bg-gray-900/70' /> */}
        </div>
        <div className="max-w-5xl mx-auto px-6 relative">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Get in Touch</h2>
                <div className="w-16 h-1 bg-green-500 mx-auto"></div>
            </div>
            
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-8">
                {/* Contact Card */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-b-4 border-green-500">
                    <div className="flex flex-col h-full">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Contact Information</h3>
                        
                        <div className="space-y-6 flex-grow">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-4">
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Email</p>
                                    <a href="mailto:info@fuelup.ng" className="text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors">info@fuelup.ng</a>
                                </div>
                                </div>
                                
                                <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-4">
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Phone</p>
                                    <a href="tel:+2348003835387" className="text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors">+234 800 FUEL UP</a>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-4">
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Address</p>
                                    <p className="text-gray-800 dark:text-gray-200">123 Fuel Street, Victoria Island</p>
                                    <p className="text-gray-800 dark:text-gray-200">Lagos, Nigeria</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Social Media Card */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-b-4 border-green-500">
                    <div className="flex flex-col h-full">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Connect With Us</h3>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

export default ContactSection;