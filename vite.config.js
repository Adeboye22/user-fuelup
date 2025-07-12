import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import generateSitemap from "vite-plugin-sitemap"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    generateSitemap({
      hostname: 'https://www.fuelupng.com/',
      robots: [
        {
          userAgent: '*',
          allow: '/',
        }
      ],
      dynamicRoutes: [
        '/',
        '/signin',
        '/signup', 
        '/forgot-password'
      ]
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
