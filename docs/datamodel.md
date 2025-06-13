# Data Model

## Database Schema

### Core Tables

#### Profiles
```sql
table: profiles
- id (uuid, primary key, references auth.users)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- username (text)
- full_name (text)
- avatar_url (text)
- website (text)
- bio (text)
- role (text)
- company (text)
- title (text)
- location (text)
- timezone (text)
```

#### Posts
```sql
table: posts
- id (uuid, primary key)
- created_at (timestamp with time zone)
- title (text)
- slug (text, unique)
- content (text)
- published (boolean)
- author_id (uuid, references profiles)
- last_edited_by (uuid, references auth.users)
- subject (text)
- featured (boolean)
- embedding (vector)
```

#### Media
```sql
table: media
- id (uuid, primary key)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- name (text)
- description (text)
- type (text)
- url (text)
- thumbnail_url (text)
- size (bigint)
- metadata (jsonb)
- user_id (uuid, references auth.users)
- folder_id (uuid, references media_folders)
- generation_prompt (text)
- generation_model (text)
- generation_params (jsonb)
```

#### Media Folders
```sql
table: media_folders
- id (uuid, primary key)
- created_at (timestamp with time zone)
- name (text)
- description (text)
- parent_id (uuid, references media_folders)
- user_id (uuid, references auth.users)
```

### Internationalization

#### Languages
```sql
table: languages
- id (text, primary key)
- created_at (timestamp with time zone)
- name (text)
- native_name (text)
- enabled (boolean)
- default (boolean)
```

#### Translations
```sql
table: translations
- id (uuid, primary key)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- language_id (text, references languages)
- namespace (text)
- key (text)
- value (text)
- status (text)
```

### Analytics

#### Analytics Events
```sql
table: analytics_events
- id (uuid, primary key)
- created_at (timestamp with time zone)
- event_type (text)
- page_url (text)
- user_id (uuid, references auth.users)
- session_id (text)
- locale (text)
- referrer (text)
- user_agent (text)
- ip_address (text)
- device_type (text)
- country (text)
- city (text)
- metadata (jsonb)
```

### Communication

#### Contacts
```sql
table: contacts
- id (uuid, primary key)
- created_at (timestamp with time zone)
- name (text)
- company (text)
- email (text)
- description (text)
- status (text)
```

#### Landing Pages
```sql
table: landing_pages
- id (uuid, primary key)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- title (text)
- slug (text, unique)
- content (jsonb)
- published (boolean)
- author_id (uuid, references auth.users)
- metadata (jsonb)
```

### Booking System

#### Appointment Types
```sql
table: appointment_types
- id (uuid, primary key)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- user_id (uuid, references auth.users)
- name (text)
- description (text)
- duration (integer)
- color (text)
- active (boolean)
```

#### Booking Slots
```sql
table: booking_slots
- id (uuid, primary key)
- created_at (timestamp with time zone)
- start_time (timestamp with time zone)
- end_time (timestamp with time zone)
- user_id (uuid, references auth.users)
- appointment_type_id (uuid, references appointment_types)
- status (text)
- booking_id (uuid, references bookings)
```

#### Bookings
```sql
table: bookings
- id (uuid, primary key)
- created_at (timestamp with time zone)
- slot_id (uuid, references booking_slots)
- customer_name (text)
- customer_email (text)
- customer_company (text)
- description (text)
- status (text)
- meeting_link (text)
- calendar_event_id (text)
```

### Shopify Integration

#### Metafield Definitions
```sql
table: metafield_definitions
- id (uuid, primary key)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- name (text) -- Human-readable name
- namespace (text) -- Shopify metafield namespace
- key (text) -- Shopify metafield key
- owner_type (text) -- PRODUCT, COLLECTION, ARTICLE, etc.
- metafield_type (text) -- Shopify metafield type (single_line_text_field, etc.)
- description (text)
- validation_rules (jsonb) -- Shopify validation options
- shopify_definition_id (text) -- Shopify GID for the definition
- is_active (boolean)
- created_by (uuid, references auth.users)
- storefront_visible (boolean) -- Whether visible on storefront
- auto_generated (boolean) -- Whether auto-generated from schema detection
- source_identifier (text) -- Reference to data source or schema that generated this
```

#### Metafield Mappings
```sql
table: metafield_mappings
- id (uuid, primary key)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- metafield_definition_id (uuid, references metafield_definitions)
- data_source_id (bigint, references data_sources)
- external_field_name (text) -- Field name in external data source
- external_field_path (text) -- JSON path if nested field
- transformation_rules (jsonb) -- Rules for transforming external data to metafield value
- is_active (boolean)
```

#### External Field Mappings
```sql
table: external_field_mappings
- id (uuid, primary key)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- data_source_id (bigint, references data_sources)
- external_field_name (text) -- Original field name from external source
- external_field_type (text) -- Detected field type
- external_field_path (text) -- JSON path if nested
- shopify_field_type (text) -- Standard Shopify field it maps to (if any)
- is_metafield_candidate (boolean) -- Whether this should become a metafield
- sample_values (jsonb) -- Sample values for type detection
- frequency (integer) -- How often this field appears across records
- created_by_detection (boolean) -- Whether detected automatically
```

#### Metafield Values
```sql
table: metafield_values
- id (uuid, primary key)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- metafield_definition_id (uuid, references metafield_definitions)
- resource_type (text) -- PRODUCT, COLLECTION, etc.
- resource_id (text) -- Internal ID of the resource
- shopify_resource_gid (text) -- Shopify GID of the resource
- shopify_metafield_id (text) -- Shopify metafield GID
- value (text) -- The metafield value (always stored as text per Shopify)
- parsed_value (jsonb) -- Parsed value for complex types
- sync_status (text) -- pending, synced, error
- sync_error (text) -- Error message if sync failed
- last_synced_at (timestamp with time zone)
```

## Row Level Security Policies

### Posts
- Anyone can read published posts
- Only authenticated users can create posts
- Only post author or admin can update/delete posts

### Media
- Only authenticated users can upload media
- Users can only access their own media
- Admin users can access all media

### Contacts
- Anyone can create contacts
- Only authenticated users can view contacts
- Only admin users can update contact status

### Booking
- Anyone can view available booking slots
- Only slot owner can manage their slots
- Only authenticated users can create appointment types
- Only booking owner can view customer details

### Translations
- Anyone can read translations
- Only authenticated users can create/update translations
- Only admin users can delete translations

## Real-time Enabled Tables
- languages
- translations
- booking_slots
- bookings

## Functions and Triggers
- update_updated_at(): Updates updated_at timestamp
- handle_new_user(): Creates profile for new users
- update_post_embedding(): Updates post embedding vector
- update_session_last_seen(): Updates analytics session

## Indexes
- posts(slug)
- posts(embedding) using ivfflat
- booking_slots(start_time, end_time)
- translations(language_id, namespace, key)
- landing_pages(slug)

## Core Types

### Image Generation
```typescript
interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_outputs?: number;
  scheduler?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
}

interface ImageGenerationResponse {
  images: string[];
  metadata: {
    prompt: string;
    style: string;
    dimensions: {
      width: number;
      height: number;
    };
    seed: number;
  };
}
```

### Image Optimization
```typescript
interface ImageOptimizationRequest {
  input: string;
  output: string;
  removeBg?: boolean;
  resize?: {
    width: number;
    height: number;
  };
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;
}

interface ImageOptimizationResult {
  success: boolean;
  outputPath: string;
  metadata: {
    format: string;
    size: number;
    dimensions: {
      width: number;
      height: number;
    };
  };
}
```

### Brand Assets
```typescript
interface BrandImageRequest {
  brandName: string;
  type: 'logo' | 'banner' | 'social' | 'favicon';
  style: string;
  dimensions: {
    width: number;
    height: number;
  };
}
```

Constraints:
- `name`: minimum length 2 characters
- `email`: valid email format
- `description`: minimum length 10 characters

Row Level Security:
- Anyone can create contacts
- Only authenticated users can view contacts

### Booking Calendar
```typescript
interface BookingSlot {
  id: string;
  created_at: string;
  start_time: string;
  end_time: string;
  duration: number; // in minutes
  status: 'available' | 'booked' | 'blocked';
  booking_id?: string;
  user_id: string; // the host user
}

interface BookingSettings {
  id: string;
  user_id: string;
  timezone: string;
  default_duration: number; // in minutes
  buffer_before: number; // in minutes
  buffer_after: number; // in minutes
  available_hours: {
    day: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
    start_time: string; // HH:mm format
    end_time: string; // HH:mm format
  }[];
  unavailable_dates: string[]; // YYYY-MM-DD format
}

interface Booking {
  id: string;
  created_at: string;
  slot_id: string;
  customer_name: string;
  customer_email: string;
  customer_company?: string;
  description?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  meeting_link?: string;
  calendar_event_id?: string;
}
```

Constraints:
- `start_time` and `end_time`: ISO 8601 format
- `customer_email`: valid email format
- `customer_name`: minimum length 2 characters
- `description`: maximum length 1000 characters

Row Level Security:
- Authenticated users can manage their own booking slots and settings
- Anyone can view available slots and create bookings
- Only slot owner can view customer details

## Data Flow
1. User Input → Validation → API Request
2. API Response → Processing → Optimization
3. Final Output → Storage/Delivery

## Storage
- Local file system for temporary storage
- Environment variables for API keys and configuration
- Client-side state management (as needed)
