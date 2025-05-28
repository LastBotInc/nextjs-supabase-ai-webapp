import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Database } from '@/types/database'
import { headers } from 'next/headers'
import { generateLocalizedMetadata } from '@/utils/metadata'

type LandingPage = Database['public']['Tables']['landing_pages']['Row']

interface Props {
  params: Promise<{
    locale: string
    id: string
  }>
}

async function getLandingPage(id: string, locale: string): Promise<LandingPage | null> {
  const supabase = createClient(undefined, true)
  
  const { data: page, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('id', id)
    .eq('locale', locale)
    .single()

  if (error) {
    console.error('Error fetching landing page:', error)
    return null
  }

  return page
}

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params;
  const page = await getLandingPage(id, locale)

  if (!page) {
    return {}
  }

  return generateLocalizedMetadata(locale, 'preview', {
    title: page.meta_title || page.title || '',
    description: page.meta_description || page.excerpt || '',
    type: 'website',
    canonicalUrl: page.canonical_url || `/preview/${id}`,
    image: page.og_image || undefined,
    imageWidth: 1200,
    imageHeight: 630,
    noindex: true // Preview pages should not be indexed
  })
}

export default async function PreviewPage({ params }: Props) {
  const { locale, id } = await params;
  const page = await getLandingPage(id, locale)

  if (!page) {
    notFound()
  }

  // Add analytics scripts if enabled
  const analyticsScripts = []
  if (page.enable_analytics) {
    // Google Analytics
    if (page.ga_measurement_id) {
      analyticsScripts.push(`
        <!-- Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=${page.ga_measurement_id}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${page.ga_measurement_id}');
        </script>
      `)
    }

    // Google Tag Manager
    if (page.gtm_container_id) {
      analyticsScripts.push(`
        <!-- Google Tag Manager -->
        <script>
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${page.gtm_container_id}');
        </script>
        <!-- Google Tag Manager (noscript) -->
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=${page.gtm_container_id}"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>
        </noscript>
      `)
    }

    // Facebook Pixel
    if (page.fb_pixel_id) {
      analyticsScripts.push(`
        <!-- Facebook Pixel -->
        <script>
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${page.fb_pixel_id}');
          fbq('track', 'PageView');
        </script>
        <noscript>
          <img height="1" width="1" style="display:none"
          src="https://www.facebook.com/tr?id=${page.fb_pixel_id}&ev=PageView&noscript=1"/>
        </noscript>
      `)
    }

    // LinkedIn Pixel
    if (page.linkedin_pixel_id) {
      analyticsScripts.push(`
        <!-- LinkedIn Pixel -->
        <script type="text/javascript">
          _linkedin_partner_id = "${page.linkedin_pixel_id}";
          window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
          window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          (function(l) {
          if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
          window.lintrk.q=[]}
          var s = document.getElementsByTagName("script")[0];
          var b = document.createElement("script");
          b.type = "text/javascript";b.async = true;
          b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
          s.parentNode.insertBefore(b, s);})(window.lintrk);
        </script>
        <noscript>
          <img height="1" width="1" style="display:none;" alt=""
          src="https://px.ads.linkedin.com/collect/?pid=${page.linkedin_pixel_id}&fmt=gif" />
        </noscript>
      `)
    }
  }

  // Construct the HTML document
  const html = `
    <!DOCTYPE html>
    <html lang="${locale}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${page.meta_title || page.title}</title>
        <meta name="description" content="${page.meta_description || page.excerpt || ''}">
        
        ${page.og_image ? `
          <meta property="og:image" content="${page.og_image}">
          <meta property="og:image:width" content="1200">
          <meta property="og:image:height" content="630">
        ` : ''}
        
        ${page.keywords?.length ? `
          <meta name="keywords" content="${page.keywords.join(', ')}">
        ` : ''}
        
        ${page.canonical_url ? `
          <link rel="canonical" href="${page.canonical_url}">
        ` : ''}

        ${page.custom_head || ''}
        
        ${page.custom_css ? `
          <style>
            ${page.custom_css}
          </style>
        ` : ''}
        
        ${analyticsScripts.join('\n')}
      </head>
      <body>
        ${page.content}
        
        ${page.custom_js ? `
          <script>
            ${page.custom_js}
          </script>
        ` : ''}
      </body>
    </html>
  `

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  })
} 