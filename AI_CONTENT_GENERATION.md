# AI Content Generation System for ProLingo

This document outlines the AI content generation system implemented in ProLingo, a language learning platform. The system is designed to automatically generate and refresh educational content, reducing the need for manual content creation and maintenance.

## Overview

The AI content generation system uses OpenAI's GPT models, ElevenLabs for text-to-speech, and Stability AI for image generation to create comprehensive language learning materials. The system can:

1. Generate complete lessons with content, vocabulary, grammar exercises, and audio
2. Refresh existing content to keep it up-to-date
3. Validate content quality before publishing
4. Run on a schedule to maintain fresh content

## Setup Requirements

### Environment Variables

Create a `.env.local` file with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_ORGANIZATION=your_openai_organization_id

# Stability AI (for image generation)
STABILITY_API_KEY=your_stability_api_key

# ElevenLabs (for voice generation)
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# AI Content Generation Settings
AI_CONTENT_GENERATION_ENABLED=true
AI_CONTENT_REFRESH_INTERVAL=604800 # 7 days in seconds
AI_CONTENT_QUALITY_THRESHOLD=0.85 # Minimum quality score (0-1)
AI_CONTENT_REFRESH_CRON=0 0 * * 0 # Weekly on Sunday at midnight

# Content Moderation
CONTENT_MODERATION_ENABLED=true
MODERATION_API_KEY=your_moderation_api_key

# Optional
REDIS_URL=your_redis_url # For caching AI responses
SENTRY_DSN=your_sentry_dsn # For error tracking
```

### Dependencies

The system requires the following npm packages:

```
npm install openai langchain elevenlabs-node stability-client redis @sentry/nextjs zod node-cron axios
```

Or with yarn:

```
yarn add openai langchain elevenlabs-node stability-client redis @sentry/nextjs zod node-cron axios
```

## Usage

### Generating New Content

To generate new lessons, run:

```
npm run generate-content
```

This will create a random lesson. To generate a specific topic, provide the topic index:

```
npm run generate-content -- 0
```

To generate multiple lessons:

```
npm run generate-content -- -1 5
```

This will generate 5 random lessons.

### Refreshing Existing Content

To refresh existing content, run:

```
npm run refresh-content
```

This will refresh a batch of lessons (default: 5). To refresh a specific lesson:

```
npm run refresh-content -- lessonId123
```

To run as a scheduled job:

```
npm run refresh-content -- --cron
```

## System Components

### 1. AI Content Service (`lib/services/aiContentService.ts`)

The core service that handles:
- Generating lesson content using OpenAI
- Creating vocabulary flashcards
- Creating grammar exercises
- Handling audio and image generation
- Content validation

### 2. Content Generation Script (`scripts/generate-ai-content.js`)

A script to generate new content with predefined topics and levels.

### 3. Content Refresh Script (`scripts/refresh-ai-content.js`)

A script to refresh existing content, either on-demand or on a schedule.

## Content Structure

Each AI-generated lesson includes:

- **Basic Information**: Title, level, description, duration
- **Main Content**: HTML-formatted lesson material
- **Vocabulary**: Word-definition pairs for flashcards
- **Grammar Exercises**: Fill-in-the-blank questions with answers
- **Audio**: Pronunciation guide
- **Image**: Visual representation of the lesson topic

## Customization

### Adding New Topics

Edit the `TOPICS` array in `scripts/generate-ai-content.js` to add new topics.

### Adjusting Quality Threshold

Change the `AI_CONTENT_QUALITY_THRESHOLD` environment variable to adjust the minimum quality score required for content to be published.

### Modifying Refresh Schedule

Change the `AI_CONTENT_REFRESH_CRON` environment variable to adjust the schedule for content refreshes.

## Troubleshooting

### API Rate Limits

If you encounter rate limit errors, consider:
- Implementing retry logic with exponential backoff
- Using a queue system for large batches
- Spreading content generation over time

### Content Quality Issues

If generated content doesn't meet quality standards:
- Adjust the prompts in `aiContentService.ts`
- Lower the temperature parameter for more predictable outputs
- Implement additional validation steps

## Future Enhancements

Planned improvements include:
- User feedback integration to improve content quality
- More sophisticated content scheduling based on user engagement
- Personalized content generation based on user learning patterns
- Multi-language support for content generation 