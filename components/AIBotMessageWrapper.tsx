import { headers } from 'next/headers';
import { isOpenAIUserAgent } from '@/utils/userAgent';
import AIBotMessage from './AIBotMessage';

export default async function AIBotMessageWrapper() {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    
    if (!isOpenAIUserAgent(userAgent)) {
      return null;
    }
    
    return <AIBotMessage />;
  } catch (error) {
    console.error('Error in AIBotMessageWrapper:', error);
    return null;
  }
} 