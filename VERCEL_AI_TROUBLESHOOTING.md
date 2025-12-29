# Vercel AI Troubleshooting Guide

## Quick Diagnostic Checklist

### 1. Verify Environment Variables in Vercel

Go to your Vercel dashboard → Your project → Settings → Environment Variables

**Make sure you have:**
- `ANTHROPIC_API_KEY` = Your Anthropic API key (starts with `sk-ant-api03-...`)
- `VITE_SUPABASE_URL` = Your Supabase URL
- `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

**Important:** Make sure the environment variables are set for:
- ✅ Production
- ✅ Preview
- ✅ Development

After adding/updating env vars, you MUST redeploy!

### 2. Check Browser Console

Open your deployed Vercel app and press F12 (or right-click → Inspect → Console tab)

**Look for errors like:**
- `Failed to fetch` - Network/CORS issue
- `500 Internal Server Error` - API key not configured
- `404 Not Found` - API endpoint not found

**Copy any error messages you see**

### 3. Test API Endpoints Directly

Open a new tab and try these URLs (replace `YOUR-APP.vercel.app` with your actual URL):

**Test 1 - Check if API exists:**
```
https://YOUR-APP.vercel.app/api/ai-recommendations
```
Expected: You should see `Method not allowed` (405 error) - this is good! It means the endpoint exists.

**Test 2 - Check ask-claude:**
```
https://YOUR-APP.vercel.app/api/ask-claude
```
Expected: Same 405 error is good.

If you get 404, the API routes aren't deploying correctly.

### 4. Check Vercel Deployment Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Click "View Function Logs" or "Runtime Logs"
4. Look for errors related to `ai-recommendations` or `ask-claude`

**Common errors:**
- `ANTHROPIC_API_KEY not found` → Add env var and redeploy
- `Module not found` → Build issue, check if `api/` folder deployed
- `Authentication failed` → API key is wrong/expired

### 5. Force Redeploy

Sometimes Vercel caches old environment variables:

1. Go to Deployments tab
2. Click the 3 dots (...) on the latest deployment
3. Click "Redeploy"
4. Make sure "Use existing Build Cache" is UNCHECKED
5. Click "Redeploy"

### 6. Test the AI Features

After verifying everything above:

**Test AI Recommendations:**
1. Click on any node in your mind map
2. Click the "Suggest Next Node" button (purple gradient button)
3. Wait 2-3 seconds
4. You should see 3 AI-suggested nodes appear below the selected node

**Test LabBuddy Chat:**
1. Look for the chat interface (usually in the sidebar)
2. Type a question like "What is machine learning?"
3. Hit send/enter
4. You should get a response from Claude

## Still Not Working?

Share these details:
1. The exact error message from browser console
2. Screenshot of your Vercel environment variables (hide the actual key values)
3. Whether the API endpoint tests (step 3) return 404 or 405
4. Any errors from Vercel deployment logs

## Common Fixes

### "Anthropic API key not configured"
→ Add `ANTHROPIC_API_KEY` to Vercel environment variables and redeploy

### 404 on /api/ai-recommendations
→ Check that `/api` folder exists in your repo and vercel.json is correct

### CORS errors
→ This shouldn't happen with Vercel serverless functions, but if it does, we may need to add CORS headers

### "Invalid API key"
→ Your Anthropic API key might be wrong. Double-check it in Anthropic console: https://console.anthropic.com/
