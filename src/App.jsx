import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';

// Main pages
const Home = lazy(() => import('./pages/Home'));

function App() {  
  return (
      <Router>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          {/* Main routes with MainLayout - wrap with PublicRoute */}
          <Routes>
            <Route index element={<div>Hello world</div>} />
          </Routes>
        </ThemeProvider>
      </Router>
  );
}

export default App;
