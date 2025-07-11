// src/layouts/MainLayout.jsx
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <main className='overflow-hidden'>
        <Suspense>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;