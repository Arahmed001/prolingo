import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Lessons: undefined;
  Quiz: { id: string };
  Profile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 p-4">
        <Text className="text-3xl font-bold text-blue-600 mb-8">Welcome to ProLingo</Text>
        
        <View className="space-y-4">
          <TouchableOpacity
            onPress={() => navigation.navigate('Lessons')}
            className="bg-blue-500 p-4 rounded-lg"
          >
            <Text className="text-white text-lg font-semibold text-center">Start Learning</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            className="bg-green-500 p-4 rounded-lg"
          >
            <Text className="text-white text-lg font-semibold text-center">My Profile</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-8">
          <Text className="text-gray-600 text-center">
            Learn a new language with our interactive lessons and quizzes
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
} 