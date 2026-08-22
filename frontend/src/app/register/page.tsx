'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?mode=register');
  }, [router]);

  return (
    <div className="flex justify-center items-center py-20 text-gray-500 text-sm font-medium">
      Redirecting to ShramSetu Unified Sign Up...
    </div>
  );
}
