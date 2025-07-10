# MediaSelector Component

A reusable media selection component that provides a comprehensive interface for selecting existing media assets, uploading new files, or generating AI images.

## Features

- **Browse Media Library**: View and select from existing media assets
- **Search & Filter**: Real-time search with MIME type filtering
- **Upload Files**: Direct file upload with drag & drop support
- **AI Generation**: Generate images using Imagen 3.0
- **Responsive Design**: Works on desktop and mobile
- **Internationalization**: Full i18n support
- **Type Safety**: Full TypeScript support

## Usage

### Basic Usage

```tsx
import { MediaSelector } from '@/components/media-selector'
import { MediaAsset } from '@/types/media'
import { useState } from 'react'

function MyComponent() {
  const [showSelector, setShowSelector] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>('')

  const handleMediaSelect = (asset: MediaAsset) => {
    setSelectedImage(asset.originalUrl)
  }

  return (
    <div>
      <button onClick={() => setShowSelector(true)}>
        Select Image
      </button>

      <MediaSelector
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        onSelect={handleMediaSelect}
        title="Select Image"
      />
    </div>
  )
}
```

### Advanced Usage with Filtering

```tsx
<MediaSelector
  isOpen={showSelector}
  onClose={() => setShowSelector(false)}
  onSelect={handleMediaSelect}
  title="Select Product Image"
  mimeTypeFilter={['image/jpeg', 'image/png', 'image/webp']}
  allowUpload={true}
  allowGeneration={true}
  selectedAssetId={currentAssetId}
/>
```

### Blog Post Image Selection

```tsx
<MediaSelector
  isOpen={showImageSelector}
  onClose={() => setShowImageSelector(false)}
  onSelect={handleImageSelect}
  title="Select Featured Image"
  mimeTypeFilter={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
  allowUpload={true}
  allowGeneration={true}
/>
```

### Profile Avatar Selection

```tsx
<MediaSelector
  isOpen={showAvatarSelector}
  onClose={() => setShowAvatarSelector(false)}
  onSelect={handleAvatarSelect}
  title="Select Profile Picture"
  mimeTypeFilter={['image/jpeg', 'image/png', 'image/webp']}
  allowUpload={true}
  allowGeneration={false} // Disable AI generation for avatars
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Controls modal visibility |
| `onClose` | `() => void` | - | Called when modal is closed |
| `onSelect` | `(asset: MediaAsset) => void` | - | Called when an asset is selected |
| `selectedAssetId` | `string` | - | ID of currently selected asset |
| `title` | `string` | `'Select Media'` | Modal title |
| `allowUpload` | `boolean` | `true` | Enable file upload |
| `allowGeneration` | `boolean` | `true` | Enable AI image generation |
| `mimeTypeFilter` | `string[]` | - | Filter by MIME types |

## MIME Type Filters

Common MIME type filters:

```tsx
// Images only
mimeTypeFilter={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}

// Photos only (no GIFs)
mimeTypeFilter={['image/jpeg', 'image/png', 'image/webp']}

// Videos only
mimeTypeFilter={['video/mp4', 'video/webm', 'video/quicktime']}

// Documents only
mimeTypeFilter={['application/pdf', 'application/msword', 'text/plain']}
```

## Translations

The component uses the `Media` translation namespace. Required translation keys:

```json
{
  "search": "Search media...",
  "upload": "Upload",
  "uploading": "Uploading...",
  "generate": "Generate",
  "generating": "Generating...",
  "promptPlaceholder": "Describe the image you want to generate...",
  "noMediaFound": "No media assets found",
  "tryAdjustingSearch": "Try adjusting your search terms",
  "uploadFailed": "Upload failed",
  "generationFailed": "Generation failed",
  "cancel": "Cancel"
}
```

## Authentication

The component requires user authentication for:
- File uploads
- AI image generation

Make sure users are authenticated before showing the MediaSelector.

## Performance

- Limits to 50 assets per load for performance
- Uses optimized image loading with Next.js Image component
- Implements proper loading states and error handling

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- Proper ARIA labels and roles
- Focus management 