import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import PublicRoute from './routes/PublicRoute';
import MainLayout from './layouts/MainLayout';

// Main pages
const Home = lazy(() => import('./pages/Home'));

function App() {  

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route index element={<Home />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
