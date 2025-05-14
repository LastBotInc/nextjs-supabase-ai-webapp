import { describe, it, expect, beforeEach, vi } from 'vitest';
import { caffitellaToShopify, createShopifyProduct } from '../feed-to-shopify-exporter';
import * as child_process from 'child_process'; // Import the actual module
import * as fs from 'fs'; // Import the actual module

// Auto-mock the entire child_process module
vi.mock('child_process');
// Auto-mock the entire fs module
vi.mock('fs');

// Cast the mocked spawn to the correct type for mockReturnValue
const mockedSpawn = child_process.spawn as ReturnType<typeof vi.fn>;
const mockedStatSync = fs.statSync as ReturnType<typeof vi.fn>;

describe('Feed to Shopify Exporter', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Now, set up the specific mock implementation for spawn
    mockedSpawn.mockReturnValue({
      stdout: {
        on: vi.fn((event, cb) => {
          if (event === 'data') {
            cb(JSON.stringify({ id: 'gid://shopify/Product/12345', defaultVariantId: 'gid://shopify/ProductVariant/67890' }));
          }
        }),
      },
      stderr: {
        on: vi.fn(),
      },
      on: vi.fn((event, cb) => {
        if (event === 'close') {
          cb(0);
        }
      }),
    } as any); // Use 'as any' to simplify type for mock return value

    // Setup mock for fs.statSync
    mockedStatSync.mockReturnValue({ size: 1024 } as any);
  });

  describe('caffitellaToShopify mapper', () => {
    it('should map CaffitellaProduct to ShopifyProduct and include metafields', () => {
      const sourceProduct = {
        id: 'CFF123',
        title: 'Test Coffee',
        link: 'https://example.com/coffee/test-coffee',
        image_link: 'https://example.com/images/test-coffee.jpg',
        price: '12,99',
        categories: {
          category: ['Coffee Beans', 'Arabica'],
        },
        description: 'A great test coffee.',
        title_fi: 'Testikahvi',
        description_html_fi: '<p>Hieno testikahvi.</p>'
      };

      const shopifyProduct = caffitellaToShopify(sourceProduct as any);

      expect(shopifyProduct.title).toBe('Test Coffee');
      expect(shopifyProduct.vendor).toBe('Caffitella');
      expect(shopifyProduct.productType).toBe('Coffee Beans');
      expect(shopifyProduct.tags).toEqual(['Coffee Beans', 'Arabica']);
      expect(shopifyProduct.variants[0].price).toBe('12.99');
      expect(shopifyProduct.variants[0].sku).toBe('CAFF-CFF123');
      expect(shopifyProduct.description).toBe('A great test coffee.');
      expect(shopifyProduct.title_fi).toBe('Testikahvi');
      expect(shopifyProduct.description_html_fi).toBe('<p>Hieno testikahvi.</p>');
      expect(shopifyProduct.image_link).toBe('https://example.com/images/test-coffee.jpg');
      
      expect(shopifyProduct.metafields).toBeDefined();
      expect(shopifyProduct.metafields).toContainEqual({
        key: 'original_feed_link',
        namespace: 'feed_data',
        type: 'url',
        value: 'https://example.com/coffee/test-coffee'
      });
      expect(shopifyProduct.metafields).toContainEqual({
        key: 'feed_source_id',
        namespace: 'feed_data',
        type: 'single_line_text_field',
        value: 'CFF123'
      });
    });

    it('should handle missing optional fields gracefully', () => {
      const sourceProduct = {
        id: 'CFF789',
        title: 'Minimal Coffee',
        image_link: 'https://example.com/images/minimal.jpg',
        price: '9,00',
        categories: { category: ['Generic'] },
      };
      const shopifyProduct = caffitellaToShopify(sourceProduct as any);
      expect(shopifyProduct.title).toBe('Minimal Coffee');
      expect(shopifyProduct.description).toBeUndefined();
      expect(shopifyProduct.title_fi).toBeUndefined();
      expect(shopifyProduct.description_html_fi).toBeUndefined();
      expect(shopifyProduct.metafields).toContainEqual({
        key: 'feed_source_id', namespace: 'feed_data', type: 'single_line_text_field', value: 'CFF789'
      });
      expect(shopifyProduct.metafields?.find(mf => mf.key === 'original_feed_link')).toBeUndefined();
    });
  });

  describe('createShopifyProduct function', () => {
    it('should call spawn with correct arguments including --metafields when present', async () => {
      const shopifyProductWithMetafields = {
        id: 123,
        title: 'Product With Metafields',
        vendor: 'TestVendor',
        productType: 'TestType',
        tags: ['test', 'meta'],
        status: 'active' as 'active',
        variants: [{
          id: 1,
          title: 'Default',
          price: '10.00',
          sku: 'SKU123',
          inventoryQuantity: 10
        }],
        description: '<p>Description here</p>',
        image_link: 'https://example.com/image.jpg',
        metafields: [
          { key: 'custom_info', namespace: 'details', type: 'json_string', value: '{\"size\": \"L\"}' }
        ]
      };

      await createShopifyProduct(shopifyProductWithMetafields, false);

      expect(mockedSpawn).toHaveBeenCalledTimes(1); 
      
      const spawnArgs = mockedSpawn.mock.calls[0][1];
      
      expect(spawnArgs).toContain('tools/shopify-product-tool.cjs');
      expect(spawnArgs).toContain('create');
      expect(spawnArgs).toContain(`--title=Product With Metafields`);
      expect(spawnArgs).toContain('--metafields');
      expect(spawnArgs).toContain(JSON.stringify(shopifyProductWithMetafields.metafields));
    });

    it('should call spawn without --metafields if not present on product', async () => {
      const shopifyProductWithoutMetafields = {
        id: 456,
        title: 'Product Without Metafields',
        vendor: 'TestVendor',
        productType: 'TestType',
        tags: ['test'],
        status: 'draft' as 'draft',
        variants: [{
          id: 2,
          title: 'Default',
          price: '20.00',
          sku: 'SKU456',
          inventoryQuantity: 5
        }],
        description: '<p>Another one</p>',
        image_link: 'https://example.com/image2.jpg',
      };

      await createShopifyProduct(shopifyProductWithoutMetafields, false);
      
      expect(mockedSpawn).toHaveBeenCalledTimes(1); 
      const spawnArgs = mockedSpawn.mock.calls[0][1];
      expect(spawnArgs).not.toContain('--metafields');
    });

    it('should handle dry run correctly', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const product = {
        id: 789,
        title: 'Dry Run Product',
        vendor: 'DryVendor',
        productType: 'DryType',
        tags: ['dry'],
        status: 'active' as 'active',
        variants: [],
        metafields: [{ key: 'dry_key', namespace: 'dry_ns', type: 'boolean', value: 'true'}]
      };

      const result = await createShopifyProduct(product, true);

      expect(result.success).toBe(true);
      expect(result.id).toMatch(/^dry-run-id-/);
      expect(mockedSpawn).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('DRY RUN: Would create product:', expect.stringContaining('Dry Run Product'));
      expect(consoleLogSpy).toHaveBeenCalledWith('DRY RUN: With metafields:', JSON.stringify(product.metafields));
      consoleLogSpy.mockRestore();
    });
  });
}); 