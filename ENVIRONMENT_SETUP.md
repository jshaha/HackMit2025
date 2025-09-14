# Environment Setup

This project requires several environment variables to be configured. Create a `.env` file in the project root with the following variables:

## Required Environment Variables

### Anthropic API
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Auth0 Authentication
```bash
VITE_AUTH0_DOMAIN=your_auth0_domain_here
VITE_AUTH0_CLIENT_ID=your_auth0_client_id_here
```

### API Configuration
```bash
VITE_API_URL=http://localhost:5000
```

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
