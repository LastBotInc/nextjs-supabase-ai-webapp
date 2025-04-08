'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/auth/AuthProvider' // Assuming useAuth provides session/token
import { Database } from '@/types/database'

type LandingPage = Database['public']['Tables']['landing_pages']['Row']

interface Props {
  page: LandingPage
  locale: string
}

export function LandingPagePublishToggle({ page, locale }: Props) {
  const t = useTranslations('LandingPages');
  const { toast } = useToast();
  const router = useRouter();
  const { session, isAuthenticated } = useAuth(); 
  const [isToggling, setIsToggling] = useState(false);
  // Use local state derived from prop, update on success
  const [isPublished, setIsPublished] = useState(page.published);

  const handleToggle = async (checked: boolean) => {
    if (!isAuthenticated || !session?.access_token) {
      toast({
        title: 'Not authenticated',
        description: 'Please sign in to continue',
        variant: 'destructive',
      });
      // Consider redirecting or disabling the toggle if not authenticated
      return;
    }

    setIsToggling(true);
    const action = checked ? 'publish' : 'unpublish';
    const url = `/api/landing-pages/${page.id}/${action}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${action} page`);
      }

      // Update local state on success
      setIsPublished(checked);

      toast({
        title: t(checked ? 'success.published' : 'success.unpublished'),
        variant: 'default',
      });
      
      // Optionally refresh data - full page reload might be simplest here
      // router.refresh(); // Next.js router refresh
      // Or force reload if necessary for external state
       window.location.reload(); 

    } catch (err) {
      console.error(`Error ${action}ing landing page:`, err);
      toast({
        title: err instanceof Error ? err.message : `Failed to ${action} page`,
        variant: 'destructive',
      });
      // Revert local state on error
      setIsPublished(!checked);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Switch
      id={`publish-${page.id}`}
      checked={isPublished}
      onCheckedChange={handleToggle}
      disabled={isToggling}
      aria-label={isPublished ? t('unpublish') : t('publish')}
    />
  );
} 