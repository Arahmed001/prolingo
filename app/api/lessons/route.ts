import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db, isFirebaseInitialized } from '../../../lib/firebase';

const API_KEY = 'prolingo-api-key';

export async function GET(request: NextRequest) {
  // Check API key
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.replace('Bearer ', '') !== API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if Firebase is initialized
    if (!isFirebaseInitialized()) {
      return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });
    }

    // Get lessons from Firestore
    const lessonsCollection = collection(db, 'lessons');
    const lessonsSnapshot = await getDocs(lessonsCollection);

    if (lessonsSnapshot.empty) {
      return NextResponse.json({ message: 'No lessons available' }, { status: 200 });
    }

    // Format the lessons data
    const lessons = lessonsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        level: data.level || '',
        difficulty: data.difficulty || '',
        // Add other fields as needed, but keep the response lean
      };
    });

    return NextResponse.json(lessons, { status: 200 });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
  }
} 