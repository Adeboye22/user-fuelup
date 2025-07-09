"use client"
import { motion } from "framer-motion"
import { FaArrowRight } from "react-icons/fa"
import { Link } from "react-router-dom"

const Hero = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById("contact")
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto text-white text-center flex flex-col items-center"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <span className="inline-block bg-yellow-400/20 text-white font-medium text-sm px-4 py-1 rounded-full">
          Nigeria's First Fuel Dispatch Service
        </span>
      </motion.div>

      <motion.h1
        className="text-4xl md:text-6xl font-bold leading-tight mb-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        Efficient Fuel Delivery
        <span className="block">
          at Your <span className="text-yellow-400">Doorstep</span>
        </span>
      </motion.h1>

      <motion.p
        className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        No more queues, no more waiting. We bring the fuel to you,
        <span className="text-emerald-400 font-semibold"> anytime, anywhere</span>.
      </motion.p>

      <motion.div
        className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-center w-72 lg:w-full lg:max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Link
          to="/signup"
          className="px-8 py-4 w-full bg-emerald-600 text-white font-bold rounded-full shadow-lg hover:bg-emerald-500 transition-colors duration-300 flex items-center justify-center"
        >
          Get Started
          <FaArrowRight className="ml-2" />
        </Link>
        <a
          href="#about"
          className="px-8 py-4 w-full bg-transparent text-white border-2 border-white font-bold rounded-full hover:bg-white/10 transition-colors duration-300 text-center"
        >
          Learn More
        </a>
      </motion.div>

      <motion.div
        className="mt-16 flex justify-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1.0, duration: 0.6 }}
      >
        <div className="flex flex-wrap items-center justify-center gap-6 bg-white/10 backdrop-blur-sm px-8 py-4 rounded-xl">
          <div className="flex items-center">
            <div className="bg-emerald-500 rounded-full h-3 w-3 mr-2"></div>
            <span className="text-sm">24/7 Service</span>
          </div>
          <div className="flex items-center">
            <div className="bg-emerald-500 rounded-full h-3 w-3 mr-2"></div>
            <span className="text-sm">Fast Delivery</span>
          </div>
          <div className="flex items-center">
            <div className="bg-emerald-500 rounded-full h-3 w-3 mr-2"></div>
            <span className="text-sm">Secure Payments</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Hero
