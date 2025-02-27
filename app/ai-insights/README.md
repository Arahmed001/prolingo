# ProLingo AI Insights Dashboard

The AI Insights Dashboard provides administrators with analytical data and predictive insights about user learning patterns in the ProLingo platform.

## Features

### 1. Daily Lesson Completions Chart
- Line chart visualization showing lesson completions over the last 30 days
- Helps identify usage trends and patterns over time
- Data is fetched from the Firebase 'progress' collection

### 2. Peak Learning Hours Distribution
- Scatter plot visualization showing when users are most active throughout the week
- Helps identify optimal times for sending notifications or scheduling new content releases
- Visualizes data across days of the week and hours of the day

### 3. Predictive Insights
- AI-generated predictions based on user data, including:
  - Estimated time to reach proficiency levels
  - Average quiz scores across all users
  - Daily lesson completion rates
  - Peak learning hours
  - Effect of practice frequency on learning speed

### 4. Learning Recommendations
- AI-generated recommendations for platform improvements, including:
  - Optimal study time suggestions
  - Spaced repetition implementation
  - Focus areas for struggling users
  - Engagement strategy recommendations

### 5. User Statistics
- At-a-glance metrics including:
  - Total users count
  - Active users in the last 7 days
  - Average completion rate
  - Average quiz scores

## Implementation Details

### Tech Stack
- **Next.js App Router**: For page rendering and routing
- **Chart.js**: For data visualizations
- **Firebase Auth**: For admin authentication
- **Firestore**: For data retrieval from 'users' and 'progress' collections
- **Tailwind CSS**: For styling and responsive design

### Authentication & Authorization
- Access restricted to users with 'admin' role
- Redirects to login page if user is not authenticated or is not an admin
- Role verification happens on page load using Firebase Authentication

### Data Processing
- Retrieves user data and progress records from Firebase
- Processes timestamp data to generate daily completion counts
- Analyses hourly activity patterns
- Generates realistic predictions based on actual user performance

### Sample Data Generation
- Automatically adds sample data if no progress records exist
- Creates realistic user progress patterns for demonstration purposes
- Simulates different user behaviours across different times of day and week

## Firebase Structure

### Collections Used
- **users**: Contains user information including role designation
- **progress**: Contains lesson completion records with timestamps

### Sample Progress Record
```json
{
  "userId": "user123",
  "lessonId": "lesson-2",
  "score": 85,
  "completed": true,
  "timestamp": Timestamp
}
```

## Future Enhancements

1. **User Cohort Analysis**: Compare learning patterns between different user groups
2. **Content Effectiveness**: Analyse which lessons are most effective for progress
3. **Retention Predictions**: Forecast user retention based on engagement patterns
4. **Custom Date Ranges**: Allow administrators to select specific time periods for analysis
5. **Export Functionality**: Enable downloading reports as CSV or PDF
6. **Real-time Updates**: Implement real-time data sync for live dashboard updates

## Testing

1. Run the development server with `npm run dev`
2. Navigate to `/ai-insights`
3. Log in with an admin account
4. Verify all visualizations are loading correctly
5. Check that admin-only access is enforced

## Notes

- The dashboard uses `force-dynamic` export to ensure fresh data on each page load
- Chart.js is registered with all components for maximum flexibility
- The heatmap is implemented as a scatter plot with custom styling to simulate a heat map effect 