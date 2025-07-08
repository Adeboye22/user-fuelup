import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import Home from './pages/Home';
import MainLayout from './layouts/MainLayout';
function App() {  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="fuelup-ui-theme">
      <Router>
        <Routes>
          {/* Public Routes with MainLayout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
          </Route>

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
