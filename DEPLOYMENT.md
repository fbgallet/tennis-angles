# Deployment Guide

## Visit Counter Implementation

The current visit counter uses file-based storage which works for development and small-scale deployments. For production use with high traffic, consider upgrading to a database solution.

### Current Implementation

- **Storage**: File-based (`data/visits.json`)
- **Suitable for**: Development, small-scale deployments
- **Limitations**: Not suitable for serverless environments with high concurrency

### Production Recommendations

#### Option 1: Vercel KV (Recommended for Vercel deployment)

```bash
# Install Vercel KV
npm install @vercel/kv

# Update app/api/visits/route.ts
import { kv } from '@vercel/kv';

export async function GET() {
  const visits = await kv.get('visits') || 0;
  return NextResponse.json({ visits });
}

export async function POST() {
  const visits = await kv.incr('visits');
  return NextResponse.json({ visits });
}
```

#### Option 2: Redis

```bash
# Install Redis client
npm install redis

# Use Redis for visit counting
```

#### Option 3: PostgreSQL/MySQL

```bash
# Use a proper database for persistent storage
# Recommended for high-traffic applications
```

### Environment Variables

For production deployment, add these to your environment:

- `KV_REST_API_URL` (for Vercel KV)
- `KV_REST_API_TOKEN` (for Vercel KV)

### Current Features

- ✅ Session-based visit tracking (prevents multiple counts per session)
- ✅ Error handling with fallbacks
- ✅ Subtle UI that doesn't interfere with user experience
- ✅ Real-time visit counting across all users
- ✅ Responsive design for all screen sizes

### File Structure

```
app/
├── api/visits/route.ts          # Visit counter API endpoint
├── components/VisitCounter.tsx  # Visit counter component
├── components/VisitCounter.module.css  # Styling
└── page.tsx                     # Landing page with counter
```

The current implementation will work perfectly for most use cases and can be easily upgraded when needed.
