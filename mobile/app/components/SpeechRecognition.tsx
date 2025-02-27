import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Speech from 'expo-speech';

interface SpeechRecognitionProps {
  targetPhrase: string;
  onResult: (success: boolean, accuracy: number) => void;
}

export default function SpeechRecognition({ targetPhrase, onResult }: SpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Clean up speech recognition when component unmounts
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening]);

  const startListening = async () => {
    try {
      setIsListening(true);
      setTranscript('');
      // In a real implementation, you would use a proper speech recognition API
      // For now, we'll simulate it with a timeout
      setTimeout(() => {
        const simulatedTranscript = targetPhrase; // In reality, this would be the actual speech recognition result
        setTranscript(simulatedTranscript);
        checkAccuracy(simulatedTranscript);
        setIsListening(false);
      }, 2000);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const playTargetPhrase = async () => {
    try {
      setIsPlaying(true);
      await Speech.speak(targetPhrase, {
        language: 'en',
        onDone: () => setIsPlaying(false),
      });
    } catch (error) {
      console.error('Error playing speech:', error);
      setIsPlaying(false);
    }
  };

  const checkAccuracy = (recognizedText: string) => {
    // Simple string similarity check (you might want to use a more sophisticated algorithm)
    const similarity = calculateStringSimilarity(recognizedText.toLowerCase(), targetPhrase.toLowerCase());
    const success = similarity >= 0.8; // 80% accuracy threshold
    onResult(success, similarity * 100);
  };

  const calculateStringSimilarity = (str1: string, str2: string) => {
    // Levenshtein distance implementation
    const track = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }

    const distance = track[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - distance / maxLength;
  };

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
        Speaking Practice
      </Text>

      <View style={{ 
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16
      }}>
        <Text style={{ fontSize: 16, color: '#4B5563' }}>
          {targetPhrase}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: '#EBF5FF',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginRight: 8,
          }}
          onPress={playTargetPhrase}
          disabled={isPlaying}
        >
          {isPlaying ? (
            <ActivityIndicator color="#3B82F6" />
          ) : (
            <Text style={{ color: '#3B82F6', fontSize: 16, fontWeight: '600' }}>
              Listen
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: isListening ? '#FEE2E2' : '#3B82F6',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginLeft: 8,
          }}
          onPress={isListening ? stopListening : startListening}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            {isListening ? 'Stop' : 'Start Speaking'}
          </Text>
        </TouchableOpacity>
      </View>

      {transcript && (
        <View style={{ 
          backgroundColor: '#F3F4F6',
          padding: 12,
          borderRadius: 8
        }}>
          <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
            Your speech:
          </Text>
          <Text style={{ fontSize: 16, color: '#1F2937' }}>
            {transcript}
          </Text>
        </View>
      )}
    </View>
  );
} 