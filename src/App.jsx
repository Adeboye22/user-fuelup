import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';

// Main pages
const Home = lazy(() => import('./pages/Home'));

function App() {  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div>Hello world</div>
    </ThemeProvider>
  );
}

export default App;
