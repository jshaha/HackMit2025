# Environment Setup

This project requires several environment variables to be configured. Create a `.env` file in the project root with the following variables:

## Required Environment Variables

### Anthropic API (Server-side ONLY)
```bash
# DO NOT prefix with VITE_ - this would expose your API key to the browser!
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Supabase (Client-side - safe to expose)
```bash
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### API Configuration
```bash
VITE_API_URL=http://localhost:5000
```

## Security Best Practices

**CRITICAL**: Never use the `VITE_` prefix for private API keys!

- ✅ `ANTHROPIC_API_KEY` - Correct (server-side only)
- ❌ `VITE_ANTHROPIC_API_KEY` - WRONG (exposed to browser)

Variables prefixed with `VITE_` are bundled into your client-side JavaScript and can be viewed by anyone in their browser's developer tools.

## How to Get API Keys

### Anthropic API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

### Auth0 Configuration
1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new application
3. Copy the Domain and Client ID
4. Add them to your `.env` file

## Security Notes

- Never commit `.env` files to version control
- The `.env` file is already in `.gitignore`
- All hardcoded API keys have been removed from the codebase
- Environment variables are required for the application to function

## Development

After setting up your `.env` file, run:

```bash
npm run dev
```

The application will start on `http://localhost:5000`

