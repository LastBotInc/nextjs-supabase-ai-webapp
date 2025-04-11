import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'

// Parse command line arguments
const args = process.argv.slice(2)
const envArg = args.find(arg => arg.startsWith('--env='))
const env = envArg ? envArg.split('=')[1] : process.env.NODE_ENV || 'dev'

// Determine environment file
const envFile = env === 'production' || env === 'prod' ? '.env.production' : '.env.local'

// First clear any existing env vars we care about
const envVarsToReset = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'REPLICATE_API_TOKEN'
]
envVarsToReset.forEach(key => {
  delete process.env[key]
})

// Log environment setup
console.log('Environment setup:', {
  NODE_ENV: process.env.NODE_ENV,
  env: env,
  envFile: envFile,
  cwd: process.cwd()
})

// Load environment variables from appropriate .env file
const envConfig = config({ 
  path: path.resolve(process.cwd(), envFile),
  override: true // Ensure these values override any existing env vars
})

if (envConfig.error) {
  throw new Error(`Error loading environment file ${envFile}: ${envConfig.error}`)
}

console.log(`Using environment: ${env} (${envFile})`)

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'REPLICATE_API_TOKEN'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create Supabase client with explicit environment variables
const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Log connection details (but not sensitive values)
console.log('Database connection:', {
  url: supabaseUrl,
  env: env,
  serviceKeyPrefix: supabaseServiceKey?.substring(0, 10) + '...'
})

interface BlogPost {
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image: string
  published: boolean
  locale: string
  tags: string[]
  subject: 'news' | 'research' | 'generative-ai' | 'case-stories'
  featured: boolean
}

const posts: Omit<BlogPost, 'featured_image'>[] = [
  {
    "slug": "optimizing-fleet-leasing-strategy",
    "title": "Optimizing Your Fleet Leasing Strategy for Maximum ROI",
    "excerpt": "Learn key strategies for optimizing your vehicle fleet leasing plan to reduce costs, improve efficiency, and maximize return on investment.",
    "content": "<h2>Introduction to Fleet Leasing Optimization</h2>\n<p>Managing a vehicle fleet effectively requires a strategic approach to leasing. Optimizing your leasing strategy can lead to significant cost savings and operational improvements. This article explores key considerations and tactics for maximizing your fleet's ROI.</p>\n\n<h3>1. Understanding Different Leasing Types</h3>\n<p>Innolease offers various leasing options, each with unique benefits:</p>\n<ul>\n  <li><strong>Financial Leasing:</strong> Ideal for long-term use with predictable costs and potential ownership at the end.</li>\n  <li><strong>Flexible Leasing:</strong> Offers adaptability for changing fleet needs, often including maintenance.</li>\n  <li><strong>Maintenance Leasing:</strong> All-inclusive package covering maintenance, repairs, and often tires.</li>\n  <li><strong>MiniLeasing:</strong> Perfect for short-term needs or seasonal demands.</li>\n</ul>\n<p>Choosing the right mix of leasing types based on vehicle usage patterns and business objectives is crucial.</p>\n\n<h3>2. Right-Sizing Your Fleet</h3>\n<p>Analyze your fleet utilization data. Are there underutilized vehicles? Can routes be optimized? Right-sizing involves ensuring you have the optimal number and type of vehicles to meet your business needs without unnecessary overhead.</p>\n\n<h3>3. Leveraging Telematics Data</h3>\n<p>Modern fleet management solutions provide valuable data on driver behavior, fuel consumption, and maintenance needs. Use this data to:</p>\n<ul>\n  <li>Identify inefficient driving habits.</li>\n  <li>Optimize routes for fuel savings.</li>\n  <li>Implement preventative maintenance schedules.</li>\n  <li>Negotiate better insurance premiums based on safety data.</li>\n</ul>\n\n<h3>4. Strategic Vehicle Selection</h3>\n<p>Consider the total cost of ownership (TCO), not just the monthly lease payment. Factor in fuel efficiency, maintenance costs, insurance, and residual value. Selecting vehicles with lower TCO can significantly impact your bottom line, especially for larger fleets. Explore electric vehicle (EV) options for potential long-term savings and environmental benefits.</p>\n\n<h3>5. Negotiating Favorable Lease Terms</h3>\n<p>Work closely with Innolease to negotiate terms that align with your business goals. This includes:</p>\n<ul>\n  <li>Mileage allowances that match your actual usage.</li>\n  <li>Appropriate lease terms (duration).</li>\n  <li>Fair residual value calculations.</li>\n  <li>Clear understanding of maintenance responsibilities and costs.</li>\n</ul>\n\n<h3>Conclusion</h3>\n<p>Optimizing your fleet leasing strategy is an ongoing process. By understanding your options, leveraging data, making informed vehicle choices, and negotiating effectively, you can turn your fleet from a cost center into a strategic asset. Contact Innolease today to discuss how we can help tailor a leasing solution for your business.</p>",
    "published": true,
    "subject": "research",
    "featured": true,
    "tags": ["fleet management", "leasing strategy", "roi", "cost savings", "vehicle leasing"],
    "locale": "en"
  },
  {
    "slug": "navigating-ev-transition-leasing",
    "title": "Navigating the Transition to Electric Vehicles (EVs) with Leasing",
    "excerpt": "Explore how vehicle leasing simplifies the transition to an electric fleet, mitigating risks associated with technology changes and residual values.",
    "content": "<h2>The Shift Towards Electric Mobility</h2>\n<p>The automotive industry is rapidly shifting towards electric vehicles (EVs). For businesses managing fleets, this transition presents both opportunities and challenges. Leasing EVs through partners like Innolease offers a strategic way to embrace electric mobility while managing risks effectively.</p>\n\n<h3>Benefits of Leasing EVs</h3>\n<ul>\n  <li><strong>Mitigating Residual Value Risk:</strong> EV technology is evolving quickly. Leasing transfers the risk of uncertain future residual values to the leasing company.</li>\n  <li><strong>Access to Latest Technology:</strong> Leasing allows you to upgrade to newer EV models with improved range, charging speed, and features at the end of the lease term.</li>\n  <li><strong>Predictable Costs:</strong> Lease payments often bundle costs, including potential maintenance, making budgeting easier. EVs typically have lower running costs (fuel and maintenance).</li>\n  <li><strong>Simplified Charging Infrastructure Planning:</strong> Innolease can assist in planning and potentially financing charging solutions for your business premises and drivers' homes.</li>\n  <li><strong>Expert Guidance:</strong> Benefit from Innolease's expertise in selecting the right EV models for your specific operational needs and navigating government incentives.</li>\n</ul>\n\n<h3>Key Considerations for EV Fleet Transition</h3>\n<ul>\n  <li><strong>Charging Strategy:</strong> Assess where and when vehicles will be charged (depot, public stations, home charging).</li>\n  <li><strong>Range Requirements:</strong> Match vehicle range capabilities with typical daily mileage needs.</li>\n  <li><strong>Total Cost of Ownership (TCO):</strong> Analyze the TCO of EVs compared to traditional internal combustion engine (ICE) vehicles, considering purchase price, incentives, fuel, maintenance, and resale value (or lease costs).</li>\n  <li><strong>Driver Training:</strong> Familiarize drivers with EV operation, charging procedures, and range management techniques.</li>\n</ul>\n\n<h3>Innolease: Your Partner in EV Transition</h3>\n<p>Innolease provides comprehensive support for businesses transitioning to electric fleets. We offer:</p>\n<ul>\n  <li>A wide selection of the latest EV models.</li>\n  <li>Flexible leasing terms tailored to your business.</li>\n  <li>Consultancy on charging infrastructure and TCO analysis.</li>\n  <li>Maintenance packages specifically designed for EVs.</li>\n</ul>\n\n<h3>Conclusion</h3>\n<p>Leasing is a smart and flexible way to navigate the complexities of transitioning your fleet to electric vehicles. It allows your business to benefit from the advantages of EVs while minimizing financial and technological risks. Contact Innolease to start planning your fleet's electric future today.</p>",
    "published": true,
    "subject": "research",
    "featured": true,
    "tags": ["electric vehicles", "ev transition", "fleet leasing", "sustainability", "tco"],
    "locale": "en"
  },
  {
    "slug": "maintenance-leasing-explained",
    "title": "Understanding Maintenance Leasing: Hassle-Free Fleet Management",
    "excerpt": "Dive into the details of Maintenance Leasing from Innolease. Discover how this all-inclusive option provides predictable costs and peace of mind for your vehicle fleet.",
    "content": "<h2>What is Maintenance Leasing?</h2>\n<p>Maintenance Leasing, often referred to as full-service leasing, is a comprehensive vehicle leasing solution designed to simplify fleet management and provide cost predictability. With this option, Innolease takes responsibility for most operational aspects of the vehicle beyond just the financing.</p>\n\n<h3>Key Inclusions in a Typical Maintenance Lease</h3>\n<ul>\n  <li><strong>Vehicle Financing:</strong> Covers the cost of acquiring the vehicle.</li>\n  <li><strong>Scheduled Maintenance:</strong> Includes all regular servicing as per the manufacturer's recommendations.</li>\n  <li><strong>Repairs:</strong> Covers unexpected mechanical and electrical repairs (excluding accident damage).</li>\n  <li><strong>Tire Replacement:</strong> Includes replacement of tires due to normal wear and tear, often including seasonal tire changes and storage.</li>\n  <li><strong>Roadside Assistance:</strong> Provides support in case of breakdowns.</li>\n  <li><strong>Potential Extras:</strong> May include insurance, replacement vehicles, and fuel card management depending on the agreement.</li>\n</ul>\n\n<h3>Benefits of Maintenance Leasing</h3>\n<ul>\n  <li><strong>Predictable Budgeting:</strong> A fixed monthly payment covers most vehicle operating costs, making financial planning easier.</li>\n  <li><strong>Reduced Administrative Burden:</strong> Innolease manages maintenance scheduling, repairs, and invoicing, freeing up your internal resources.</li>\n  <li><strong>Minimized Downtime:</strong> Access to a professional service network ensures quick and efficient maintenance and repairs. Replacement vehicles may be included to keep your operations running smoothly.</li>\n  <li><strong>Expert Management:</strong> Benefit from Innolease's expertise in vehicle maintenance and supplier negotiations.</li>\n  <li><strong>Focus on Core Business:</strong> Allows your team to concentrate on core business activities rather than fleet administration.</li>\n</ul>\n\n<h3>Is Maintenance Leasing Right for Your Business?</h3>\n<p>Maintenance Leasing is particularly beneficial for:</p>\n<ul>\n  <li>Businesses seeking maximum cost predictability.</li>\n  <li>Companies wanting to minimize the administrative overhead of fleet management.</li>\n  <li>Organizations prioritizing vehicle uptime and reliability.</li>\n  <li>Fleets operating in demanding conditions where maintenance needs are higher.</li>\n</ul>\n\n<h3>Conclusion</h3>\n<p>Innolease's Maintenance Leasing offers a comprehensive, hassle-free solution for managing your vehicle fleet. By bundling financing with operational services, it provides peace of mind, predictable costs, and allows you to focus on what your business does best. Contact us to explore how Maintenance Leasing can benefit your specific fleet needs.</p>",
    "published": true,
    "subject": "research",
    "featured": false,
    "tags": ["maintenance leasing", "full-service leasing", "fleet management", "cost predictability", "vehicle maintenance"],
    "locale": "en"
  },
  {
    "slug": "finnish-company-streamlines-deliveries-innolease",
    "title": "Case Study: Finnish Logistics Company Streamlines Deliveries with Innolease Flexible Leasing",
    "excerpt": "Learn how a growing Finnish logistics firm leveraged Innolease's Flexible Leasing solution to adapt its fleet size to seasonal demand, reducing costs and improving efficiency.",
    "content": "<h2>The Challenge: Managing Seasonal Fleet Demand</h2>\n<p>A mid-sized Finnish logistics company faced significant challenges managing its delivery fleet due to fluctuating seasonal demand. During peak seasons like Christmas and summer holidays, they needed extra vans, while during quieter periods, vehicles sat idle, incurring unnecessary costs. Maintaining a fixed fleet size was inefficient and expensive.</p>\n\n<h3>The Search for a Solution</h3>\n<p>The company explored various options, including short-term rentals and purchasing additional vehicles. Short-term rentals proved costly and administratively burdensome, while purchasing vehicles meant significant capital investment and long-term commitment that didn't suit their variable needs.</p>\n\n<h3>Innolease Flexible Leasing: The Perfect Fit</h3>\n<p>The logistics company partnered with Innolease, opting for a Flexible Leasing agreement. This solution offered several key advantages:</p>\n<ul>\n  <li><strong>Scalability:</strong> The ability to easily add or remove vehicles from their fleet based on demand forecasts, with pre-agreed terms.</li>\n  <li><strong>Cost Efficiency:</strong> Paying only for the vehicles needed, avoiding costs associated with idle assets during off-peak times.</li>\n  <li><strong>Included Maintenance:</strong> The flexible lease included scheduled maintenance and basic repairs, reducing unexpected expenses and administrative tasks.</li>\n  <li><strong>Simplified Management:</strong> Innolease handled vehicle sourcing, preparation, and end-of-term logistics, allowing the company to focus on its core delivery operations.</li>\n</ul>\n\n<h3>Implementation and Results</h3>\n<p>Innolease worked closely with the logistics firm to analyze their historical demand patterns and establish a baseline fleet size. A process was put in place for requesting additional vehicles with sufficient lead time for peak seasons. The results were significant:</p>\n<ul>\n  <li><strong>Reduced Overall Fleet Costs:</strong> By optimizing fleet size throughout the year, the company achieved a 15% reduction in total fleet operating costs.</li>\n  <li><strong>Improved Fleet Utilization:</strong> Idle vehicle time was drastically reduced.</li>\n  <li><strong>Enhanced Operational Flexibility:</strong> The company could confidently bid on larger contracts during peak seasons, knowing they could scale their fleet accordingly.</li>\n  <li><strong>Simplified Administration:</strong> Internal resources previously spent on managing rentals and vehicle maintenance were reallocated.</li>\n</ul>\n\n<h3>Client Testimonial</h3>\n<p>\"Innolease's Flexible Leasing has been a game-changer for us. We no longer worry about having too many or too few vehicles. The scalability and predictable costs allow us to manage seasonal peaks efficiently and focus on serving our customers.\" - Operations Manager</p>\n\n<h3>Conclusion</h3>\n<p>This case study highlights how Innolease's Flexible Leasing solution can provide businesses with the agility needed to manage variable operational demands effectively, leading to cost savings and improved efficiency. If your business faces similar challenges, contact Innolease to explore flexible fleet solutions.</p>",
    "published": true,
    "subject": "case-stories",
    "featured": false,
    "tags": ["case study", "flexible leasing", "logistics", "fleet optimization", "seasonal demand"],
    "locale": "en"
  },
  // Finnish Translations
  {
    "slug": "optimizing-fleet-leasing-strategy-fi",
    "title": "[FI] Kaluston Leasing-strategian Optimointi Maksimaalisen ROI:n Saavuttamiseksi",
    "excerpt": "[FI] Opi keskeiset strategiat ajoneuvokaluston leasing-suunnitelman optimoimiseksi kustannusten vähentämiseksi, tehokkuuden parantamiseksi ja sijoitetun pääoman tuoton maksimoimiseksi.",
    "content": "<h2>[FI] Johdanto Kaluston Leasingin Optimointiin</h2>\n<p>[FI] Ajoneuvokaluston tehokas hallinta vaatii strategista lähestymistapaa leasingiin...</p>\n\n<h3>[FI] 1. Eri Leasing-tyyppien Ymmärtäminen</h3>\n<p>[FI] Innolease tarjoaa erilaisia leasingvaihtoehtoja...</p>\n\n<h3>[FI] 2. Kaluston Oikea Mitoitus</h3>\n<p>[FI] Analysoi kalustosi käyttöastetta...</p>\n\n<h3>[FI] 3. Telematiikkadatan Hyödyntäminen</h3>\n<p>[FI] Nykyaikaiset kalustonhallintaratkaisut tarjoavat arvokasta tietoa...</p>\n\n<h3>[FI] 4. Strateginen Ajoneuvovalinta</h3>\n<p>[FI] Harkitse kokonaiskustannuksia (TCO)...</p>\n\n<h3>[FI] 5. Edullisten Leasing-ehtojen Neuvotteleminen</h3>\n<p>[FI] Työskentele tiiviisti Innoleasen kanssa neuvotellaksesi ehdoista...</p>\n\n<h3>[FI] Johtopäätös</h3>\n<p>[FI] Kaluston leasing-strategian optimointi on jatkuva prosessi...</p>",
    "published": true,
    "subject": "research",
    "featured": true,
    "tags": ["kalustonhallinta", "leasing-strategia", "roi", "kustannussäästöt", "ajoneuvoleasing"],
    "locale": "fi"
  },
  {
    "slug": "navigating-ev-transition-leasing-fi",
    "title": "[FI] Sähköautoihin Siirtyminen Leasingin Avulla",
    "excerpt": "[FI] Tutustu, kuinka ajoneuvoleasing yksinkertaistaa siirtymistä sähköiseen kalustoon, vähentäen teknologian muutoksiin ja jäännösarvoihin liittyviä riskejä.",
    "content": "<h2>[FI] Siirtyminen Kohti Sähköistä Liikkuvuutta</h2>\n<p>[FI] Autoteollisuus siirtyy nopeasti kohti sähköajoneuvoja (EV)...</p>\n\n<h3>[FI] Sähköautojen Leasingin Edut</h3>\n<ul>\n  <li><strong>[FI] Jäännösarvoriskin Lieventäminen:</strong> EV-teknologia kehittyy nopeasti...</li>\n  <li><strong>[FI] Pääsy Uusimpaan Teknologiaan:</strong> Leasing mahdollistaa päivittämisen uudempiin EV-malleihin...</li>\n  <li><strong>[FI] Ennustettavat Kustannukset:</strong> Leasing-maksut niputtavat usein kustannuksia...</li>\n  <li><strong>[FI] Yksinkertaistettu Latausinfran Suunnittelu:</strong> Innolease voi auttaa latausratkaisujen suunnittelussa...</li>\n  <li><strong>[FI] Asiantuntijaohjaus:</strong> Hyödynnä Innoleasen asiantuntemusta...</li>\n</ul>\n\n<h3>[FI] Keskeiset Huomiot EV-Kalustoon Siirtymisessä</h3>\n<ul>\n  <li><strong>[FI] Latausstrategia:</strong> Arvioi, missä ja milloin ajoneuvot ladataan...</li>\n  <li><strong>[FI] Toimintasädevaatimukset:</strong> Yhdistä ajoneuvon toimintasäde tyypillisiin päivittäisiin ajotarpeisiin...</li>\n  <li><strong>[FI] Kokonaiskustannukset (TCO):</strong> Analysoi EV:iden TCO verrattuna perinteisiin polttomoottoriajoneuvoihin...</li>\n  <li><strong>[FI] Kuljettajakoulutus:</strong> Tutustuta kuljettajat EV:n käyttöön...</li>\n</ul>\n\n<h3>[FI] Innolease: Kumppanisi EV-Siirtymässä</h3>\n<p>[FI] Innolease tarjoaa kattavaa tukea yrityksille, jotka siirtyvät sähkökalustoon...</p>\n\n<h3>[FI] Johtopäätös</h3>\n<p>[FI] Leasing on älykäs ja joustava tapa navigoida sähköajoneuvoihin siirtymisen monimutkaisuuksissa...</p>",
    "published": true,
    "subject": "research",
    "featured": true,
    "tags": ["sähköautot", "ev-siirtymä", "kalustoleasing", "kestävä kehitys", "tco"],
    "locale": "fi"
  },
  // Swedish Translations
  {
    "slug": "optimizing-fleet-leasing-strategy-sv",
    "title": "[SV] Optimera Din Vagnparks Leasingstrategi för Maximal ROI",
    "excerpt": "[SV] Lär dig nyckelstrategier för att optimera din fordonsflottas leasingplan för att minska kostnader, förbättra effektiviteten och maximera avkastningen på investeringen.",
    "content": "<h2>[SV] Introduktion till Optimering av Flottleasing</h2>\n<p>[SV] Att hantera en fordonsflotta effektivt kräver ett strategiskt förhållningssätt till leasing...</p>\n\n<h3>[SV] 1. Förstå Olika Leasingtyper</h3>\n<p>[SV] Innolease erbjuder olika leasingalternativ...</p>\n\n<h3>[SV] 2. Rätt Storlek på Din Flotta</h3>\n<p>[SV] Analysera din flottas användningsdata...</p>\n\n<h3>[SV] 3. Utnyttja Telematikdata</h3>\n<p>[SV] Moderna system för vagnparkshantering ger värdefull data...</p>\n\n<h3>[SV] 4. Strategiskt Fordonsval</h3>\n<p>[SV] Beakta den totala ägandekostnaden (TCO)...</p>\n\n<h3>[SV] 5. Förhandla Fram Gynnsamma Leasingvillkor</h3>\n<p>[SV] Arbeta nära Innolease för att förhandla fram villkor...</p>\n\n<h3>[SV] Slutsats</h3>\n<p>[SV] Att optimera din vagnparks leasingstrategi är en pågående process...</p>",
    "published": true,
    "subject": "research",
    "featured": true,
    "tags": ["vagnparkshantering", "leasingstrategi", "roi", "kostnadsbesparingar", "fordonsleasing"],
    "locale": "sv"
  },
  {
    "slug": "navigating-ev-transition-leasing-sv",
    "title": "[SV] Navigera Övergången till Elfordon (EV) med Leasing",
    "excerpt": "[SV] Utforska hur fordonsleasing förenklar övergången till en elektrisk flotta, och minskar risker relaterade till teknikförändringar och restvärden.",
    "content": "<h2>[SV] Skiftet Mot Elektrisk Mobilitet</h2>\n<p>[SV] Fordonsindustrin skiftar snabbt mot elfordon (EV)...</p>\n\n<h3>[SV] Fördelar med att Leasa Elbilar</h3>\n<ul>\n  <li><strong>[SV] Minska Restvärdesrisk:</strong> EV-tekniken utvecklas snabbt...</li>\n  <li><strong>[SV] Tillgång till Senaste Tekniken:</strong> Leasing låter dig uppgradera till nyare EV-modeller...</li>\n  <li><strong>[SV] Förutsägbara Kostnader:</strong> Leasingbetalningar buntar ofta ihop kustannader...</li>\n  <li><strong>[SV] Förenklad Planering av Laddningsinfrastruktur:</strong> Innolease kan hjälpa till med planering...</li>\n  <li><strong>[SV] Expertvägledning:</strong> Dra nytta av Innoleases expertis...</li>\n</ul>\n\n<h3>[SV] Viktiga Överväganden för EV-Flottövergång</h3>\n<ul>\n  <li><strong>[SV] Laddningsstrategi:</strong> Bedöm var och när fordon kommer att laddas...</li>\n  <li><strong>[SV] Räckviddskrav:</strong> Matcha fordonets räckviddskapacitet med typiska dagliga körbehov...</li>\n  <li><strong>[SV] Total Ägandekostnad (TCO):</strong> Analysera TCO för elbilar jämfört med traditionella förbränningsmotorfordon...</li>\n  <li><strong>[SV] Förarutbildning:</strong> Bekanta förare med EV-drift...</li>\n</ul>\n\n<h3>[SV] Innolease: Din Partner i EV-Övergången</h3>\n<p>[SV] Innolease tillhandahåller omfattande stöd för företag som övergår till elektriska flottor...</p>\n\n<h3>[SV] Slutsats</h3>\n<p>[SV] Leasing är ett smart och flexibelt sätt att navigera komplexiteten i att övergå din flotta till elfordon...</p>",
    "published": true,
    "subject": "research",
    "featured": true,
    "tags": ["elfordon", "ev-övergång", "flottleasing", "hållbarhet", "tco"],
    "locale": "sv"
  }
]

async function seedBlogPosts() {
  console.log('Creating blog posts...');

  try {
    // Get admin user ID for production or test user ID for local
    const targetEmail = env === 'prod' ? process.env.SEED_ADMIN_EMAIL : process.env.SEED_TEST_USER_EMAIL
    
    if (!targetEmail) {
      throw new Error('Missing admin/test user email in environment variables')
    }

    console.log(`Looking for user with email: ${targetEmail}`)

    // First check if user exists
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', targetEmail)

    if (profileError) {
      console.error('Error querying profiles:', profileError)
      throw new Error(`Failed to query profiles table: ${profileError.message}`)
    }

    if (!profiles || profiles.length === 0) {
      console.error('No user found with email:', targetEmail)
      console.log('Available profiles:')
      
      // List available profiles for debugging
      const { data: allProfiles, error: listError } = await supabase
        .from('profiles')
        .select('email')
        .limit(5)

      if (!listError && allProfiles) {
        console.log('First 5 profiles in database:', allProfiles.map(p => p.email))
      }
      
      throw new Error(`User with email ${targetEmail} not found in the database. Please ensure the user exists.`)
    }

    const userId = profiles[0].id
    console.log(`Found user with ID: ${userId}`)

    for (const post of posts) {
      try {
        const featuredImagePath = `/images/blog/${post.slug}.webp`; // Construct local image path

        // Check if post exists
        const { data: existingPost, error: existingError } = await supabase
          .from('posts')
          .select('id')
          .eq('slug', post.slug)
          .eq('locale', post.locale)
          .single();

        if (existingError && existingError.code !== 'PGRST116') { // PGRST116: "exact number of rows expected" (i.e., not found)
          console.error(`Error checking existing post (${post.slug}):`, existingError);
          continue; // Skip this post on error
        }

        let postId;

        if (existingPost) {
          // Define data specifically for update, including the image path
          const updateData = {
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            author_id: userId, // Ensure author_id is updated if needed
            published: post.published,
            tags: post.tags,
            subject: post.subject,
            featured: post.featured,
            featured_image: featuredImagePath // Use the constructed image path
          };

          // Update existing post using the specific updateData
          const { error: updateError } = await supabase
            .from('posts')
            .update(updateData)
            .eq('id', existingPost.id);

          if (updateError) {
            console.error(`Error updating post (${post.slug}):`, updateError);
            continue; // Skip this post on error
          }
          console.log('Updated post:', post.title);
          postId = existingPost.id;
        } else {
           // Construct data for new post insertion
          const insertData = {
            ...post, // Spread the original post data
            author_id: userId,
            featured_image: featuredImagePath // Add the constructed image path
          };

          // Create new post
          const { data: newPost, error: insertError } = await supabase
            .from('posts')
            .insert(insertData)
            .select('id') // Only select id after insert
            .single();

          if (insertError) {
            console.error(`Error creating post (${post.slug}):`, insertError);
            continue; // Skip this post on error
          }
          console.log('Created post:', post.title);
          postId = newPost.id;
        }

      } catch (error: any) {
        console.error(`Error processing post ${post.slug}:`, error.message);
        if (env === 'prod') {
          // Log to error tracking service or handle specially
          console.error('Production post processing failed:', error);
        }
      }
    }

    console.log('Blog post seeding completed successfully!');
  } catch (error) {
    console.error('Fatal error in blog post seeding:', error);
    process.exit(1);
  }
}

// Run the seeding process
seedBlogPosts().catch((error) => {
  console.error('Unhandled error in blog post seeding:', error);
  process.exit(1);
});