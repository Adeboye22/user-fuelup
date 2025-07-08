// src/layouts/MainLayout.jsx
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '@/components/Footer';

const MainLayout = () => {
  return (
    <>
      <main>
        <Suspense>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;