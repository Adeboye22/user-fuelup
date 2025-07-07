import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import Home from './pages/Home';
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
