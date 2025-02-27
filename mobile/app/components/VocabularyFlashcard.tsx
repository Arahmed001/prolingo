import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import { ReviewItem, calculateNextReview } from '../../lib/utils/spacedRepetition';

interface Word {
  id: string;
  term: string;
  definition: string;
  example: string;
  pronunciation: string;
  reviewData: ReviewItem;
}

interface Props {
  word: Word;
  onResult: (wordId: string, remembered: boolean, quality: number) => void;
}

export default function VocabularyFlashcard({ word, onResult }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [confidence, setConfidence] = useState<number>(0);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handleConfidenceSelect = (level: number) => {
    setConfidence(level);
  };

  const handleResult = (remembered: boolean) => {
    onResult(word.id, remembered, confidence);
    setConfidence(0);
    setIsFlipped(false);
    flipAnim.setValue(0);
  };

  const speakWord = () => {
    Speech.speak(word.term, {
      language: 'en',
      pitch: 1,
      rate: 0.75,
    });
  };

  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 180],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 180],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  };

  const renderConfidenceButtons = () => (
    <View style={styles.confidenceContainer}>
      <Text style={styles.confidenceLabel}>How well did you know this?</Text>
      <View style={styles.confidenceButtons}>
        {[1, 2, 3, 4, 5].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.confidenceButton,
              confidence === level && styles.confidenceButtonSelected,
            ]}
            onPress={() => handleConfidenceSelect(level)}
          >
            <Text style={styles.confidenceButtonText}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
        <TouchableOpacity style={styles.cardContent} onPress={flipCard}>
          <Text style={styles.term}>{word.term}</Text>
          <Text style={styles.pronunciation}>{word.pronunciation}</Text>
          <TouchableOpacity style={styles.speakButton} onPress={speakWord}>
            <Text style={styles.speakButtonText}>🔊</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
        <View style={styles.cardContent}>
          <Text style={styles.definition}>{word.definition}</Text>
          <Text style={styles.example}>{word.example}</Text>
          {renderConfidenceButtons()}
          <View style={styles.resultButtons}>
            <TouchableOpacity
              style={[styles.resultButton, styles.againButton]}
              onPress={() => handleResult(false)}
              disabled={confidence === 0}
            >
              <Text style={styles.resultButtonText}>Need Review</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.resultButton, styles.goodButton]}
              onPress={() => handleResult(true)}
              disabled={confidence === 0}
            >
              <Text style={styles.resultButtonText}>Got It!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '90%',
    height: '100%',
    position: 'absolute',
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    zIndex: 2,
  },
  cardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  cardContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  term: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  pronunciation: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  definition: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  example: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  speakButton: {
    padding: 10,
  },
  speakButtonText: {
    fontSize: 24,
  },
  confidenceContainer: {
    width: '100%',
    marginBottom: 20,
  },
  confidenceLabel: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  confidenceButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  confidenceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidenceButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  confidenceButtonText: {
    fontSize: 16,
  },
  resultButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  resultButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  againButton: {
    backgroundColor: '#FF3B30',
  },
  goodButton: {
    backgroundColor: '#34C759',
  },
  resultButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 