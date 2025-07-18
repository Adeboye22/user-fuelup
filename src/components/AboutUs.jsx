"use client"
import { motion } from "framer-motion"
import { useTheme } from "./theme-provider"

const AboutUs = () => {
  const { theme } = useTheme()

  const benefits = [
    {
      icon: "⏱️",
      title: "Time-Saving",
      description:
        "Skip the queues and let us come to you. We save you time so you can focus on what matters.",
    },
    {
      icon: "💰",
      title: "Affordable Service",
      description:
        "You don’t need to spend more than necessary. Our delivery is cost-effective and fair.",
    },
    {
      icon: "📈",
      title: "Smarter Fuel Use",
      description:
        "Businesses don’t have to worry about fueling logistics. We help simplify the process and improve planning.",
    },
    {
      icon: "🛡️",
      title: "Safe & Secure",
      description:
        "Your safety comes first. Our team is trained, licensed, and committed to clean and careful delivery.",
    },
  ]

  return (
    <motion.div
      className=""
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* Top Section */}
      <motion.div
        className="relative max-w-7xl mx-auto px-4 mb-32"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute left-1/4 top-0 w-64 h-64 bg-green-500/10 dark:bg-green-500/5 rounded-full blur-3xl"></div>
          <div className="absolute right-1/4 top-1/3 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative">
          <div className="flex flex-col md:flex-row items-center gap-16">
            {/* Text Section */}
            <motion.div
              className="md:w-1/2 z-10"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h2 className="text-5xl font-bold mb-6 inline-block">
                <span className="text-emerald-500">About Us</span>
              </h2>

              <p className="text-lg text-gray-800 dark:text-gray-200 mb-8 leading-relaxed">
                FuelUp is Nigeria’s first doorstep fuel delivery service. We’re here to take the stress out of buying
                fuel. No more long queues or emergency panic. Just tap, order, and relax while we bring fuel to you.
              </p>

              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-full bg-green-500/20 dark:bg-green-500/10 flex items-center justify-center">
                  <span className="text-green-400 text-2xl">01</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200">Pioneering fuel dispatch in Nigeria</p>
              </div>

              <div className="mt-6 mb-8 w-full h-px bg-gradient-to-r from-green-500/50 via-blue-500/50 to-transparent dark:from-green-500/30 dark:via-blue-500/30"></div>

              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-full bg-blue-500/20 dark:bg-blue-500/10 flex items-center justify-center">
                  <span className="text-blue-400 text-2xl">02</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200">Safe and dependable doorstep delivery</p>
              </div>

              {/* Why FuelUp */}
              <motion.div
                className="relative overflow-hidden mt-24"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold text-emerald-500 mb-6">Why Fuel Up?</h2>
                <div className="w-16 h-1 bg-green-400 rounded-full mb-6"></div>

                <div className="shadow hover:shadow-xl transition-all duration-500 transform cursor-pointer backdrop-blur-sm md:col-span-2 p-6 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    Whether it’s day or night, FuelUp delivers fuel when and where you need it. From topping up your
                    generator at home to powering your business operations, we’re always just a click away. And yes, we’re
                    preparing to serve bulk orders for schools, hotels, and big facilities too.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* App Preview Image */}
            <motion.div
              className="md:w-1/2 relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="relative w-full max-w-sm mx-auto perspective-1000">
                <div className="relative transform-style-3d rotate-y-12 group">
                  <div className="relative bg-gray-900 rounded-[2rem] p-2 overflow-hidden shadow-2xl">
                    <div className="overflow-hidden rounded-[1.7rem]">
                      {theme === "light" ? (
                        <img
                          src="/assets/fuelup-dashboard.png"
                          alt="FuelUp App"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <img
                          src="/assets/fuelup-dashboard-dark.png"
                          alt="FuelUp App"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                  </div>

                  <div className="absolute -top-10 -right-8 bg-gray-800 dark:bg-gray-700 rounded-lg p-3 shadow-xl transform rotate-6 z-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                        🔥
                      </div>
                      <p className="text-white text-sm">Fast Delivery</p>
                    </div>
                  </div>

                  <div className="absolute -bottom-8 -left-4 bg-gray-800 dark:bg-gray-700 rounded-lg p-3 shadow-xl transform -rotate-3 z-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                        ⛽
                      </div>
                      <p className="text-white text-sm">Premium Fuel</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Benefits Section */}
      <motion.div
        className="px-4 mb-20 rounded-xl bg-gray-200/90 dark:bg-gray-900 py-24"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-green-500 mb-6">Benefits</h2>
          <p className="text-xl text-gray-800 dark:text-gray-200 max-w-3xl mx-auto">
            From saving your time to making life easier, FuelUp is built to serve both everyday users and growing
            businesses.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 shadow rounded-2xl p-8 hover:translate-y-[-6px] transition-all duration-300 group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <div className="mb-6 text-4xl">{benefit.icon}</div>
              <h3 className="text-xl text-gray-800 dark:text-gray-100 font-bold mb-4 group-hover:text-green-400 transition-colors duration-300">
                {benefit.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        className="max-w-4xl mx-auto px-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 border-l-4 border-red-500 rounded-r-xl p-8">
          <div className="flex items-start space-x-4">
            <div className="min-w-max pt-1">
              <svg
                className="w-6 h-6 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-red-500 text-lg font-bold mb-2">Disclaimer Notice:</h3>
              <p className="text-gray-50">
                Please note: FuelUp does not sell or store fuel. We only dispatch fuel based on your order, sourcing
                directly from verified nearby filling stations.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AboutUs
