'use client';

import { useUser } from '@/firebase';
import { usePathname, redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { Icons } from './icons';

// These are the routes that are publicly accessible
const publicRoutes = ['/login'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Icons.Spinner className="size-8 animate-spin" />
      </div>
    );
  }

  const isPublicRoute = publicRoutes.includes(pathname);

  if (!user && !isPublicRoute) {
    redirect('/login');
  }

  if (user && isPublicRoute) {
    redirect('/chat');
  }

  return <>{children}</>;
}
