import { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';

// Main pages
const Home = lazy(() => import('./pages/Home'));

function App() {  

  return (
      <Router>
        <Routes>
            {/* Main routes with MainLayout - wrap with PublicRoute */}
            <Route index element={<Home />} />
          </Routes>
      </Router>
  );
}

export default App;
