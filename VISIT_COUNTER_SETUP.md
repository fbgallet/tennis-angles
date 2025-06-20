# Visit Counter Setup for Vercel Deployment

## Problem

The visit counter was not working on Vercel because it was trying to use the file system (`data/visits.json`) to store visit data. Vercel's serverless functions are stateless and don't have persistent file system access.

## Solution

Updated the visit counter to use **Upstash Redis** for persistent, reliable visit counting that survives deployments and scales automatically.

## Current Implementation (Production-Ready)

The current solution uses Upstash Redis that provides:

- ✅ **Persistent storage**: Survives deployments and restarts
- ✅ **Fast performance**: Redis-based with global edge locations
- ✅ **Generous free tier**: 10,000 commands/day free
- ✅ **Auto-scaling**: Handles traffic spikes automatically
- ✅ **Session tracking**: Prevents duplicate counts per session

## Setup Instructions

### 1. Upstash Redis Database (Already Done)

Since you've already created your Upstash Redis database, you just need to configure the environment variables.

### 2. Configure Environment Variables

Add your Upstash Redis credentials to Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add these variables from your Upstash dashboard:
   - `UPSTASH_REDIS_REST_URL`: Your Redis REST URL
   - `UPSTASH_REDIS_REST_TOKEN`: Your Redis REST token

### 3. Deploy

Deploy your updated code:

```bash
git add .
git commit -m "Upgrade visit counter to use Upstash Redis"
git push
```

## How It Works

### Before (File System - ❌ Doesn't work on Vercel)

```typescript
// Tried to write to data/visits.json
await fs.writeFile(VISITS_FILE, JSON.stringify({ visits: count }));
```

### After (Upstash Redis - ✅ Production Ready)

```typescript
// Persistent Redis storage
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
await redis.set("tennis-angle-theory:visits", count);
```

## Features

- **Persistent storage**: Visit counts survive deployments and function restarts
- **Session tracking**: Prevents multiple counts from the same browser session
- **Error handling**: Graceful fallbacks if Redis is unavailable
- **Fast performance**: Global Redis edge locations for low latency
- **Scalable**: Handles high traffic automatically

## Testing

After deployment, the visit counter should:

1. Display the current visit count on page load
2. Increment by 1 for new browser sessions
3. Not increment for repeat visits in the same session
4. Persist across deployments and server restarts

## Troubleshooting

### Visit counter shows 0 or doesn't appear

1. Check that your Upstash Redis environment variables are set correctly in Vercel
2. Verify the API route is working by visiting `/api/visits` directly
3. Check the Vercel function logs for any Redis connection errors
4. Ensure your Upstash Redis database is active and not paused

### Environment variables not working

1. Make sure you've added both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
2. Check that the variables are set in the correct environment (Production/Preview/Development)
3. Redeploy the project after adding environment variables

## Cost

Upstash Redis has a generous free tier perfect for visit counting:

- **Free tier**: 10,000 commands per day
- **Each visit**: Uses 2 commands (1 GET + 1 SET)
- **Supports**: ~5,000 unique visits per day on free tier
- **Upgrade**: Available if you need more capacity
