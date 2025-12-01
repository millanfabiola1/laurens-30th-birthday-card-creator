# Audio File Setup

The background music file `HBD-Lauren.mp3` is 119MB, which exceeds GitHub and Vercel's 100MB file size limit.

## Options:

### Option 1: Compress the MP3 (Recommended)
Compress the MP3 file to under 100MB using an audio compression tool, then:
1. Replace `public/HBD-Lauren.mp3` with the compressed version
2. The file will be automatically included in Vercel deployments

### Option 2: Host Externally
1. Upload `HBD-Lauren.mp3` to a CDN (Cloudinary, AWS S3, etc.)
2. Update the audio path in `components/top-bar.tsx` line 153:
   ```typescript
   const audio = new Audio('YOUR_CDN_URL/HBD-Lauren.mp3')
   ```

### Option 3: Manual Vercel Upload
After deployment, manually upload the file to Vercel's file system (if supported by your plan).

## Current Status
✅ Code is ready and deployed
✅ Mute button is functional
⏳ Waiting for audio file to be available

