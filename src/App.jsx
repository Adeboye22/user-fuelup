
import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";

const MainLayout = lazy(() => import("./layouts/MainLayout"));
const Home = lazy(() => import("./pages/Home"));

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Suspense fallback={<div style={{ textAlign: "center" }}>Loading…</div>}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<Home />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
