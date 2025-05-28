#!/usr/bin/env node

require('dotenv').config({ path: process.env.DOTENV_CONFIG_PATH || '.env.local' });

const { Command } = require('commander');
const { shopifyApi, ApiVersion, Session, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { restResources } = require('@shopify/shopify-api/rest/admin/2025-04');
const { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } = require('@google/genai');
const fs = require('fs');
const path = require('path');
require('@shopify/shopify-api/adapters/node');

const program = new Command();

// --- Shopify API Client Initialization (Custom App Mode) ---

const shopifyShopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;

if (!shopifyShopDomain || !adminAccessToken || !apiKey || !apiSecret) {
  console.error('Error: Missing required Shopify environment variables for custom app authentication.');
  console.error('Please ensure SHOPIFY_SHOP_DOMAIN, SHOPIFY_ADMIN_ACCESS_TOKEN, SHOPIFY_API_KEY, and SHOPIFY_API_SECRET are set in .env.local');
  process.exit(1);
}

const shopify = shopifyApi({
  apiKey: apiKey,
  apiSecretKey: apiSecret,
  scopes: ['read_content', 'write_content', 'read_online_store_pages', 'write_online_store_pages'],
  hostName: shopifyShopDomain.replace(/https?:\/\//, ''),
  apiVersion: ApiVersion.April25,
  isCustomStoreApp: true,
  adminApiAccessToken: adminAccessToken || '',
  restResources,
});

// Create a session for the custom app
const session = new Session({
    shop: shopifyShopDomain,
    accessToken: adminAccessToken,
    isOnline: false,
    id: `custom-app-session-${shopifyShopDomain}`
});

// --- Gemini AI Client Initialization ---
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_KEY;
let genAI;
if (geminiApiKey) {
    genAI = new GoogleGenAI({ apiKey: geminiApiKey });
    console.log("Gemini client initialized with API Key.");
} else {
    console.warn("Warning: GEMINI_API_KEY or GOOGLE_AI_STUDIO_KEY not found in .env.local. AI generation features will be disabled.");
}

// --- GraphQL Client Helper ---
async function shopifyGraphQL(query, variables = {}) {
    const client = new shopify.clients.Graphql({ session });
    try {
        const response = await client.query({
            data: { query, variables },
        });
        
        if (response.body.errors) {
            console.error('GraphQL Query returned errors:', JSON.stringify(response.body.errors, null, 2));
            const combinedMessage = response.body.errors.map((e) => e.message).join('; ');
            throw new Error(`GraphQL query failed: ${combinedMessage}`);
        }
        
        if (!response.body.data) {
             console.error('GraphQL query succeeded but returned no data:', response.body);
             throw new Error('GraphQL query succeeded but returned no data.');
        }
        return response.body.data;
    } catch (error) {
        console.error('Error during Shopify GraphQL request:', error);
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(`Shopify API request failed: ${JSON.stringify(error)}`);
        }
    }
}

// --- Gemini Article Data Generation Helper ---
/**
 * Generates detailed article data using Google Gemini based on provided instructions.
 * @param {string} instructions - User instructions for the type of articles.
 * @param {number} amount - Number of articles to generate.
 * @param {string} blogId - The blog ID where articles will be created.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of article data objects.
 */
async function generateArticleDataWithGemini(instructions, amount, blogId) {
    if (!genAI) {
        throw new Error("Gemini API key not configured. Cannot generate article data.");
    }
    console.log(`Generating ${amount} article(s) data with Gemini based on: "${instructions}"`);

    const articleSchema = {
        type: Type.OBJECT,
        properties: {
            articles: {
                type: Type.ARRAY,
                description: `List of ${amount} article details including title, content_html (EN), summary, tags, title_fi (FI), and content_html_fi (FI).`,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: 'Compelling article title (English).' },
                        content_html: { type: Type.STRING, description: 'Detailed article content in HTML format (English). REQUIRED.' },
                        summary: { type: Type.STRING, description: 'Brief article summary or excerpt (English).' },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Array of relevant string tags/keywords. REQUIRED.' },
                        title_fi: { type: Type.STRING, description: 'Finnish translation of the title. REQUIRED.' },
                        content_html_fi: { type: Type.STRING, description: 'Finnish translation of the content_html (HTML format). REQUIRED.' },
                        summary_fi: { type: Type.STRING, description: 'Finnish translation of the summary. REQUIRED.' }
                    },
                    required: ["title", "content_html", "summary", "tags", "title_fi", "content_html_fi", "summary_fi"]
                }
            }
        },
        required: ["articles"]
    };

    const prompt = `Generate detailed and realistic data for ${amount} blog article(s). Instructions: ${instructions}. 
Provide fields: title (EN), content_html (EN, HTML format), summary (EN), tags (array of strings), title_fi (Finnish title), content_html_fi (Finnish HTML content), summary_fi (Finnish summary).
It is CRITICAL that you provide ALL fields, including Finnish translations (title_fi, content_html_fi, summary_fi). Do NOT omit any fields.
Make the content engaging, informative, and suitable for a professional blog.`;

    try {
        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash", 
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: articleSchema,
                temperature: 0.7,
            },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ],
        });
        
        const modelResponse = result;

        if (!modelResponse || !modelResponse.candidates || modelResponse.candidates.length === 0 || 
            !modelResponse.candidates[0].content || !modelResponse.candidates[0].content.parts || 
            modelResponse.candidates[0].content.parts.length === 0 || !modelResponse.candidates[0].content.parts[0].text) {
            console.error("Error: Unexpected response structure from Gemini API:", JSON.stringify(modelResponse, null, 2));
            throw new Error("Unexpected response structure from Gemini API.");
        }

        const responseText = modelResponse.candidates[0].content.parts[0].text;
        let jsonToParse = responseText;

        // Try to extract from ```json ... ``` block
        const jsonBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonBlockMatch && jsonBlockMatch[1]) {
            jsonToParse = jsonBlockMatch[1];
        }
        
        let generatedData;
        try {
            generatedData = JSON.parse(jsonToParse);
        } catch (parseError) {
            console.error("Error parsing JSON response from Gemini:", parseError);
            console.error("Original text from API:", responseText);
            console.error("Attempted to parse:", jsonToParse);
            throw new Error("Failed to parse JSON response from Gemini.");
        }

        // Ensure the structure is { articles: [...] }
        let finalArticleArray = [];
        if (generatedData && generatedData.articles && Array.isArray(generatedData.articles)) {
            finalArticleArray = generatedData.articles;
        } else if (Array.isArray(generatedData) && generatedData.length > 0 && 
                   typeof generatedData[0] === 'object' && 
                   generatedData[0].title && generatedData[0].content_html && 
                   Array.isArray(generatedData[0].tags) &&
                   generatedData[0].title_fi && generatedData[0].content_html_fi) {
            finalArticleArray = generatedData; 
        } else if (generatedData && typeof generatedData === 'object' && 
                   generatedData.title && generatedData.content_html && 
                   Array.isArray(generatedData.tags) &&
                   generatedData.title_fi && generatedData.content_html_fi) { 
            if (amount > 1) {
                console.warn(`⚠️ Requested ${amount} articles, but Gemini returned data for only 1. Processing the single article.`);
            }
            finalArticleArray = [generatedData];
        } else {
            console.error("Error: Final generatedData structure is invalid or missing required fields (EN/FI/tags).", generatedData);
            throw new Error("Final generatedData structure is invalid or missing required fields.");
        }

        console.log(`✅ Successfully parsed data for ${finalArticleArray.length} article(s).`);
        return finalArticleArray;
    } catch (error) {
        console.error("Error generating article data with Gemini:", error);
        throw error;
    }
}

// --- Translation Registration Helper ---
async function registerArticleTranslations(articleId, titleFi, contentFi, summaryFi) {
    if (!titleFi && !contentFi && !summaryFi) {
        console.log("   No Finnish translations provided, skipping translation registration.");
        return true;
    }

    console.log(`   Registering Finnish translations for article ${articleId}...`);
    
    const translationsToRegister = [];
    if (titleFi) {
        translationsToRegister.push({
            key: "title",
            value: titleFi,
            locale: "fi",
            translatableContentId: articleId
        });
    }
    if (contentFi) {
        translationsToRegister.push({
            key: "content",
            value: contentFi,
            locale: "fi", 
            translatableContentId: articleId
        });
    }
    if (summaryFi) {
        translationsToRegister.push({
            key: "summary",
            value: summaryFi,
            locale: "fi",
            translatableContentId: articleId
        });
    }

    const translationRegisterMutation = `
        mutation TranslationsRegister($resourceId: ID!, $translations: [TranslationInput!]!) {
            translationsRegister(resourceId: $resourceId, translations: $translations) {
                translations {
                    key
                    value
                    locale
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `;

    try {
        const transResult = await shopifyGraphQL(translationRegisterMutation, {
            resourceId: articleId,
            translations: translationsToRegister
        });

        if (transResult.translationsRegister?.userErrors?.length > 0) {
            console.error(`   ❌ Error registering translations for article ${articleId}:`, transResult.translationsRegister.userErrors);
            return false;
        } else {
            console.log(`   ✅ Finnish translations registered successfully for article ${articleId}.`);
            return true;
        }
    } catch (transError) {
        console.error(`   ❌ Exception occurred while registering translations:`, transError);
        return false;
    }
}

// --- Commander Setup ---
program
  .name('shopify-articles-tool')
  .description('CLI tool to manage Shopify blogs and articles using Admin API')
  .version('0.0.1');

// --- List Blogs Command ---
program
  .command('list-blogs')
  .description('List all blogs in the store')
  .option('--limit <number>', 'Number of blogs to list', '10')
  .action(async (options) => {
    console.log(`Listing blogs (limit: ${options.limit})...`);
    const query = `
      query ListBlogs($first: Int!) {
        blogs(first: $first) {
          edges {
            node {
              id
              title
              handle
              createdAt
              updatedAt
              articles(first: 5) {
                edges {
                  node {
                    id
                    title
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;
    try {
      const data = await shopifyGraphQL(query, { first: parseInt(options.limit, 10) });
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Failed to list blogs: ${error.message}`);
      process.exitCode = 1;
    }
  });

// --- Get Blog Command ---
program
  .command('get-blog')
  .description('Get a blog by its ID')
  .requiredOption('--id <gid>', 'Blog GID (e.g., gid://shopify/Blog/12345)')
  .action(async (options) => {
    console.log(`Fetching blog with ID: ${options.id}`);
    const query = `
      query GetBlog($id: ID!) {
        blog(id: $id) {
          id
          title
          handle
          createdAt
          updatedAt
          articles(first: 10) {
            edges {
              node {
                id
                title
                handle
                publishedAt
                tags
              }
            }
          }
        }
      }
    `;
    try {
      const data = await shopifyGraphQL(query, { id: options.id });
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Failed to get blog ${options.id}: ${error.message}`);
      process.exitCode = 1;
    }
  });

// --- Create Blog Command ---
program
  .command('create-blog')
  .description('Create a new blog')
  .requiredOption('--title <title>', 'Blog title')
  .option('--handle <handle>', 'Blog handle (URL slug)')
  .action(async (options) => {
    console.log(`Creating blog: ${options.title}`);
    const input = {
      title: options.title,
      handle: options.handle
    };
    const mutation = `
      mutation BlogCreate($blog: BlogInput!) {
        blogCreate(blog: $blog) {
          blog {
            id
            title
            handle
            createdAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    try {
      const data = await shopifyGraphQL(mutation, { blog: input });
      if (data.blogCreate?.userErrors?.length > 0) {
        console.error('Error creating blog:', JSON.stringify(data.blogCreate.userErrors, null, 2));
        process.exitCode = 1;
      } else {
        console.log('Blog created successfully:');
        console.log(JSON.stringify(data.blogCreate.blog, null, 2));
      }
    } catch (error) {
      console.error(`Failed to create blog: ${error.message}`);
      process.exitCode = 1;
    }
  });

// --- List Articles Command ---
program
  .command('list-articles')
  .description('List articles from a specific blog')
  .requiredOption('--blog-id <gid>', 'Blog GID (e.g., gid://shopify/Blog/12345)')
  .option('--limit <number>', 'Number of articles to list', '10')
  .action(async (options) => {
    console.log(`Listing articles from blog ${options.blogId} (limit: ${options.limit})...`);
    const query = `
      query ListArticles($blogId: ID!, $first: Int!) {
        blog(id: $blogId) {
          id
          title
          articles(first: $first) {
            edges {
              node {
                id
                title
                handle
                publishedAt
                createdAt
                updatedAt
                tags
                summary
                author {
                  displayName
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;
    try {
      const data = await shopifyGraphQL(query, { 
        blogId: options.blogId, 
        first: parseInt(options.limit, 10) 
      });
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Failed to list articles: ${error.message}`);
      process.exitCode = 1;
    }
  });

// --- Get Article Command ---
program
  .command('get-article')
  .description('Get an article by its ID')
  .requiredOption('--id <gid>', 'Article GID (e.g., gid://shopify/Article/12345)')
  .action(async (options) => {
    console.log(`Fetching article with ID: ${options.id}`);
    const query = `
      query GetArticle($id: ID!) {
        article(id: $id) {
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
    `;

    try {
      const client = new shopify.clients.Graphql({ session });
      const response = await client.query({
        data: {
          query,
          variables: { id: options.id }
        }
      });

      if (response.body.errors) {
        console.error('GraphQL errors:', response.body.errors);
        return;
      }

      const article = response.body.data.article;
      if (!article) {
        console.log('Article not found');
        return;
      }

      console.log('\n=== Article Details ===');
      console.log(`ID: ${article.id}`);
      console.log(`Title: ${article.title}`);
      console.log(`Handle: ${article.handle}`);
      console.log(`Published: ${article.isPublished}`);
      console.log(`Published At: ${article.publishedAt || 'Not published'}`);
      console.log(`Created At: ${article.createdAt}`);
      console.log(`Updated At: ${article.updatedAt}`);
      console.log(`Summary: ${article.summary || 'No summary'}`);
      console.log(`Tags: ${article.tags.join(', ') || 'No tags'}`);
      console.log(`Blog: ${article.blog.title} (${article.blog.id})`);
      console.log(`\nBody Content:`);
      console.log(article.body || 'No content');

    } catch (error) {
      console.error('Error fetching article:', error.message);
    }
  });

// --- Create Article Command ---
program
  .command('create-article')
  .description('Create a new article manually')
  .requiredOption('--blog-id <gid>', 'Blog GID (e.g., gid://shopify/Blog/12345)')
  .requiredOption('--title <title>', 'Article title')
  .requiredOption('--content <content>', 'Article content (HTML)')
  .option('--summary <summary>', 'Article summary/excerpt')
  .option('--tags <tags>', 'Comma-separated list of tags')
  .option('--published', 'Publish the article immediately')
  .option('--title-fi <titleFi>', 'Finnish translation for the title')
  .option('--content-fi <contentFi>', 'Finnish translation for the content (HTML)')
  .option('--summary-fi <summaryFi>', 'Finnish translation for the summary')
  .action(async (options) => {
    console.log(`Creating article in blog ${options.blogId}...`);
    
    const articleInput = {
      blogId: options.blogId,
      title: options.title,
      body: options.content,
      isPublished: !!options.published,
    };

    if (options.summary) {
      articleInput.summary = options.summary;
    }

    if (options.tags) {
      articleInput.tags = options.tags.split(',').map(tag => tag.trim());
    }

    const mutation = `
      mutation CreateArticle($article: ArticleCreateInput!) {
        articleCreate(article: $article) {
          article {
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
            author {
              displayName
            }
            blog {
              id
              title
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      const data = await shopifyGraphQL(mutation, { article: articleInput });
      
      if (data.articleCreate.userErrors && data.articleCreate.userErrors.length > 0) {
        console.error('Errors creating article:', data.articleCreate.userErrors);
        process.exitCode = 1;
        return;
      }

      const createdArticle = data.articleCreate.article;
      console.log(`Article created successfully with ID: ${createdArticle.id}`);

      // Register Finnish translations if provided
      if (options.titleFi || options.contentFi || options.summaryFi) {
        console.log('Registering Finnish translations...');
        
        const translations = [];
        if (options.titleFi) {
          translations.push({ key: 'title', value: options.titleFi });
        }
        if (options.contentFi) {
          translations.push({ key: 'content', value: options.contentFi });
        }
        if (options.summaryFi) {
          translations.push({ key: 'summary', value: options.summaryFi });
        }

        await registerArticleTranslations(createdArticle.id, options.titleFi, options.contentFi, options.summaryFi);
      }

      console.log(JSON.stringify(createdArticle, null, 2));
    } catch (error) {
      console.error(`Failed to create article: ${error.message}`);
      process.exitCode = 1;
    }
  });

// --- Generate Articles Command ---
program
  .command('generate-articles')
  .description('Generate and create articles using AI')
  .requiredOption('--blog-id <gid>', 'Blog GID where articles will be created')
  .requiredOption('-a, --amount <number>', 'Number of articles to generate', parseInt)
  .requiredOption('-i, --instructions <instructions>', 'Instructions for the type of articles to generate')
  .option('--published', 'Publish the generated articles immediately')
  .action(async (options) => {
    console.log(`Generating ${options.amount} article(s) for blog ${options.blogId}...`);
    
    try {
      // Generate article data with Gemini
      const articleDataArray = await generateArticleDataWithGemini(
        options.instructions, 
        options.amount, 
        options.blogId
      );
      
      console.log(`Creating ${articleDataArray.length} article(s) in Shopify...`);
      
      const mutation = `
        mutation ArticleCreate($article: ArticleInput!) {
          articleCreate(article: $article) {
            article {
              id
              title
              handle
              publishedAt
              createdAt
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      
      for (let i = 0; i < articleDataArray.length; i++) {
        const articleData = articleDataArray[i];
        console.log(`\nCreating article ${i + 1}/${articleDataArray.length}: "${articleData.title}"`);
        
        const input = {
          blogId: options.blogId,
          title: articleData.title,
          contentHtml: articleData.content_html,
          summary: articleData.summary,
          tags: articleData.tags,
          isPublished: options.published !== undefined ? options.published : true,
          publishedAt: new Date().toISOString(),
          handle: articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        };
        
        try {
          const data = await shopifyGraphQL(mutation, { article: input });
          
          if (data.articleCreate?.userErrors?.length > 0) {
            console.error(`   ❌ Error creating article "${articleData.title}":`, data.articleCreate.userErrors);
            continue;
          }
          
          const createdArticle = data.articleCreate.article;
          console.log(`   ✅ Article created successfully (ID: ${createdArticle.id})`);
          
          // Register Finnish translations
          if (createdArticle.id) {
            await registerArticleTranslations(
              createdArticle.id, 
              articleData.title_fi, 
              articleData.content_html_fi, 
              articleData.summary_fi
            );
          }
          
        } catch (error) {
          console.error(`   ❌ Exception creating article "${articleData.title}":`, error.message);
        }
      }
      
      console.log(`\n✅ Article generation process completed.`);
      
    } catch (error) {
      console.error(`Failed to generate articles: ${error.message}`);
      process.exitCode = 1;
    }
  });

// --- Update Article Command ---
program
  .command('update-article')
  .description('Update an existing article')
  .requiredOption('--id <gid>', 'Article GID to update')
  .option('--title <title>', 'New article title')
  .option('--content <content>', 'New article content (HTML)')
  .option('--summary <summary>', 'New article summary')
  .option('--tags <tags>', 'New comma-separated list of tags')
  .option('--published', 'Publish the article')
  .option('--unpublished', 'Unpublish the article')
  .action(async (options) => {
    console.log(`Updating article ${options.id}...`);
    
    const articleInput = {
      id: options.id,
    };

    if (options.title) {
      articleInput.title = options.title;
    }

    if (options.content) {
      articleInput.body = options.content;
    }

    if (options.summary) {
      articleInput.summary = options.summary;
    }

    if (options.tags) {
      articleInput.tags = options.tags.split(',').map(tag => tag.trim());
    }

    if (options.published) {
      articleInput.isPublished = true;
    } else if (options.unpublished) {
      articleInput.isPublished = false;
    }

    const mutation = `
      mutation UpdateArticle($id: ID!, $article: ArticleUpdateInput!) {
        articleUpdate(id: $id, article: $article) {
          article {
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
            author {
              displayName
            }
            blog {
              id
              title
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      const data = await shopifyGraphQL(mutation, { id: options.id, article: articleInput });
      
      if (data.articleUpdate.userErrors && data.articleUpdate.userErrors.length > 0) {
        console.error('Errors updating article:', data.articleUpdate.userErrors);
        process.exitCode = 1;
        return;
      }

      const updatedArticle = data.articleUpdate.article;
      console.log(`Article updated successfully: ${updatedArticle.id}`);
      console.log(JSON.stringify(updatedArticle, null, 2));
    } catch (error) {
      console.error(`Failed to update article: ${error.message}`);
      process.exitCode = 1;
    }
  });

// --- Delete Article Command ---
program
  .command('delete-article')
  .description('Delete an article by its ID')
  .requiredOption('--id <gid>', 'Article GID to delete')
  .action(async (options) => {
    console.log(`Deleting article: ${options.id}`);
    const input = { id: options.id };

    const mutation = `
      mutation ArticleDelete($input: ArticleDeleteInput!) {
        articleDelete(input: $input) {
          deletedArticleId
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      const data = await shopifyGraphQL(mutation, { input });
      if (data.articleDelete?.userErrors?.length > 0) {
        console.error('Error deleting article:', JSON.stringify(data.articleDelete.userErrors, null, 2));
        process.exitCode = 1;
      } else {
        console.log(`Article deleted successfully: ${data.articleDelete.deletedArticleId}`);
      }
    } catch (error) {
      console.error(`Failed to delete article ${options.id}: ${error.message}`);
      process.exitCode = 1;
    }
  });

// --- Delete Blog Command ---
program
  .command('delete-blog')
  .description('Delete a blog by its ID')
  .requiredOption('--id <gid>', 'Blog GID to delete')
  .action(async (options) => {
    console.log(`Deleting blog: ${options.id}`);
    const input = { id: options.id };

    const mutation = `
      mutation BlogDelete($input: BlogDeleteInput!) {
        blogDelete(input: $input) {
          deletedBlogId
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      const data = await shopifyGraphQL(mutation, { input });
      if (data.blogDelete?.userErrors?.length > 0) {
        console.error('Error deleting blog:', JSON.stringify(data.blogDelete.userErrors, null, 2));
        process.exitCode = 1;
      } else {
        console.log(`Blog deleted successfully: ${data.blogDelete.deletedBlogId}`);
      }
    } catch (error) {
      console.error(`Failed to delete blog ${options.id}: ${error.message}`);
      process.exitCode = 1;
    }
  });

program.parse(process.argv);

// Handle cases where no command is specified
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 