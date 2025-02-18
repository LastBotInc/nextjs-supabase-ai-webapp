export const isOpenAIUserAgent = (userAgent: string): boolean => {
  return userAgent.toLowerCase().includes('chatgpt-user') || 
         userAgent.toLowerCase().includes('openai') ||
         userAgent.toLowerCase().includes('gpt');
}; 