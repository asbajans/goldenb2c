'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function CategoriesRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const newPath = pathname.replace('/categories', '/products');
    router.replace(newPath);
  }, [pathname, router]);

  return null;
}
