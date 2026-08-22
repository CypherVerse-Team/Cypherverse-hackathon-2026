'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Left Sidebar for logged in users */}
      {isAuthenticated && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Main Top Header Navbar */}
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Page Content Area */}
      <main className={`flex-grow w-full py-8 transition-all duration-300 ${isAuthenticated ? 'lg:pl-72' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className={`transition-all duration-300 ${isAuthenticated ? 'lg:pl-72' : ''}`}>
        <Footer />
      </footer>
    </div>
  );
}
