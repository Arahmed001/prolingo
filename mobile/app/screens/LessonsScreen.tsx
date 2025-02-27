import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, SectionList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase/init';
import { getRecommendedLessons } from '../../lib/utils/lessonRecommender';

type RootStackParamList = {
  Home: undefined;
  Lessons: undefined;
  Quiz: { id: string };
  Profile: undefined;
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Lessons'>;

interface Lesson {
  id: string;
  title: string;
  description: string;
  level: string;
  difficulty: number;
  topics: string[];
}

interface UserProgress {
  completedLessons: string[];
  level: string;
  xp: number;
  strengths: string[];
  weaknesses: string[];
}

interface Section {
  title: string;
  data: Lesson[];
}

export default function LessonsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      navigation.navigate('Login');
      return;
    }
    fetchUserProgressAndLessons();
  }, []);

  const fetchUserProgressAndLessons = async () => {
    try {
      // Fetch user progress
      const userRef = doc(db, 'users', auth.currentUser!.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        navigation.navigate('Login');
        return;
      }

      const progress = userDoc.data() as UserProgress;
      setUserProgress(progress);

      // Get recommended lessons
      const recommendedLessons = await getRecommendedLessons(progress);

      // Fetch all available lessons
      const lessonsRef = collection(db, 'lessons');
      const q = query(lessonsRef, where('published', '==', true));
      const querySnapshot = await getDocs(q);
      
      const allLessons: Lesson[] = [];
      querySnapshot.forEach((doc) => {
        allLessons.push({
          id: doc.id,
          ...doc.data() as Omit<Lesson, 'id'>
        });
      });

      // Organise lessons into sections
      const recommended: Section = {
        title: 'Recommended for You',
        data: recommendedLessons
      };

      const inProgress: Section = {
        title: 'In Progress',
        data: allLessons.filter(lesson => 
          !progress.completedLessons.includes(lesson.id) &&
          lesson.level === progress.level
        )
      };

      const completed: Section = {
        title: 'Completed',
        data: allLessons.filter(lesson => 
          progress.completedLessons.includes(lesson.id)
        )
      };

      setSections([recommended, inProgress, completed]);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Lesson }) => {
    const isCompleted = userProgress?.completedLessons.includes(item.id);

    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#fff',
          padding: 16,
          marginBottom: 8,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: isCompleted ? '#059669' : '#3B82F6'
        }}
        onPress={() => navigation.navigate('Quiz', { id: item.id })}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>
              {item.title}
            </Text>
            <Text style={{ color: '#4B5563', marginTop: 4 }}>
              {item.description}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' }}>
              <Text style={{ 
                backgroundColor: '#EBF5FF',
                color: '#2563EB',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 4,
                fontSize: 12,
                marginRight: 8,
              }}>
                Level: {item.level}
              </Text>
              {item.topics.map((topic, index) => (
                <Text key={index} style={{
                  backgroundColor: '#F3F4F6',
                  color: '#4B5563',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4,
                  fontSize: 12,
                  marginRight: 8,
                  marginTop: 4,
                }}>
                  {topic}
                </Text>
              ))}
            </View>
          </View>
          {isCompleted && (
            <View style={{
              backgroundColor: '#059669',
              padding: 8,
              borderRadius: 20,
              marginLeft: 12,
            }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={{ 
      backgroundColor: '#F3F4F6',
      padding: 16,
      marginBottom: 8,
    }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937' }}>
        {section.title}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
} 