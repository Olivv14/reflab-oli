import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/features/auth/components/useAuth';

export const Layout: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Header />
      <main className={user ? "pb-16" : ""}>
        <Outlet />
      </main>
      {user && <BottomNav />}
    </>
  );
};