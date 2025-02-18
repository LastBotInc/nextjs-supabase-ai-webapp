#!/usr/bin/env tsx

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const domain = process.env.NEXT_PUBLIC_SITE_URL;

async function submitSitemap() {
  if (!domain) {
    console.error('Error: NEXT_PUBLIC_SITE_URL environment variable is not set');
    process.exit(1);
  }

  const sitemapUrl = `${domain}/api/sitemap`;
  
  try {
    // Verify sitemap is accessible
    const response = await axios.get(sitemapUrl);
    if (response.status === 200 && response.headers['content-type']?.includes('application/xml')) {
      console.log('✅ Sitemap is accessible and valid XML');
      console.log(`\nSitemap URL: ${sitemapUrl}`);
      console.log('\nNote: Google now automatically discovers and crawls sitemaps.');
      console.log('You can manually submit your sitemap through Google Search Console if needed.');
      console.log('See: https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping');
    } else {
      throw new Error('Sitemap is not accessible or not valid XML');
    }
    
    // Optionally submit to Bing
    const bingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    await axios.get(bingUrl);
    console.log('✅ Sitemap submitted to Bing successfully');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

submitSitemap(); 