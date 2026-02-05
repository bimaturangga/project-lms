# Certificate Logo Configuration

## ✨ Auto-Conversion System

The system **automatically converts SVG logos to PNG** for PDF compatibility!

### Logo Priority

1. **Admin Uploaded Logo** - Upload via Settings page (any format)
2. **Default Logo** - `public/logo.svg` (auto-converted to PNG)

### Supported Formats

- ✅ **SVG** - Auto-converted to PNG (600x300px)
- ✅ **PNG** - Used directly
- ✅ **JPEG/JPG** - Used directly

**No manual conversion needed!** Upload any format and it works. 🎉

## How It Works

### Upload Custom Logo

1. **Admin Dashboard** → **Settings**
2. Upload logo (SVG, PNG, or JPEG)
3. Appears on all certificates automatically

### Without Upload

- Uses `public/logo.svg` by default
- Auto-converted to PNG format
- Always shows image logo (no text fallback)

## Technical Details

### Server-Side Conversion

- Uses **Sharp library** for high-quality conversion
- SVG → PNG at 600x300px resolution
- Transparent background preserved
- Optimized for PDF rendering

### Certificate Display

- **Position**: Top-left corner
- **Size**: 40mm × 20mm
- **Format**: High-resolution PNG
- **Quality**: Professional grade

## Best Practices

### Recommended: Use SVG Logo

- ✅ Perfect scalability
- ✅ Small file size
- ✅ Auto-converted seamlessly
- ✅ Professional appearance

### Logo Specifications

- **Aspect Ratio**: 2:1 (e.g., 600×300, 400×200)
- **Background**: Transparent or white
- **Colors**: Match your brand

## Examples

### Admin Uploads SVG

```
Admin uploads logo.svg → System converts to PNG → Certificate shows logo
```

### Admin Uploads PNG

```
Admin uploads logo.png → Used directly → Certificate shows logo
```

### No Admin Upload

```
Uses public/logo.svg → Converts to PNG → Certificate shows logo
```

## Notes

- No text fallback - always shows image logo
- All formats automatically converted if needed
- High-quality output guaranteed
- Works with existing `logo.svg` in public folder

Everything is handled automatically! Just upload and it works. ✨
