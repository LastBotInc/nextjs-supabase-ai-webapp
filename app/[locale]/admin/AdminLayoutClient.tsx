"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { redirect } from "next/navigation";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default function AdminLayoutClient({ children, params: { locale } }: AdminLayoutClientProps) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Handle loading state
  if (loading) {
    return (
      <div className="sm:ml-64 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Handle authentication/authorization
  if (!isAuthenticated || !isAdmin) {
    redirect(`/${locale}/auth/sign-in?next=${encodeURIComponent(`/${locale}/admin`)}`);
  }

  // Render admin layout with proper sidebar spacing
  return <PageWrapper className="bg-gray-50 dark:bg-gray-900">{children}</PageWrapper>;
}
