import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase/init';

type RootStackParamList = {
  Home: undefined;
  Lessons: undefined;
  Quiz: { id: string };
  Profile: undefined;
};

type QuizScreenRouteProp = RouteProp<RootStackParamList, 'Quiz'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Quiz'>;

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

export default function QuizScreen() {
  const route = useRoute<QuizScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    fetchQuizQuestions();
  }, []);

  const fetchQuizQuestions = async () => {
    try {
      const quizRef = doc(db, 'quizzes', route.params.id);
      const quizDoc = await getDoc(quizRef);
      
      if (quizDoc.exists()) {
        setQuestions(quizDoc.data().questions || []);
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz completed
      const finalScore = ((score + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0)) / questions.length) * 100;
      setQuizCompleted(true);

      // Update user's XP in Firebase
      if (auth.currentUser) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userRef, {
            xp: increment(10), // Add 10 XP for completing the quiz
          });
        } catch (error) {
          console.error('Error updating XP:', error);
        }
      }
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (quizCompleted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
          Quiz Completed!
        </Text>
        <Text style={{ fontSize: 18, marginBottom: 24 }}>
          Your score: {Math.round((score / questions.length) * 100)}%
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#3B82F6',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
          onPress={() => navigation.navigate('Lessons')}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            Back to Lessons
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, marginBottom: 8, color: '#6B7280' }}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
        
        <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 24, color: '#1F2937' }}>
          {currentQuestion.text}
        </Text>

        <View style={{ marginBottom: 24 }}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: selectedAnswer === option ? '#93C5FD' : '#fff',
                padding: 16,
                borderRadius: 8,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: selectedAnswer === option ? '#3B82F6' : '#E5E7EB',
              }}
              onPress={() => handleAnswerSelect(option)}
            >
              <Text style={{
                color: selectedAnswer === option ? '#1E3A8A' : '#1F2937',
                fontSize: 16,
              }}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: selectedAnswer ? '#3B82F6' : '#9CA3AF',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
          }}
          onPress={handleNextQuestion}
          disabled={!selectedAnswer}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 