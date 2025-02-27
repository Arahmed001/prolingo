# Prolingo API Documentation

## Authentication

All API endpoints require authentication using an API key. Include the key in the `Authorization` header:

```
Authorization: Bearer prolingo-api-key
```

> Note: In a production environment, you should set up a more secure authentication system and store the API key in environment variables.

## Endpoints

### GET /api/lessons

Retrieves a list of all lessons available in the Prolingo platform.

**Request:**
- Method: GET
- URL: `/api/lessons`
- Headers: 
  - `Authorization: Bearer prolingo-api-key`

**Successful Response:**
- Status Code: 200
- Content-Type: application/json
- Body: Array of lesson objects
```json
[
  {
    "id": "lesson-id",
    "title": "Lesson Title",
    "description": "Lesson description...",
    "level": "A1",
    "difficulty": "Beginner"
  },
  ...
]
```

**Empty Response:**
- Status Code: 200
- Content-Type: application/json
- Body:
```json
{
  "message": "No lessons available"
}
```

**Error Responses:**

- 401 Unauthorized: Missing or invalid API key
```json
{
  "error": "Unauthorized"
}
```

- 500 Internal Server Error: Server-side error
```json
{
  "error": "Failed to fetch lessons"
}
```

## Testing

You can test the API endpoint locally by:

1. Start the development server:
```bash
npm run dev
```

2. Visit the test page at `http://localhost:3000/test`

3. Or make requests directly with tools like Postman or curl:
```bash
curl -H "Authorization: Bearer prolingo-api-key" http://localhost:3000/api/lessons
```

## Deploying to Vercel

Follow these steps to deploy the API to Vercel:

1. Ensure your code is committed to Git:
```bash
git add .
git commit -m "Added API route for lessons"
```

2. Install Vercel CLI (if not already installed):
```bash
npm install -g vercel
```

3. Login to Vercel:
```bash
vercel login
```

4. Deploy to Vercel:
```bash
vercel
```

5. For production deployment:
```bash
vercel --prod
```

### Environment Variables

Make sure to set up the following environment variables in Vercel:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

You can set these either through the Vercel dashboard or using the CLI:
```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
```

### Continuous Deployment

To set up continuous deployment:

1. Connect your GitHub repository to Vercel
2. Configure project settings to deploy on each push to main/master branch
3. Vercel will automatically deploy when changes are pushed

### Checking Your Deployment

After deployment, you can test your API at:
```
https://your-project-name.vercel.app/api/lessons
```

Remember to include the Authorization header in your requests. 