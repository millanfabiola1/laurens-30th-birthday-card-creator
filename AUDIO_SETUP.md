# Audio File Setup

The background music file `lauren-mix.MP3` is 52MB, which exceeds Vercel's recommended 50MB limit for static assets.

## Current Issue
The file may not load properly on Vercel due to size limitations. Vercel can serve files up to 100MB, but files over 50MB may experience timeouts or loading issues.

## Solutions:

### Option 1: Compress the MP3 (Recommended)
Compress `lauren-mix.MP3` to under 30MB using an audio compression tool:
- Online tools: CloudConvert, Online-Convert, or Audacity
- Target: 96-112 kbps bitrate should reduce size significantly
- Then replace `public/lauren-mix.MP3` with the compressed version

### Option 2: Host on CDN (Best for Large Files)
1. Upload `lauren-mix.MP3` to a CDN:
   - **Cloudinary** (free tier): https://cloudinary.com
   - **AWS S3 + CloudFront**
   - **Google Cloud Storage**
2. Update the audio path in `components/top-bar.tsx` line 153:
   ```typescript
   const audio = new Audio('YOUR_CDN_URL/lauren-mix.MP3')
   ```

### Option 3: Use Vercel Blob Storage
If you have a Vercel Pro account, you can use Vercel Blob Storage for large files.

## Current Status
✅ Code is ready and deployed
✅ Mute button is functional
⚠️ Audio file may not load due to size (52MB exceeds recommended 50MB limit)



