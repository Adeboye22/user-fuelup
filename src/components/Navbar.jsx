"use client"

import { useState, useEffect, useRef } from "react"
import { FiMenu, FiX } from "react-icons/fi"
import { ModeToggle } from "./mode-toggle"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const mobileMenuRef = useRef(null)
  const menuButtonRef = useRef(null)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)

      // Update active section based on scroll position
      const sections = ["home", "services", "about", "packages", "contact"]
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const offsetTop = element.offsetTop
          const offsetHeight = element.offsetHeight

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle click outside to close navbar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeNavBar = () => {
    setIsOpen(false)
  }

  const scrollToSection = (sectionId) => {
    closeNavBar()
    setTimeout(() => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  const scrollToTop = () => {
    closeNavBar()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const navItems = [
    { id: "home", label: "Home", action: scrollToTop },
    { id: "services", label: "Services", action: () => scrollToSection("services") },
    { id: "about", label: "About", action: () => scrollToSection("about") },
    { id: "packages", label: "Packages", action: () => scrollToSection("packages") },
  ]

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/85 dark:bg-gray-900/85 backdrop-blur-lg shadow-lg py-3"
          : "bg-transparent dark:bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <div className="flex-shrink-0">
              <button onClick={scrollToTop}>
                <img src="/icons/Logo.png" className='h-14' alt="fuel logo" />
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center gap-10">
                <div className="flex items-center gap-10">
                  {navItems.map((item) => (
                    <div key={item.id}>
                      <button
                        onClick={item.action}
                        className={`${scrolled ? "text-gray-800 dark:text-gray-200" : "text-white dark:text-gray-200"}
                         hover:text-emerald-500 dark:hover:text-emerald-400 px-2 py-1 text-sm font-medium transition-all duration-300 relative
                        ${activeSection === item.id ? "font-semibold" : ""}`}
                      >
                        {item.label}
                        {activeSection === item.id && (
                          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 dark:bg-emerald-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                <div
                  className={`w-[1px] h-8 ${scrolled ? "bg-gray-300 dark:bg-gray-700" : "bg-white/30 dark:bg-gray-600/30"} transition-colors duration-300`}
                />

                <div className="flex items-center gap-6">
                  <div>
                    <button
                      onClick={() => scrollToSection("contact")}
                      className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-full shadow-md text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all duration-300 transform hover:scale-105"
                    >
                      Contact Us
                    </button>
                  </div>

                  <div>
                    <ModeToggle />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-6">
            <ModeToggle />
            <button
              ref={menuButtonRef}
              onClick={toggleMenu}
              className={`inline-flex items-center justify-center p-2 rounded-full ${
                scrolled
                  ? "text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800"
                  : "text-white dark:text-gray-200 bg-white/10 dark:bg-gray-800/10"
              } hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 focus:outline-none transition-all duration-300`}
              aria-expanded="false"
            >
              <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
              <div className="transition-transform duration-200">
                {isOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div ref={mobileMenuRef} className="md:hidden overflow-hidden transition-all duration-300 ease-in-out">
          <div className="px-3 pt-3 pb-4 space-y-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-xl rounded-b-xl border-t border-gray-100 dark:border-gray-800">
            <div>
              {navItems.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={item.action}
                    className={`block w-full text-left px-4 py-2.5 rounded-lg text-base font-medium transition-all duration-200 ${
                      activeSection === item.id
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                        : "text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-emerald-500 dark:hover:text-emerald-400"
                    }`}
                  >
                    {item.label}
                  </button>
                </div>
              ))}

              <div>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="w-full mt-2 text-center block px-4 py-3 rounded-lg text-base font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md transition-all duration-300"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
