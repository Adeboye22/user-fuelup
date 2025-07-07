import { lazy} from 'react';

// Main pages
const Home = lazy(() => import('./pages/Home'));

function App() {  
  return (
    <div>Hello world</div>
  );
}

export default App;
