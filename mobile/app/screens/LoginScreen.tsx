import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase/init';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          streak: 0,
          xp: 0,
          lastLoginDate: new Date().toISOString(),
          level: 'A1',
          createdAt: new Date().toISOString(),
        });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F4F6', padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#3B82F6', marginBottom: 32, textAlign: 'center' }}>
        ProLingo
      </Text>

      <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
          }}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={{
            backgroundColor: '#3B82F6',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
          }}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              {isSignUp ? 'Sign Up' : 'Login'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={{ color: '#4B5563', textAlign: 'center' }}>
          {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
} 