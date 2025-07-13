"use client"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Fuel, Clock, Smartphone, Truck, CheckCircle, Headphones } from "lucide-react"

const OurService = () => {
  const navigate = useNavigate()

  const handleServiceClick = (serviceIndex) => {
    // Don't navigate for bulk orders (index 3) since it's coming soon
    if (serviceIndex !== 3) {
      navigate("/signin")
    }
  }

  const services = [
    {
      icon: <Fuel size={24} />,
      title: "Fuel Delivery",
      description: "We bring quality fuel right to your doorstep. No lines, no stress.",
      delay: 0.1,
    },
    {
      icon: <Clock size={24} />,
      title: "Anytime, Anywhere",
      description: "Fuel emergencies? We're on standby 24/7 to keep you going.",
      delay: 0.2,
    },
    {
      icon: <Smartphone size={24} />,
      title: "Mobile Friendly",
      description: "Order fuel with just a few taps on your phone. It's that easy.",
      delay: 0.3,
    },
    {
      icon: <Truck size={24} />,
      title: "Bulk Orders",
      description: "Need fuel in large quantities? We've got the fleet for that.",
      delay: 0.4,
      comingSoon: true,
    },
    {
      icon: <CheckCircle size={24} />,
      title: "Top-Grade Quality",
      description: "We only deliver clean, premium fuel that meets strict standards.",
      delay: 0.5,
    },
    {
      icon: <Headphones size={24} />,
      title: "Reliable Support",
      description: "Got questions or issues? Our team is always ready to help.",
      delay: 0.6,
    },
  ]

  return (
    <motion.section
      className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="max-w-6xl mx-auto mb-16 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Why People <span className="text-yellow-500">Choose Us</span>
          </h2>
          <div className="h-1 w-16 bg-emerald-500 mx-auto mb-8 rounded-full"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            We're not just another fuel company. We're on a mission to make fuel delivery fast, reliable, and
            completely stress-free.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {services.map((service, index) => (
          <motion.div
            key={index}
            className="relative group"
            onClick={() => handleServiceClick(index)}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: service.delay, duration: 0.6 }}
          >
            <div className={`bg-gray-100/80 dark:bg-gray-800 p-8 rounded-3xl shadow hover:shadow-xl transition-all duration-500 h-full transform group-hover:-translate-y-2 backdrop-blur-sm relative ${
              service.comingSoon ? 'cursor-default opacity-90' : 'cursor-pointer'
            }`}>
              {/* Coming Soon Badge */}
              {service.comingSoon && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-xl shadow-lg animate-pulse">
                    Coming Soon
                  </span>
                </div>
              )}

              <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-500 opacity-0 group-hover:opacity-5 rounded-full blur-xl transition-all duration-500"></div>

              <div className={`w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900 flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 transition-all duration-300 ${
                service.comingSoon 
                  ? 'opacity-70' 
                  : 'group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-emerald-200 dark:group-hover:shadow-emerald-900 group-hover:shadow-lg'
              }`}>
                {service.icon}
              </div>

              <h3 className={`font-bold text-xl text-gray-900 dark:text-gray-100 mb-3 transition-colors duration-300 ${
                service.comingSoon 
                  ? '' 
                  : 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
              }`}>
                {service.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{service.description}</p>

              <div className="mt-6 pt-4 transition-opacity duration-300 border-t border-emerald-200 dark:border-emerald-800">
                <span className={`font-medium flex items-center ${
                  service.comingSoon 
                    ? 'text-gray-400 dark:text-gray-500' 
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {service.comingSoon ? 'Stay tuned' : 'Learn more'}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ml-1 transition-transform duration-300 ${
                      service.comingSoon ? '' : 'transform group-hover:translate-x-2'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

export default OurService