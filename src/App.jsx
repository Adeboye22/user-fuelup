import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';

// Main pages
const Home = lazy(() => import('./pages/Home'));

function App() {  
  return (
    <div>Hello world</div>
  );
}

export default App;
