# Security Guide

## API Key Authentication

This application uses API key authentication to protect write operations (PATCH, PUT, DELETE) from unauthorized access.

### How It Works

- **Read operations (GET)**: Public, no authentication required
- **Write operations (PATCH, PUT, DELETE)**: Require valid API key in request headers

### Setup Instructions

#### 1. Generate a Secure API Key

Run this command to generate a secure random key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2. Configure Local Development

Create a `.env` file in the project root (already done):

```env
REACT_APP_API_KEY=your-generated-key-here
API_KEY=your-generated-key-here
```

**Note**: `.env` is in `.gitignore` and will NOT be committed to git.

#### 3. Configure Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:
   - `REACT_APP_API_KEY`: Your production API key
   - `API_KEY`: Same production API key
4. Redeploy your application

#### 4. Update .env.production

Replace the placeholder in `.env.production`:

```env
REACT_APP_API_KEY=your-production-key-here
API_KEY=your-production-key-here
```

**Important**: Use a DIFFERENT key for production than development!

### How the Frontend Sends the API Key

The API key is automatically included in request headers:

```javascript
headers.append("X-API-Key", process.env.REACT_APP_API_KEY);
```

### Protected Endpoints

The following endpoints require authentication:

- `PATCH /api/kanji/stats` - Update kanji statistics
- `PATCH /api/kanji/:id` - Update individual kanji
- `PATCH /api/dutch/stats` - Update Dutch statistics  
- `PATCH /api/dutch/:id` - Update individual Dutch word

### Public Endpoints

These endpoints are public (no authentication required):

- `GET /api/test` - Test endpoint
- `GET /api/kanji/stats` - Get kanji statistics
- `GET /api/kanji` - Get all kanji
- `GET /api/kanji/:id` - Get individual kanji
- `GET /api/dutch/stats` - Get Dutch statistics
- `GET /api/dutch` - Get all Dutch words
- `GET /api/dutch/:id` - Get individual Dutch word

### Security Best Practices

1. **Never commit API keys to git**
   - `.env` is in `.gitignore`
   - `.env.production` should have placeholder values only

2. **Use different keys for different environments**
   - Development: One key
   - Production: Different key

3. **Rotate keys periodically**
   - Generate new keys every few months
   - Update both frontend and backend

4. **Monitor unauthorized access attempts**
   - Check server logs for 401 errors
   - Investigate suspicious patterns

### Troubleshooting

#### Error: "Unauthorized: Invalid or missing API key"

1. Check that `.env` file exists with correct keys
2. Restart the development server after changing `.env`
3. Verify the key matches on both frontend and backend
4. Check browser console for API key being sent

#### Production deployment not working

1. Verify environment variables are set in Vercel dashboard
2. Redeploy after adding environment variables
3. Check Vercel function logs for errors

### Testing Authentication

Try making a request without authentication:

```bash
curl -X PATCH https://nihongo-v3.vercel.app/api/dutch/stats \
  -H "Content-Type: application/json" \
  -d '{"local":{"correct":0,"total":0,"record":0}}'
```

Expected response: `401 Unauthorized`

With authentication:

```bash
curl -X PATCH https://nihongo-v3.vercel.app/api/dutch/stats \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"local":{"correct":0,"total":0,"record":0}}'
```

Expected response: Updated stats object
