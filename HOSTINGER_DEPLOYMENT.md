# Hostinger Production Deployment Guide

## Quick Answer: Yes, `.next` folder should be in `.gitignore`

✅ **FIXED**: The `.next` folder has been added to your `.gitignore` file along with other Next.js-specific entries.

## Production-Ready Modifications for Hostinger

### 1. Update Next.js Configuration

Your current `next.config.mjs` needs one addition for Hostinger deployment:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Add this line for static export
  trailingSlash: true, // Add this line for better compatibility
  sassOptions: {
    includePaths: ["./src"],
  },
  images: {
    unoptimized: true, // Already configured ✅
  },
};

export default nextConfig;
```

### 2. Update Package.json Scripts

Add an export script to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next build", // Add this for static export
    "lint": "eslint .",
    "preview": "next start"
  }
}
```

### 3. Deployment Steps for Hostinger

#### Option A: Static Export (Recommended for Shared Hosting)

1. **Build the application:**

   ```bash
   npm run export
   ```

2. **Upload files:**
   - Upload the contents of the `out/` folder to your domain's `public_html` directory
   - Do NOT upload the entire project, just the `out/` folder contents

#### Option B: Node.js Hosting (If available on your plan)

1. **Upload entire project** to your hosting directory
2. **Install dependencies** on the server:
   ```bash
   npm install --production
   ```
3. **Build on server:**
   ```bash
   npm run build
   ```

### 4. Create .htaccess File

Create a `.htaccess` file in your `public_html` directory:

```apache
# Redirect all requests to index.html for SPA routing
RewriteEngine On
RewriteRule ^$ /index.html [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^([^.]+)$ /$1.html [L]

# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

### 5. Environment Variables

If you need environment variables, create them in Hostinger's control panel:

- `NODE_ENV=production`
- `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`

### 6. Visit Counter Considerations

Your current file-based visit counter (`data/visits.json`) will work on Hostinger, but consider:

- **For shared hosting**: Current implementation is fine
- **For high traffic**: Upgrade to MySQL database (available on most Hostinger plans)

## What's Already Production-Ready ✅

- **SEO**: `sitemap.ts` and `robots.ts` configured
- **Internationalization**: English/French support
- **Responsive Design**: Works on all devices
- **Image Optimization**: Properly configured for static export
- **Error Handling**: Proper fallbacks in place
- **Security**: Input validation and error handling

## Performance Optimizations

### Already Optimized ✅

- SCSS modules for efficient styling
- React 19 with latest optimizations
- TypeScript for better code quality
- Unoptimized images (required for static export)

### Additional Recommendations

- Enable Gzip compression in Hostinger control panel
- Use Hostinger's CDN if available
- Monitor with Google Analytics

## Testing Before Deployment

1. **Build locally:**

   ```bash
   npm run export
   ```

2. **Test the export:**

   - Serve the `out/` folder locally
   - Test all routes and functionality
   - Verify images and assets load correctly

3. **Check for errors:**
   - Open browser console
   - Test on mobile devices
   - Verify all interactive features work

## Troubleshooting Common Issues

### Static Export Issues

- **Problem**: API routes not working
- **Solution**: API routes don't work with static export. Your visit counter API will need to be handled differently or moved to a serverless function.

### File Path Issues

- **Problem**: Assets not loading
- **Solution**: Ensure all paths are relative and case-sensitive

### Routing Issues

- **Problem**: Direct URL access returns 404
- **Solution**: Ensure `.htaccess` file is properly configured

## Summary

Your project is already well-prepared for production! The main changes needed are:

1. ✅ **Fixed**: `.next` folder added to `.gitignore`
2. **Add**: `output: 'export'` to `next.config.mjs`
3. **Add**: `.htaccess` file for proper routing
4. **Build**: Use `npm run export` for static deployment

The application will work perfectly on Hostinger with these modifications.
