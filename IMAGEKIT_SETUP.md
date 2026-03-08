# ImageKit Setup Guide

## 1. Get ImageKit Credentials

1. Sign up at [ImageKit.io](https://imagekit.io/)
2. Go to your Dashboard
3. Navigate to Developer Options
4. Copy your:
   - Public Key
   - Private Key
   - URL Endpoint

## 2. Configure Environment Variables

Add these to your `.env` file:

```env
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="your_imagekit_public_key"
IMAGEKIT_PRIVATE_KEY="your_imagekit_private_key"
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_imagekit_id"
```

## 3. Restart Development Server

After adding the environment variables, restart your Next.js development server:

```bash
npm run dev
```

## 4. Test the Upload

1. Navigate to `/dashboard/clubs/new`
2. Fill in the club name
3. Click "Upload Logo" button
4. Select an image file (max 5MB)
5. The image will be uploaded to ImageKit and the URL will be saved

## Features

- ✅ Direct file upload to ImageKit
- ✅ Image preview before submission
- ✅ File size validation (max 5MB)
- ✅ File type validation (images only)
- ✅ Organized in `/club-logos` folder on ImageKit
- ✅ Secure authentication via API route
- ✅ Loading states during upload

## Folder Structure

Uploaded logos are stored in ImageKit under the `/club-logos` folder for easy organization.
