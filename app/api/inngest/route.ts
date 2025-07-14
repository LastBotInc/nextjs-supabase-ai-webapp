import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest-client';
import { 
  helloWorld,
  publishScheduledPosts,
  generateDailyContent,
  analyzeContentPerformance,
  generateContentFromPlan,
  generateContentBulk
} from '@/lib/inngest-functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    publishScheduledPosts,
    generateDailyContent,
    analyzeContentPerformance,
    generateContentFromPlan,
    generateContentBulk
  ],
}); 