# Vercel Deployment Guide for LabBuddy

## Quick Deploy

1. **Install Vercel CLI** (if you haven't already):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

   For production deployment:
   ```bash
   vercel --prod
   ```

## Environment Variables Setup

After deploying, you need to add your environment variables in the Vercel dashboard:

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on "Settings" → "Environment Variables"
3. Add the following variables:

### Required Variables:
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `VITE_ANTHROPIC_API_KEY` - Your Anthropic API key (for client-side)
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Optional Variables:
- `NODE_ENV` - Set to `production`

## What Changed for Vercel

1. **Serverless Functions**: Express routes converted to Vercel serverless functions
   - `/api/ai-recommendations.ts` - AI node recommendations
   - `/api/ask-claude.ts` - LabBuddy AI assistant

2. **Build Configuration**: Updated to use `vite build` only (no server bundling needed)

3. **Configuration**: Added `vercel.json` for proper routing

## Testing Locally with Vercel

To test the Vercel setup locally:

```bash
vercel dev
```

This will run your app with Vercel's local development server, simulating the production environment.

## Troubleshooting

### API Routes Not Working
- Make sure environment variables are set in Vercel dashboard
- Check that API routes are in the `/api` folder
- Verify that `vercel.json` rewrites are correct

### Build Failures
- Run `npm run build` locally first to check for errors
- Make sure all dependencies are in `package.json`
- Check Vercel build logs for specific errors

### Supabase Connection Issues
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
- Check Supabase dashboard for API key validity
- Ensure Supabase project is active and accessible

## Support

For issues with Vercel deployment, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
