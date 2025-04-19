"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Loading component
const Loading = () => (
  <div className="p-8 text-center">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
      <div className="h-64 w-full max-w-2xl bg-gray-200 rounded mb-4"></div>
    </div>
    <p className="mt-4 text-gray-600">Redirecting to Manual page...</p>
  </div>
);

export default function ManualViewerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    // Redirect to manual page
    if (id) {
      router.push(`/manual?id=${id}`);
    } else {
      router.push('/manuals');
    }
  }, [router, id]);

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<Loading />}>
        <Loading />
      </Suspense>
    </div>
  );
} 