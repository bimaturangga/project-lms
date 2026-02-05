# Upload Feature Documentation

## Fitur Upload Template Sertifikat dan Thumbnail Kursus

### Overview

Admin sekarang dapat mengupload file untuk:

1. **Thumbnail Kursus** - Gambar preview kursus (JPG, PNG, max 2MB)
2. **Template Sertifikat** - Template yang akan digunakan untuk generate sertifikat (PDF, JPG, PNG, max 5MB)

### Komponen yang Dibuat

#### 1. FileUpload Component

- Path: `src/components/ui/FileUpload/`
- Features:
  - Drag & drop interface
  - File type validation
  - File size validation
  - Upload progress indicator
  - Success/error feedback
  - File removal option

#### 2. Upload API Endpoint

- Path: `src/app/api/upload/route.ts`
- Features:
  - Handle file upload via multipart/form-data
  - File validation (type & size)
  - Unique filename generation
  - Separate folders for thumbnails and certificates
  - Return public URL for uploaded files

#### 3. File Storage Structure

```
public/uploads/
├── thumbnails/     # Course thumbnail images
├── certificates/   # Certificate templates
└── .gitkeep       # Ensure folder exists in git
```

### How to Use

#### For Admin - Creating New Course:

1. Go to Admin Dashboard → Courses → New Course
2. In the course form:
   - **Thumbnail**: Click or drag image file (JPG/PNG, max 2MB)
   - **Certificate Template**: Click or drag template file (PDF/JPG/PNG, max 5MB)
3. Files are automatically uploaded when selected
4. URLs are saved in database when course is created

#### For Developers:

##### Using FileUpload Component:

```tsx
import { FileUpload } from '@/components/ui';

// Basic usage
<FileUpload
  onUpload={(url) => setThumbnail(url)}
  accept=".jpg,.jpeg,.png"
  maxSize={2}
  placeholder="Upload thumbnail"
  description="JPG, PNG max 2MB"
/>

// With current file display
<FileUpload
  onUpload={(url) => setCertificate(url)}
  accept=".pdf,.jpg,.png"
  maxSize={5}
  currentFile={currentCertificate}
/>
```

### Database Schema Updates

Files are stored as URL strings in:

- `courses.thumbnail` - Thumbnail image URL
- `courses.certificateTemplate` - Certificate template URL

### Security Considerations

1. **File Type Validation**: Only allowed file types can be uploaded
2. **File Size Limits**: 2MB for thumbnails, 5MB for certificates
3. **Unique Filenames**: Prevents file conflicts and overwriting
4. **Local Storage**: Files stored in public/uploads/ (consider cloud storage for production)

### Future Enhancements

1. **Cloud Storage Integration**: Move to AWS S3, Cloudinary, or similar
2. **Image Optimization**: Resize/compress images automatically
3. **File Management**: Admin panel to manage uploaded files
4. **Batch Upload**: Upload multiple files at once
5. **File Preview**: Preview uploaded files before saving

### Files Modified/Created

- ✅ `src/components/ui/FileUpload/FileUpload.tsx` - Main component
- ✅ `src/components/ui/FileUpload/FileUpload.module.css` - Styling
- ✅ `src/components/ui/FileUpload/index.ts` - Export
- ✅ `src/components/ui/index.ts` - Updated exports
- ✅ `src/app/api/upload/route.ts` - Upload API
- ✅ `src/app/admin/courses/new/page.tsx` - Integrated FileUpload
- ✅ `public/uploads/` - Upload directories
- ✅ `.gitignore` - Ignore uploaded files
