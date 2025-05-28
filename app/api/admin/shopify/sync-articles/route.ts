import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { shopifyApi, Session, ApiVersion } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

// Initialize Shopify API
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: ['read_content', 'write_content'],
  hostName: process.env.SHOPIFY_APP_URL || 'localhost',
  apiVersion: ApiVersion.April25,
  isEmbeddedApp: false,
});

// Create a session for API calls
const shopifySession: Session = {
  id: 'offline_session',
  shop: process.env.SHOPIFY_SHOP_DOMAIN!,
  state: 'offline',
  isOnline: false,
  accessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!,
  scope: 'read_content,write_content',
  expires: undefined,
  onlineAccessInfo: undefined,
  isActive: () => true,
  isScopeChanged: () => false,
  isScopeIncluded: () => true,
  isExpired: () => false,
  equals: () => false,
  toPropertyArray: () => [],
  toObject: () => ({
    id: 'offline_session',
    shop: process.env.SHOPIFY_SHOP_DOMAIN!,
    state: 'offline',
    isOnline: false,
    accessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!,
    scope: 'read_content,write_content',
  }),
};

interface ShopifyBlog {
  id: string;
  title: string;
  handle: string;
}

interface ShopifyArticle {
  id: string;
  title: string;
  handle: string;
  body: string;
  summary?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isPublished: boolean;
  blog: {
    id: string;
    title: string;
  };
}

interface SyncStats {
  total: number;
  created: number;
  updated: number;
  errors: number;
}

interface PostData {
  title: string;
  slug: string;
  content: string;
  published: boolean;
  subject: string;
  featured: boolean;
  locale: string;
  author_id?: string;
  last_edited_by?: string;
  tags?: string[];
}

interface GraphQLResponse {
  body?: {
    data?: any;
    errors?: any[];
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('\n📝 [POST /api/admin/shopify/sync-articles]');

    // 1. Token Verification Layer
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid auth header');
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // 2. Create auth client and verify token
    console.log('🔑 Creating auth client...');
    const authClient = createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser(
      authHeader.split(' ')[1]
    );

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // 3. Create service role client for all database operations
    console.log('🔑 Creating service role client...');
    const supabase = createClient(undefined, true); // Service role client without cookies

    // 4. Admin Role Verification using service role client
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      console.error('❌ User is not admin:', user.id);
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    console.log('✅ Admin access verified');
    
    const { fullSync = false } = await request.json();
    const limit = fullSync ? 250 : 50; // Shopify's max is 250 per request

    console.log(`Starting Shopify article sync (limit: ${limit}, fullSync: ${fullSync})`);

    const stats: SyncStats = {
      total: 0,
      created: 0,
      updated: 0,
      errors: 0
    };

    // First, get all blogs
    const blogsQuery = `
      query GetBlogs($first: Int!) {
        blogs(first: $first) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
      }
    `;

    const client = new shopify.clients.Graphql({ session: shopifySession });
    
    const blogsResponse = await client.query({
      data: {
        query: blogsQuery,
        variables: { first: 50 } // Get up to 50 blogs
      }
    }) as GraphQLResponse;

    if (!blogsResponse.body || blogsResponse.body.errors) {
      console.error('GraphQL errors fetching blogs:', blogsResponse.body?.errors);
      return NextResponse.json(
        { error: 'Failed to fetch blogs from Shopify', details: blogsResponse.body?.errors },
        { status: 500 }
      );
    }

    const blogs: ShopifyBlog[] = blogsResponse.body.data?.blogs?.edges?.map((edge: any) => edge.node) || [];
    console.log(`Found ${blogs.length} blogs in Shopify`);

    // For each blog, get its articles
    for (const blog of blogs) {
      console.log(`Processing blog: ${blog.title} (${blog.id})`);

      const articlesQuery = `
        query GetArticles($blogId: ID!, $first: Int!) {
          blog(id: $blogId) {
            articles(first: $first) {
              edges {
                node {
                  id
                  title
                  handle
                  body
                  summary
                  publishedAt
                  createdAt
                  updatedAt
                  tags
                  isPublished
                  blog {
                    id
                    title
                  }
                }
              }
            }
          }
        }
      `;

      const articlesResponse = await client.query({
        data: {
          query: articlesQuery,
          variables: { 
            blogId: blog.id,
            first: limit
          }
        }
      }) as GraphQLResponse;

      if (!articlesResponse.body || articlesResponse.body.errors) {
        console.error(`GraphQL errors fetching articles for blog ${blog.id}:`, articlesResponse.body?.errors);
        stats.errors++;
        continue;
      }

      const articles: ShopifyArticle[] = articlesResponse.body.data?.blog?.articles?.edges?.map((edge: any) => edge.node) || [];
      console.log(`Found ${articles.length} articles in blog ${blog.title}`);
      
      stats.total += articles.length;

      // Process each article
      for (const article of articles) {
        try {
          await processArticle(supabase, article, stats, user.id);
        } catch (error) {
          console.error(`Error processing article ${article.id}:`, error);
          stats.errors++;
        }
      }
    }

    console.log('Shopify article sync completed:', stats);

    return NextResponse.json({
      success: true,
      message: `Sync completed: ${stats.created} created, ${stats.updated} updated, ${stats.errors} errors`,
      stats
    });

  } catch (error) {
    console.error('Error in Shopify article sync:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function processArticle(supabase: any, article: ShopifyArticle, stats: SyncStats, userId: string) {
  // Check if article already exists in mapping
  const { data: existingMapping } = await supabase
    .from('external_blog_mappings')
    .select('internal_post_id')
    .eq('external_source_name', 'shopify')
    .eq('external_article_id', article.id)
    .single();

  // Generate slug from handle or title
  const slug = article.handle || article.title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);

  // Prepare post data
  const postData: PostData = {
    title: article.title,
    slug: slug,
    content: article.body || '',
    published: article.isPublished,
    subject: 'case-stories', // Default subject as per schema
    featured: false,
    locale: 'en', // Default to English since Shopify doesn't provide locale info
    author_id: userId, // Use the authenticated admin user
    last_edited_by: userId,
    tags: article.tags || []
  };

  if (existingMapping) {
    // Update existing post
    const { error: updateError } = await supabase
      .from('posts')
      .update(postData)
      .eq('id', existingMapping.internal_post_id);

    if (updateError) {
      console.error(`Error updating post for article ${article.id}:`, updateError);
      throw updateError;
    }

    // Update mapping metadata
    await supabase
      .from('external_blog_mappings')
      .update({
        last_synced_at: new Date().toISOString(),
        meta_data: {
          shopify_blog_title: article.blog.title,
          shopify_tags: article.tags,
          shopify_published_at: article.publishedAt,
          shopify_created_at: article.createdAt,
          shopify_updated_at: article.updatedAt
        }
      })
      .eq('external_source_name', 'shopify')
      .eq('external_article_id', article.id);

    stats.updated++;
    console.log(`Updated article: ${article.title}`);

  } else {
    // Create new post
    const { data: newPost, error: createError } = await supabase
      .from('posts')
      .insert(postData)
      .select('id')
      .single();

    if (createError) {
      console.error(`Error creating post for article ${article.id}:`, createError);
      throw createError;
    }

    // Create mapping
    const { error: mappingError } = await supabase
      .from('external_blog_mappings')
      .insert({
        internal_post_id: newPost.id,
        external_source_name: 'shopify',
        external_blog_id: article.blog.id,
        external_article_id: article.id,
        sync_status: 'synced',
        meta_data: {
          shopify_blog_title: article.blog.title,
          shopify_tags: article.tags,
          shopify_published_at: article.publishedAt,
          shopify_created_at: article.createdAt,
          shopify_updated_at: article.updatedAt
        }
      });

    if (mappingError) {
      console.error(`Error creating mapping for article ${article.id}:`, mappingError);
      // Try to clean up the created post
      await supabase.from('posts').delete().eq('id', newPost.id);
      throw mappingError;
    }

    stats.created++;
    console.log(`Created article: ${article.title}`);
  }
}

// Add PUT method for reverse sync (app to Shopify)
export async function PUT(request: NextRequest) {
  try {
    console.log('\n📤 [PUT /api/admin/shopify/sync-articles] - App to Shopify sync');

    // 1. Token Verification Layer
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid auth header');
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // 2. Create auth client and verify token
    console.log('🔑 Creating auth client...');
    const authClient = createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser(
      authHeader.split(' ')[1]
    );

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 3. Check admin status
    console.log('👤 Checking admin status for user:', user.id);
    const { data: profile } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      console.error('❌ User is not admin');
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 4. Create service role client for operations
    console.log('🔧 Creating service role client...');
    const supabase = createClient(undefined, true);

    // 5. Get request parameters
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('blogId'); // Optional: specific blog to sync to
    const postIdsParam = searchParams.get('postIds');
    const postIds = postIdsParam ? postIdsParam.split(',') : null; // Optional: specific posts to sync

    console.log('📋 Sync parameters:', { blogId, postIds });

    // 6. Initialize Shopify GraphQL client
    const client = new shopify.clients.Graphql({ session: shopifySession });

    // 7. Get posts to sync
    let postsQuery = supabase
      .from('posts')
      .select('*')
      .eq('published', true); // Only sync published posts

    if (postIds && postIds.length > 0) {
      postsQuery = postsQuery.in('id', postIds);
    }

    const { data: posts, error: postsError } = await postsQuery;

    if (postsError) {
      console.error('❌ Error fetching posts:', postsError);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    console.log(`📝 Found ${posts?.length || 0} posts to sync`);

    // 8. Get or create default blog if no blogId specified
    let targetBlogId = blogId;
    if (!targetBlogId) {
      // Try to find a default blog or create one
      const blogsResponse = await client.query({
        data: {
          query: `
            query GetBlogs {
              blogs(first: 1) {
                edges {
                  node {
                    id
                    title
                    handle
                  }
                }
              }
            }
          `
        }
      });

      const blogs = (blogsResponse.body as any)?.data?.blogs?.edges;
      if (blogs && blogs.length > 0) {
        targetBlogId = blogs[0].node.id;
        console.log('📰 Using existing blog:', blogs[0].node.title, targetBlogId);
      } else {
        // Create a default blog
        const createBlogResponse = await client.query({
          data: {
            query: `
              mutation CreateBlog($blog: BlogCreateInput!) {
                blogCreate(blog: $blog) {
                  blog {
                    id
                    title
                    handle
                  }
                  userErrors {
                    field
                    message
                  }
                }
              }
            `,
            variables: {
              blog: {
                title: 'Blog',
                handle: 'blog'
              }
            }
          }
        });

        const createResult = (createBlogResponse.body as any)?.data?.blogCreate;
        if (createResult?.userErrors?.length > 0) {
          console.error('❌ Error creating blog:', createResult.userErrors);
          return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
        }

        targetBlogId = createResult?.blog?.id;
        console.log('📰 Created new blog:', targetBlogId);
      }
    }

    // Ensure we have a valid blog ID
    if (!targetBlogId) {
      console.error('❌ No blog ID available for sync');
      return NextResponse.json({ error: 'No blog available for sync' }, { status: 500 });
    }

    // 9. Sync stats
    const stats = {
      processed: 0,
      created: 0,
      updated: 0,
      errors: 0,
      errorDetails: [] as string[]
    };

    // 10. Process each post
    for (const post of posts || []) {
      try {
        stats.processed++;
        console.log(`\n📄 Processing post: ${post.title} (${post.id})`);

        // Check if post already has a Shopify mapping
        const { data: existingMapping } = await supabase
          .from('external_blog_mappings')
          .select('external_article_id, external_blog_id')
          .eq('internal_post_id', post.id)
          .eq('external_source_name', 'shopify')
          .single();

        if (existingMapping?.external_article_id) {
          // Update existing article
          await updateShopifyArticle(client, supabase, post, existingMapping.external_article_id, stats, user.id);
        } else {
          // Create new article
          await createShopifyArticle(client, supabase, post, targetBlogId, stats, user.id);
        }

      } catch (error) {
        console.error(`❌ Error processing post ${post.id}:`, error);
        stats.errors++;
        stats.errorDetails.push(`Post ${post.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log('\n✅ App to Shopify sync completed:', stats);

    return NextResponse.json({
      success: true,
      message: 'App to Shopify sync completed',
      stats,
      targetBlogId
    });

  } catch (error) {
    console.error('❌ App to Shopify sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to create new article in Shopify
async function createShopifyArticle(
  client: any,
  supabase: any,
  post: any,
  blogId: string,
  stats: any,
  userId: string
) {
  console.log(`➕ Creating new article for post: ${post.title}`);

  const articleInput = {
    title: post.title,
    handle: post.slug,
    body: post.content,
    summary: post.excerpt || '',
    tags: post.tags || [],
    isPublished: post.published
  };

  const response = await client.query({
    data: {
      query: `
        mutation CreateArticle($blogId: ID!, $article: ArticleCreateInput!) {
          articleCreate(blogId: $blogId, article: $article) {
            article {
              id
              title
              handle
              body
              summary
              tags
              isPublished
              createdAt
              updatedAt
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        blogId,
        article: articleInput
      }
    }
  });

  const result = response.body?.data?.articleCreate;
  
  if (result?.userErrors?.length > 0) {
    throw new Error(`Shopify API error: ${result.userErrors.map((e: any) => e.message).join(', ')}`);
  }

  if (!result?.article?.id) {
    throw new Error('No article ID returned from Shopify');
  }

  // Create mapping record
  const { error: mappingError } = await supabase
    .from('external_blog_mappings')
    .insert({
      internal_post_id: post.id,
      external_source_name: 'shopify',
      external_blog_id: blogId,
      external_article_id: result.article.id,
      sync_status: 'synced',
      last_synced_at: new Date().toISOString(),
      meta_data: {
        shopify_handle: result.article.handle,
        shopify_created_at: result.article.createdAt,
        sync_direction: 'app_to_shopify'
      }
    });

  if (mappingError) {
    console.error('⚠️ Warning: Failed to create mapping record:', mappingError);
  }

  stats.created++;
  console.log(`✅ Created article: ${result.article.id}`);
}

// Helper function to update existing article in Shopify
async function updateShopifyArticle(
  client: any,
  supabase: any,
  post: any,
  articleId: string,
  stats: any,
  userId: string
) {
  console.log(`🔄 Updating existing article: ${articleId} for post: ${post.title}`);

  const articleInput = {
    title: post.title,
    handle: post.slug,
    body: post.content,
    summary: post.excerpt || '',
    tags: post.tags || [],
    isPublished: post.published
  };

  const response = await client.query({
    data: {
      query: `
        mutation UpdateArticle($id: ID!, $article: ArticleUpdateInput!) {
          articleUpdate(id: $id, article: $article) {
            article {
              id
              title
              handle
              body
              summary
              tags
              isPublished
              updatedAt
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        id: articleId,
        article: articleInput
      }
    }
  });

  const result = response.body?.data?.articleUpdate;
  
  if (result?.userErrors?.length > 0) {
    throw new Error(`Shopify API error: ${result.userErrors.map((e: any) => e.message).join(', ')}`);
  }

  // Update mapping record
  const { error: mappingError } = await supabase
    .from('external_blog_mappings')
    .update({
      sync_status: 'synced',
      last_synced_at: new Date().toISOString(),
      meta_data: {
        shopify_handle: result.article.handle,
        shopify_updated_at: result.article.updatedAt,
        sync_direction: 'app_to_shopify'
      }
    })
    .eq('external_article_id', articleId)
    .eq('external_source_name', 'shopify');

  if (mappingError) {
    console.error('⚠️ Warning: Failed to update mapping record:', mappingError);
  }

  stats.updated++;
  console.log(`✅ Updated article: ${articleId}`);
} 