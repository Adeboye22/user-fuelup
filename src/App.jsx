import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Routes
import PublicRoute from './routes/PublicRoute';

import ScrollToTop from './Components/ScrollToTop';
import { ThemeProvider } from './components/theme-provider';

// Layouts
const MainLayout = lazy(() => import('./layouts/MainLayout'));

// Main pages
const Home = lazy(() => import('./pages/Home'));

function App() {  

  return (
      <Router>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Toaster position="top-right" />
          <Routes>
            {/* Main routes with MainLayout - wrap with PublicRoute */}
            <Route element={
              <Suspense>
                <PublicRoute>
                  <MainLayout />
                </PublicRoute>
              </Suspense>
            }>
              <Route index element={<Home />} />
            </Route>
          </Routes>
          <ScrollToTop />
        </ThemeProvider>
      </Router>
  );
}

export default App;
