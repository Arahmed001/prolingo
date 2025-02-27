import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../lib/firebase/init';
import { updateUserStreak } from '../../lib/utils/streakUtils';

type RootStackParamList = {
  Home: undefined;
  Lessons: undefined;
  Quiz: { id: string };
  Profile: undefined;
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

interface UserProfile {
  email: string;
  streak: number;
  xp: number;
  lastLoginDate: string;
  level: string;
}

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const XP_PER_LEVEL = 1000;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      navigation.navigate('Login');
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userRef = doc(db, 'users', auth.currentUser!.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        // Update streak on profile view
        await updateUserStreak(auth.currentUser!.uid, userData.lastLoginDate);
        // Fetch updated profile
        const updatedDoc = await getDoc(userRef);
        setProfile(updatedDoc.data() as UserProfile);
      } else {
        // Create default profile if it doesn't exist
        const defaultProfile: UserProfile = {
          email: auth.currentUser!.email || '',
          streak: 0,
          xp: 0,
          lastLoginDate: new Date().toISOString(),
          level: 'A1',
        };
        await setDoc(userRef, defaultProfile);
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLevel = (xp: number) => {
    const levelIndex = Math.min(Math.floor(xp / XP_PER_LEVEL), LEVELS.length - 1);
    return LEVELS[levelIndex];
  };

  const calculateProgress = (xp: number) => {
    const currentLevelXP = xp % XP_PER_LEVEL;
    return (currentLevelXP / XP_PER_LEVEL) * 100;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F4F6', padding: 16 }}>
      {/* Profile Header */}
      <View style={{ 
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center'
      }}>
        <View style={{
          width: 80,
          height: 80,
          backgroundColor: '#E5E7EB',
          borderRadius: 40,
          marginBottom: 12,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 24, color: '#6B7280' }}>
            {profile?.email?.[0]?.toUpperCase()}
          </Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>
          {profile?.email}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        {/* XP Card */}
        <View style={{
          flex: 1,
          backgroundColor: '#fff',
          padding: 16,
          borderRadius: 12,
          marginRight: 8,
        }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#3B82F6' }}>
            {profile?.xp || 0}
          </Text>
          <Text style={{ color: '#6B7280' }}>XP Points</Text>
          {/* XP Progress Bar */}
          <View style={{
            height: 4,
            backgroundColor: '#E5E7EB',
            borderRadius: 2,
            marginTop: 8,
          }}>
            <View style={{
              width: `${calculateProgress(profile?.xp || 0)}%`,
              height: '100%',
              backgroundColor: '#3B82F6',
              borderRadius: 2,
            }} />
          </View>
        </View>

        {/* Streak Card */}
        <View style={{
          flex: 1,
          backgroundColor: '#fff',
          padding: 16,
          borderRadius: 12,
          marginLeft: 8,
        }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#EF4444' }}>
            {profile?.streak || 0}
          </Text>
          <Text style={{ color: '#6B7280' }}>Day Streak</Text>
        </View>
      </View>

      {/* Level Card */}
      <View style={{
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
      }}>
        <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 4 }}>
          Current Level
        </Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#059669' }}>
          {calculateLevel(profile?.xp || 0)}
        </Text>
        <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }}>
          {XP_PER_LEVEL - ((profile?.xp || 0) % XP_PER_LEVEL)} XP to next level
        </Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={{
          backgroundColor: '#EF4444',
          padding: 16,
          borderRadius: 12,
          alignItems: 'center',
        }}
        onPress={handleLogout}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
} 