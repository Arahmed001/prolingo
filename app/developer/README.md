# ProLingo Developer Portal

This directory contains the Developer Portal for the ProLingo application, which provides third-party developers with API documentation, SDK resources, and support.

## Features

1. **API Documentation**
   - Clear documentation for available API endpoints
   - Authentication instructions
   - Response format examples
   - Links to complete API documentation

2. **SDK Resources**
   - Downloadable SDK package
   - Code samples for integration in multiple languages
   - Link to API test page for live testing

3. **Developer Support**
   - Contact form for developer inquiries
   - Form submissions are saved to Firebase Firestore in the `developer-inquiries` collection
   - Authenticated users only (redirects to login page if not authenticated)

## Implementation Details

- The page is built with Next.js App Router architecture
- UI is styled with Tailwind CSS using a responsive, card-based layout
- The page includes Header and Footer components from the main layout
- Authentication is handled through Firebase Auth
- Form submissions are stored in Firestore

## Firebase Structure

The developer inquiries are saved to the `developer-inquiries` collection with the following structure:

```
{
  email: string,
  message: string,
  timestamp: ServerTimestamp,
  userId: string
}
```

## Setting Up Sample Data

Sample developer inquiries can be added to Firebase using the setup script:

```bash
node setup-prolingo.js
```

This will populate the `developer-inquiries` collection with sample inquiries for testing.

## Testing

To test the Developer Portal:

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/developer`

3. Log in with valid credentials (will be redirected to login page if not authenticated)

4. Test the following functionality:
   - View API documentation
   - Download the SDK (placeholder)
   - Submit a developer inquiry via the contact form
   - Verify inquiry was saved to Firebase

## Future Enhancements

- Add API key management (generation, revocation)
- Implement rate limiting and usage metrics
- Add interactive API playground
- Include more comprehensive SDK documentation
- Expand available endpoints 