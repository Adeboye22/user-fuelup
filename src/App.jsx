import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import ScrollToTop from './Components/ScrollToTop';
import { ThemeProvider } from './components/theme-provider';

// Main pages
const Home = lazy(() => import('./pages/Home'));

function App() {  

  return (
      <Router>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Toaster position="top-right" />
          <Routes>
            {/* Main routes with MainLayout - wrap with PublicRoute */}
            <Route index element={<Home />} />
          </Routes>
          <ScrollToTop />
        </ThemeProvider>
      </Router>
  );
}

export default App;
