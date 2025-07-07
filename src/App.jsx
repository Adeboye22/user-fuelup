import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import PublicRoute from './routes/PublicRoute';
import MainLayout from './layouts/MainLayout';

// Main pages
const Home = lazy(() => import('./pages/Home'));

function App() {  

  return (
      <Router>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          {/* Main routes with MainLayout - wrap with PublicRoute */}
          <Routes>
            <Route index element={<Home />} />
          </Routes>
        </ThemeProvider>
      </Router>
  );
}

export default App;
