# ProLingo Teacher Dashboard

This directory contains the Teacher Dashboard for the ProLingo application, which provides advanced teaching tools for language instructors.

## Features

1. **AI-Assisted Lesson Planning**
   - Select a lesson from a dropdown menu populated with available lessons
   - Generate a comprehensive lesson plan with a single click
   - Plans include duration, activities, and learning objectives
   - All plans are saved to Firebase for future reference

2. **Automated Student Performance Analysis**
   - View a table of students' quiz scores from all lessons
   - Color-coded scores (green for excellent, yellow for satisfactory, red for needs improvement)
   - AI-generated insights for students scoring below 70%
   - Personalised recommendations based on performance patterns

3. **Teacher-Only Access**
   - Dashboard is restricted to users with the "teacher" role in Firebase
   - Unauthorized users are redirected to the login page
   - Authenticated with Firebase Authentication

## Implementation Details

- Built with Next.js App Router architecture
- UI styled with Tailwind CSS using responsive grid layout
- Authentication through Firebase Auth with role-based access control
- Real-time data from Firestore collections

## Firebase Structure

The teacher dashboard interacts with these Firestore collections:

```
lesson-plans: {
  lessonId: string,
  lessonTitle: string,
  plan: string,
  teacherId: string,
  timestamp: ServerTimestamp
}

progress: {
  userId: string,
  lessonId: string,
  score: number,
  completed: boolean,
  timestamp: ServerTimestamp
}

users: {
  uid: string,
  role: string,
  displayName: string,
  email: string
}

lessons: {
  id: string,
  title: string,
  level: string,
  difficulty: string,
  ...other lesson data
}
```

## Setting Up Sample Data

Sample teacher data can be added to Firebase using:

```bash
# To run the main setup script which includes teacher data
node setup-prolingo.js

# Or to run just the teacher-specific setup
node scripts/setup-teacher-data.js
```

This will populate the collections with:
- Sample lesson plans for existing lessons
- Student progress data with various scores
- Default student user IDs if no students exist in the system

## Testing

To test the Teacher Dashboard:

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/teacher/dashboard`

3. Log in with a user that has the "teacher" role (will be redirected to login page if not authenticated or not a teacher)

4. Test the following functionality:
   - Select a lesson and generate a lesson plan
   - Review the generated plan in the "Recent Lesson Plans" section
   - View student performance in the table
   - Check AI insights for struggling students (scores below 70%)

## Future Enhancements

- Add ability to customize generated lesson plans
- Implement more sophisticated AI analysis of student performance
- Add feature to assign specific lessons to individual students
- Include progress tracking visualizations with charts
- Add export functionality for lesson plans and student data 