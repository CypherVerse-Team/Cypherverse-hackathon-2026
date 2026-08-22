'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DrawoiAdminLayout from '@/components/DrawoiAdminLayout';
import { useAuth } from '@/context/AuthContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <DrawoiAdminLayout>{children}</DrawoiAdminLayout>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans">
      {/* Main Top Header Navbar for Public Visitors */}
      <Navbar />

      {/* Main Page Content Area */}
      <main className="flex-grow w-full py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
