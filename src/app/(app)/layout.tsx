'use client';
import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main-sidebar';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

function AppLoadingSkeleton() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar Skeleton */}
      <div className="hidden md:block border-r">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex-1 p-2">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="mt-auto p-4">
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
      {/* Main Content Skeleton */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <header className="space-y-1.5 mb-6">
          <Skeleton className="h-9 w-1/3" />
          <Skeleton className="h-5 w-1/2" />
        </header>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function AppPagesLayout({ children }: { children: ReactNode }) {
  const { loading } = useUser();

  if (loading) {
    return <AppLoadingSkeleton />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <MainSidebar />
        </Sidebar>
        <SidebarInset className="flex-1 bg-background">
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
