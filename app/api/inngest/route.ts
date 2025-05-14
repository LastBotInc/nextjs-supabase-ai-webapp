import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest-client';
import { 
  dispatchDataSourceSyncJobs,
  syncProductDataSource
} from '@/lib/inngest-functions';
import { syncLocalProductToShopify } from '@/lib/inngest-shopify-functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    dispatchDataSourceSyncJobs,
    syncProductDataSource,
    syncLocalProductToShopify
  ],
}); 