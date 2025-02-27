# Prolingo - Advanced AI Language Learning Platform

Prolingo is a Next.js application that leverages AI to create an enhanced language learning experience for users with both web and VR interfaces.

## Advanced AI Features

### Sentiment Analysis in AI Tutor

The AI Tutor component (`app/ai-tutor/page.tsx`) includes sentiment analysis of user messages:

- **Keyword-based sentiment detection**: Analyses user messages for keywords indicating positive emotions (e.g., "happy", "great"), negative emotions (e.g., "difficult", "frustrated"), or neutral.
- **Dynamic response adaptation**: The AI tunes its responses based on detected sentiment, providing encouragement for positive sentiment, additional help for negative sentiment, and standard responses for neutral sentiment.
- **Sentiment tracking**: All messages are stored in Firebase with their sentiment classification for future analysis.

### Dynamic Difficulty Adjustment

The Lessons component (`app/lessons/[id]/page.tsx`) includes automatic difficulty adjustment based on user performance:

- **Performance tracking**: Monitors user quiz scores across multiple attempts.
- **Difficulty increase**: When a user scores 80% or higher across 3 quizzes, the system automatically increases content difficulty, adding more advanced vocabulary and grammar concepts.
- **Difficulty decrease**: When a user scores below 50% across 3 quizzes, the system simplifies content to ensure better comprehension.
- **Progressive learning path**: Content adapts between A1, A2, and B1 language proficiency levels based on user performance.

## Technical Implementation

- **Firestore Integration**: User progress, chat messages with sentiment, and dynamically adjusted lesson content are all stored in Firebase Firestore.
- **Next.js App Router**: Utilizes Next.js 13's App Router for routing and navigation.
- **Authentication**: Access control with Firebase Authentication, redirecting unauthenticated users to the login page.
- **Responsive UI**: Built with Tailwind CSS for a beautiful, responsive user interface.

## Sample Data

The project includes a setup script (`setup-prolingo.js`) that populates Firebase with:

- Sample lesson data with quizzes
- Sample chat messages with sentiment analysis
- Sample user progress data for testing difficulty adjustment

## New Files Added

- `app/ai-tutor/page.tsx` - AI Tutor with sentiment analysis
- `app/lessons/[id]/page.tsx` - Dynamic difficulty adjustment for lessons
- `setup-prolingo.js` - Script for setting up sample data

# ProLingo VR Language Learning Environment

An immersive VR environment for language learning, built with A-Frame, Next.js, and Firebase.

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Firebase account
- A modern web browser with WebVR support

### Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
```

### Audio Files Setup
Place the following audio files in the `public/audio` directory:
- `ambient.mp3` - Background ambient sound (recommended: soft, non-distracting background music)
- `select.mp3` - Object selection sound (recommended: short, subtle click sound)
- `interaction.mp3` - Interaction feedback sound (recommended: soft pop or swoosh sound)

Recommended audio file specifications:
- Format: MP3
- Sample Rate: 44.1 kHz
- Bit Rate: 128-192 kbps
- Duration:
  - ambient.mp3: 1-2 minutes (will loop)
  - select.mp3: 0.1-0.3 seconds
  - interaction.mp3: 0.3-0.5 seconds

### Firebase Setup

1. Create a new Firebase project
2. Enable Authentication and Firestore
3. Add the following Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /progress/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /presence/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /vr-interactions/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /chats/{docId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null;
    }
  }
}
```

4. Create a Firebase configuration file at `lib/firebase/init.ts`

### Environment Variables

Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## Features

### VR Environment
- Immersive 3D learning space
- Interactive objects with physics-based interactions
- Spatial audio for enhanced immersion
- Progress visualization with growing plants
- Multiplayer support with avatars
- Gesture recognition for mobile VR

### Accessibility
- High contrast mode
- Text-to-speech support
- Customizable audio feedback
- Haptic feedback
- Adjustable text size

### Learning Features
- Comprehensive progress tracking
- Adaptive learning paths
- Personalised recommendations
- Community forums and support
- Multiple learning styles support
- Interactive exercises
- Real-time multiplayer interactions
- Sentiment analysis and adaptive responses
- Dynamic difficulty adjustment

## Troubleshooting

### Common Issues

1. Audio not playing
   - Check if audio files are in the correct directory
   - Ensure audio format is supported by the browser
   - Check browser autoplay policies

2. VR mode not working
   - Ensure WebVR is supported by your browser
   - Check if your device supports VR
   - Try using HTTPS in production

3. Multiplayer features not working
   - Verify Firebase configuration
   - Check Firestore rules
   - Ensure proper authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Licence

MIT Licence - See LICENSE file for details