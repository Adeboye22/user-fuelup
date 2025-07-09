"use client"

import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, PhoneCall, Linkedin } from "lucide-react"

const ContactSection = () => {
  return (
    <motion.section
      className="py-16 relative bg-gray-100 dark:bg-gray-900"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* Background with overlay */}
      <div className="absolute top-0 left-0 w-full h-full">
        <img src="/assets/map.jpg" className="w-full h-full object-cover" alt="World map background" />
        <div className="absolute top-0 left-0 w-full h-full bg-gray-200/60 dark:bg-gray-900/80" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Get in Touch</h2>
          <div className="w-16 h-1 bg-green-500 mx-auto"></div>
        </motion.div>

        <div className="flex flex-col md:flex-row items-stretch justify-between gap-8">
          {/* Contact Card */}
          <motion.div
            className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-b-4 border-green-500"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex flex-col h-full">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Contact Information</h3>

              <div className="space-y-6 flex-grow">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-4">
                    <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Email</p>
                    <a
                      href="mailto:info@fuelup.ng"
                      className="text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    >
                      info@fuelup.ng
                    </a>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-4">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Phone</p>
                    <a
                      href="tel:+2348003835387"
                      className="text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    >
                      +234 800 FUEL UP
                    </a>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-4">
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Address</p>
                    <p className="text-gray-800 dark:text-gray-200">123 Fuel Street, Victoria Island</p>
                    <p className="text-gray-800 dark:text-gray-200">Lagos, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Social Media Card */}
          <motion.div
            className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-b-4 border-green-500"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex flex-col h-full">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Connect With Us</h3>
              <div className="grid grid-cols-3 gap-4 flex-grow">
                <a
                  href="https://web.facebook.com/fuelupnigeria"
                  target="_blank"
                  className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-green-500 dark:hover:bg-green-500 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-white dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="w-6 h-6" />
                </a>

                <a
                  href="https://x.com/Fuelupnaija?t=9mfY2ijqSS8Qs5yAiej56g&s=09"
                  target="_blank"
                  className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-green-500 dark:hover:bg-green-500 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-white dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                  aria-label="Follow us on Twitter"
                >
                  <Twitter className="w-6 h-6" />
                </a>

                <a
                  href="https://www.instagram.com/fuelupnigeria?utm_source=qr&igsh=Zm05bnY3YWExYm1n "
                  target="_blank"
                  className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-green-500 dark:hover:bg-green-500 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-white dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="w-6 h-6" />
                </a>

                <a
                  href="#"
                  target="_blank"
                  className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-green-500 dark:hover:bg-green-500 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-white dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                  aria-label="Follow us on Instagram"
                >
                  <Linkedin className="w-6 h-6" />
                </a>

                <a
                  href="#"
                  target="_blank"
                  className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-green-500 dark:hover:bg-green-500 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-white dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                  aria-label="Follow us on Instagram"
                >
                  <PhoneCall className="w-6 h-6" />
                </a>

                <a
                  href="mailto:info@fuelup.ng"
                  target="_blank"
                  className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-green-500 dark:hover:bg-green-500 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-white dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                  aria-label="Follow us on Instagram"
                >
                  <Mail className="w-6 h-6" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default ContactSection
