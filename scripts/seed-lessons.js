// This script seeds the Firestore database with sample lessons
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Sample lessons data
const lessons = [
  {
    id: '1',
    title: 'Greetings and Introductions',
    level: 'A1',
    description: 'Learn basic greetings and how to introduce yourself in English.',
    imageUrl: 'https://images.unsplash.com/photo-1516398810565-0cb4310bb8ea?q=80&w=500',
    duration: '30 minutes',
    content: `
      <h3>Common Greetings</h3>
      <p>Here are some common ways to greet people in English:</p>
      <ul>
        <li><strong>Hello</strong> - A universal greeting that works in any situation</li>
        <li><strong>Hi</strong> - A more casual greeting for friends and familiar people</li>
        <li><strong>Good morning</strong> - Used from sunrise until noon</li>
        <li><strong>Good afternoon</strong> - Used from noon until around 5-6 PM</li>
        <li><strong>Good evening</strong> - Used from around 6 PM until bedtime</li>
      </ul>
      
      <h3>Introducing Yourself</h3>
      <p>When meeting someone for the first time, you can use these phrases:</p>
      <ul>
        <li>"My name is [your name]."</li>
        <li>"I'm [your name]."</li>
        <li>"Nice to meet you."</li>
        <li>"Pleased to meet you."</li>
      </ul>
      
      <h3>Asking About Others</h3>
      <p>To ask someone about themselves, you can say:</p>
      <ul>
        <li>"What's your name?"</li>
        <li>"Where are you from?"</li>
        <li>"What do you do?" (asking about their job)</li>
      </ul>
      
      <h3>Practice Dialogue</h3>
      <p><strong>Person A:</strong> Hello, my name is Sarah. What's your name?<br>
      <strong>Person B:</strong> Hi Sarah, I'm John. Nice to meet you.<br>
      <strong>Person A:</strong> Nice to meet you too, John. Where are you from?<br>
      <strong>Person B:</strong> I'm from Canada. How about you?<br>
      <strong>Person A:</strong> I'm from Australia.</p>
    `
  },
  {
    id: '2',
    title: 'Numbers and Counting',
    level: 'A1',
    description: 'Master numbers from 1-100 and basic counting expressions.',
    imageUrl: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?q=80&w=500',
    duration: '25 minutes',
    content: `
      <h3>Cardinal Numbers (1-20)</h3>
      <p>Let's start with the basic numbers from 1 to 20:</p>
      <ul>
        <li>1 - one</li>
        <li>2 - two</li>
        <li>3 - three</li>
        <li>4 - four</li>
        <li>5 - five</li>
        <li>6 - six</li>
        <li>7 - seven</li>
        <li>8 - eight</li>
        <li>9 - nine</li>
        <li>10 - ten</li>
        <li>11 - eleven</li>
        <li>12 - twelve</li>
        <li>13 - thirteen</li>
        <li>14 - fourteen</li>
        <li>15 - fifteen</li>
        <li>16 - sixteen</li>
        <li>17 - seventeen</li>
        <li>18 - eighteen</li>
        <li>19 - nineteen</li>
        <li>20 - twenty</li>
      </ul>
      
      <h3>Tens (20-100)</h3>
      <p>For numbers 20 and above, we use a pattern:</p>
      <ul>
        <li>20 - twenty</li>
        <li>30 - thirty</li>
        <li>40 - forty</li>
        <li>50 - fifty</li>
        <li>60 - sixty</li>
        <li>70 - seventy</li>
        <li>80 - eighty</li>
        <li>90 - ninety</li>
        <li>100 - one hundred</li>
      </ul>
      
      <h3>Combining Numbers</h3>
      <p>For numbers between the tens, we combine the ten with the digit:</p>
      <ul>
        <li>21 - twenty-one</li>
        <li>35 - thirty-five</li>
        <li>42 - forty-two</li>
        <li>78 - seventy-eight</li>
        <li>99 - ninety-nine</li>
      </ul>
      
      <h3>Using Numbers in Context</h3>
      <p>Here are some common ways to use numbers in everyday situations:</p>
      <ul>
        <li>"I have two brothers and one sister."</li>
        <li>"The temperature today is twenty-five degrees."</li>
        <li>"My phone number is five five five, one two three four."</li>
        <li>"The total cost is ninety-nine dollars and fifty cents."</li>
      </ul>
    `
  },
  {
    id: '3',
    title: 'Daily Routines',
    level: 'A2',
    description: 'Vocabulary and phrases for describing your daily activities.',
    imageUrl: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=500',
    duration: '45 minutes',
    content: `
      <h3>Morning Routine Vocabulary</h3>
      <p>Here are common verbs for morning activities:</p>
      <ul>
        <li><strong>Wake up</strong> - "I wake up at 6:30 AM."</li>
        <li><strong>Get up</strong> - "I get up from bed immediately."</li>
        <li><strong>Take a shower</strong> - "I take a shower every morning."</li>
        <li><strong>Brush teeth</strong> - "I brush my teeth twice a day."</li>
        <li><strong>Get dressed</strong> - "I get dressed after breakfast."</li>
        <li><strong>Have breakfast</strong> - "I have breakfast at 7:15 AM."</li>
        <li><strong>Leave home</strong> - "I leave home at 8:00 AM."</li>
      </ul>
      
      <h3>Work/School Routine</h3>
      <p>Vocabulary for daytime activities:</p>
      <ul>
        <li><strong>Start work/school</strong> - "I start work at 9:00 AM."</li>
        <li><strong>Have a meeting</strong> - "I have a meeting at 10:30 AM."</li>
        <li><strong>Take a break</strong> - "I take a break at noon."</li>
        <li><strong>Have lunch</strong> - "I have lunch around 1:00 PM."</li>
        <li><strong>Finish work/school</strong> - "I finish work at 5:00 PM."</li>
      </ul>
      
      <h3>Evening Routine</h3>
      <p>Common evening activities:</p>
      <ul>
        <li><strong>Get home</strong> - "I get home around 6:00 PM."</li>
        <li><strong>Make dinner</strong> - "I make dinner for my family."</li>
        <li><strong>Have dinner</strong> - "We have dinner at 7:00 PM."</li>
        <li><strong>Watch TV</strong> - "I watch TV for an hour."</li>
        <li><strong>Read a book</strong> - "I read a book before bed."</li>
        <li><strong>Go to bed</strong> - "I go to bed at 11:00 PM."</li>
      </ul>
      
      <h3>Adverbs of Frequency</h3>
      <p>We use these words to describe how often we do activities:</p>
      <ul>
        <li><strong>Always</strong> - 100% of the time</li>
        <li><strong>Usually</strong> - 80-90% of the time</li>
        <li><strong>Often</strong> - 70-80% of the time</li>
        <li><strong>Sometimes</strong> - 30-60% of the time</li>
        <li><strong>Rarely/Seldom</strong> - 10-20% of the time</li>
        <li><strong>Never</strong> - 0% of the time</li>
      </ul>
      <p>Example: "I <strong>always</strong> brush my teeth in the morning."</p>
    `
  },
  {
    id: '4',
    title: 'Food and Restaurants',
    level: 'B1',
    description: 'Learn how to order food and discuss dining preferences.',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500',
    duration: '40 minutes',
    content: `
      <h3>Types of Food</h3>
      <p>Common categories of food:</p>
      <ul>
        <li><strong>Fruits</strong>: apples, bananas, oranges, grapes, strawberries</li>
        <li><strong>Vegetables</strong>: carrots, broccoli, potatoes, tomatoes, onions</li>
        <li><strong>Meat</strong>: beef, chicken, pork, lamb, turkey</li>
        <li><strong>Seafood</strong>: fish, shrimp, crab, lobster, mussels</li>
        <li><strong>Dairy</strong>: milk, cheese, yogurt, butter, cream</li>
        <li><strong>Grains</strong>: rice, pasta, bread, cereal, oats</li>
      </ul>
      
      <h3>Restaurant Vocabulary</h3>
      <p>Useful words when dining out:</p>
      <ul>
        <li><strong>Menu</strong> - The list of available food and drinks</li>
        <li><strong>Appetizer/Starter</strong> - Small dish served before the main course</li>
        <li><strong>Main course/Entrée</strong> - The primary dish of a meal</li>
        <li><strong>Dessert</strong> - Sweet dish served after the main course</li>
        <li><strong>Bill/Check</strong> - The document showing how much you need to pay</li>
        <li><strong>Tip</strong> - Extra money given to the server for good service</li>
      </ul>
      
      <h3>Ordering Food</h3>
      <p>Useful phrases for ordering food:</p>
      <ul>
        <li>"I'd like to order..."</li>
        <li>"Could I have..."</li>
        <li>"I'll have..."</li>
        <li>"What do you recommend?"</li>
        <li>"Is this dish spicy/vegetarian?"</li>
        <li>"How is this dish prepared?"</li>
      </ul>
      
      <h3>Expressing Preferences</h3>
      <p>How to talk about food preferences:</p>
      <ul>
        <li>"I love/like/enjoy..."</li>
        <li>"I don't like/hate..."</li>
        <li>"I'm allergic to..."</li>
        <li>"I can't eat... because I'm vegetarian/vegan/on a diet."</li>
        <li>"I prefer... to..."</li>
      </ul>
      
      <h3>Sample Dialogue</h3>
      <p><strong>Server:</strong> Are you ready to order?<br>
      <strong>Customer:</strong> Yes, I'd like to start with the tomato soup.<br>
      <strong>Server:</strong> Good choice. And for your main course?<br>
      <strong>Customer:</strong> I'll have the grilled chicken with vegetables. Is it spicy?<br>
      <strong>Server:</strong> No, it's not spicy, but we can add some chili if you'd like.<br>
      <strong>Customer:</strong> No, that's perfect. And could I have a glass of water, please?<br>
      <strong>Server:</strong> Of course. I'll bring your order right away.</p>
    `
  },
  {
    id: '5',
    title: 'Travel and Directions',
    level: 'B1',
    description: 'Vocabulary for travel situations and asking for directions.',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=500',
    duration: '35 minutes',
    content: `
      <h3>Transportation Vocabulary</h3>
      <p>Common ways to travel:</p>
      <ul>
        <li><strong>Car</strong> - "I drive my car to work."</li>
        <li><strong>Bus</strong> - "I take the bus to the city centre."</li>
        <li><strong>Train</strong> - "The train is faster than the bus."</li>
        <li><strong>Subway/Underground</strong> - "The subway is a good way to avoid traffic."</li>
        <li><strong>Bicycle</strong> - "I ride my bicycle when the weather is nice."</li>
        <li><strong>Airplane/Plane</strong> - "We're flying to Paris next month."</li>
        <li><strong>Ship/Boat</strong> - "The cruise ship will visit several islands."</li>
      </ul>
      
      <h3>Places in a City</h3>
      <p>Important locations in a city:</p>
      <ul>
        <li><strong>Airport</strong> - Where planes arrive and depart</li>
        <li><strong>Train station</strong> - Where trains arrive and depart</li>
        <li><strong>Bus stop</strong> - Where buses pick up passengers</li>
        <li><strong>Hotel</strong> - Where travelers stay overnight</li>
        <li><strong>Restaurant</strong> - Where people eat meals</li>
        <li><strong>Museum</strong> - Where art or historical items are displayed</li>
        <li><strong>Park</strong> - An open green space for recreation</li>
        <li><strong>Shopping mall</strong> - A large building with many stores</li>
      </ul>
      
      <h3>Asking for Directions</h3>
      <p>Useful phrases for asking directions:</p>
      <ul>
        <li>"Excuse me, how do I get to...?"</li>
        <li>"Could you tell me the way to...?"</li>
        <li>"Where is the nearest...?"</li>
        <li>"Is it far from here?"</li>
        <li>"Can I walk there or should I take a bus?"</li>
      </ul>
      
      <h3>Giving Directions</h3>
      <p>Common phrases for giving directions:</p>
      <ul>
        <li>"Go straight ahead."</li>
        <li>"Turn left/right at the traffic light."</li>
        <li>"Take the first/second/third turning on the left/right."</li>
        <li>"It's next to/opposite/between/behind..."</li>
        <li>"It's about a five-minute walk from here."</li>
        <li>"You can't miss it."</li>
      </ul>
      
      <h3>Sample Dialogue</h3>
      <p><strong>Tourist:</strong> Excuse me, could you tell me how to get to the National Museum?<br>
      <strong>Local:</strong> Sure. Go straight ahead for two blocks, then turn left at the traffic light.<br>
      <strong>Tourist:</strong> Turn left at the traffic light, okay.<br>
      <strong>Local:</strong> Yes, and then the museum will be on your right, opposite the park.<br>
      <strong>Tourist:</strong> Is it far from here?<br>
      <strong>Local:</strong> Not really, it's about a 10-minute walk.<br>
      <strong>Tourist:</strong> Great, thank you very much!<br>
      <strong>Local:</strong> You're welcome. Enjoy your visit!</p>
    `
  }
];

async function seedLessons() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('Connected to Firestore, beginning to seed lessons...');
    
    // Add each lesson to the 'lessons' collection
    for (const lesson of lessons) {
      await setDoc(doc(db, 'lessons', lesson.id), lesson);
      console.log(`Added lesson: ${lesson.title}`);
    }
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding lessons:', error);
    process.exit(1);
  }
}

// Run the seed function
seedLessons();