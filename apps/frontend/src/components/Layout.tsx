import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/features/auth/components/useAuth';

export const Layout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <>
      {!isLandingPage && <Header />}
      <main className={user && !isLandingPage ? "pb-16" : ""}>
        <Outlet />
      </main>
      {user && !isLandingPage && <BottomNav />}
    </>
  );
};