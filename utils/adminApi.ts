import { createClient } from '@/utils/supabase/client';

export class AdminApi {
  private static async getAuthHeader() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Not authenticated');
    return `Bearer ${session.access_token}`;
  }

  static async callAdminApi(endpoint: string, data: any) {
    try {
      const authHeader = await this.getAuthHeader();
      
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          window.location.href = '/auth/sign-in';
          return;
        }
        if (response.status === 403) {
          window.location.href = '/unauthorized';
          return;
        }
        throw new Error(error.error || 'API call failed');
      }

      return response.json();
    } catch (error) {
      console.error('Admin API error:', error);
      throw error;
    }
  }

  // Website Analysis specific method
  static async analyzeWebsite(domain: string, options?: {
    includeKeywords?: boolean;
    includeBacklinks?: boolean;
    includeCompetitors?: boolean;
    includeTechnical?: boolean;
    keywordLimit?: number;
  }) {
    return this.callAdminApi('admin/seo/website-analysis', {
      domain,
      ...options
    });
  }
} 