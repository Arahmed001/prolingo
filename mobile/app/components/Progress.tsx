import React from 'react';
import { View, Text } from 'react-native';

interface ProgressProps {
  stats: {
    lessonsCompleted: number;
    totalLessons: number;
    weeklyProgress: number[];
    topicMastery: {
      [key: string]: number;
    };
  };
}

export default function Progress({ stats }: ProgressProps) {
  const calculateOverallProgress = () => {
    return Math.round((stats.lessonsCompleted / stats.totalLessons) * 100);
  };

  const getWeeklyAverage = () => {
    const sum = stats.weeklyProgress.reduce((a, b) => a + b, 0);
    return Math.round(sum / stats.weeklyProgress.length);
  };

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
      {/* Overall Progress */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
          Overall Progress
        </Text>
        <View style={{ height: 8, backgroundColor: '#E5E7EB', borderRadius: 4 }}>
          <View
            style={{
              height: '100%',
              width: `${calculateOverallProgress()}%`,
              backgroundColor: '#3B82F6',
              borderRadius: 4,
            }}
          />
        </View>
        <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
          {stats.lessonsCompleted} of {stats.totalLessons} lessons completed
        </Text>
      </View>

      {/* Weekly Activity */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
          Weekly Activity
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 100 }}>
          {stats.weeklyProgress.map((value, index) => (
            <View key={index} style={{ alignItems: 'center', flex: 1 }}>
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <View
                  style={{
                    width: 20,
                    height: `${value}%`,
                    backgroundColor: '#3B82F6',
                    borderRadius: 2,
                  }}
                />
              </View>
              <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
              </Text>
            </View>
          ))}
        </View>
        <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8 }}>
          Weekly average: {getWeeklyAverage()}% activity
        </Text>
      </View>

      {/* Topic Mastery */}
      <View>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
          Topic Mastery
        </Text>
        {Object.entries(stats.topicMastery).map(([topic, mastery], index) => (
          <View key={index} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 14, color: '#4B5563' }}>{topic}</Text>
              <Text style={{ fontSize: 14, color: '#4B5563' }}>{mastery}%</Text>
            </View>
            <View style={{ height: 4, backgroundColor: '#E5E7EB', borderRadius: 2 }}>
              <View
                style={{
                  height: '100%',
                  width: `${mastery}%`,
                  backgroundColor: mastery >= 80 ? '#059669' : mastery >= 50 ? '#FBBF24' : '#EF4444',
                  borderRadius: 2,
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
} 