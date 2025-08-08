"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ModernNavbar from '../_components/Navbar';

const InnerPageLayout = ({ children }) => {
  const router = useRouter();
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      },
    },
  }));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');

    // If no token found, redirect to login page
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  // If authenticated, render children wrapped in QueryClientProvider
  if (isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <ModernNavbar />
        {children}
      </QueryClientProvider>
    );
  }

  // Return empty div if not authenticated (will redirect)
  return <div className="hidden"></div>;
};

export default InnerPageLayout;