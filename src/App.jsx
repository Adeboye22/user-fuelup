import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import Home from './pages/Home';
import PublicRoute from './routes/PublicRoute';
import MainLayout from './layouts/MainLayout';
function App() {  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
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
      </Router>
    </ThemeProvider>
  );
}

export default App;
