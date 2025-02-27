import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

interface LessonContentProps {
  content: {
    sections: Array<{
      type: 'text' | 'image' | 'audio' | 'practice';
      content: string;
      title?: string;
      description?: string;
    }>;
  };
  onPracticePress: () => void;
}

export default function LessonContent({ content, onPracticePress }: LessonContentProps) {
  const playAudio = async (audioUrl: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const renderSection = (section: any, index: number) => {
    switch (section.type) {
      case 'text':
        return (
          <View key={index} style={{ marginBottom: 20 }}>
            {section.title && (
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
                {section.title}
              </Text>
            )}
            <Text style={{ fontSize: 16, color: '#4B5563', lineHeight: 24 }}>
              {section.content}
            </Text>
          </View>
        );

      case 'image':
        return (
          <View key={index} style={{ marginBottom: 20 }}>
            <Image
              source={{ uri: section.content }}
              style={{ width: '100%', height: 200, borderRadius: 8 }}
              resizeMode="cover"
            />
            {section.description && (
              <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8 }}>
                {section.description}
              </Text>
            )}
          </View>
        );

      case 'audio':
        return (
          <TouchableOpacity
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#EBF5FF',
              padding: 12,
              borderRadius: 8,
              marginBottom: 20,
            }}
            onPress={() => playAudio(section.content)}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#3B82F6',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}>
              {/* Play icon */}
              <Text style={{ color: '#fff', fontSize: 20 }}>▶</Text>
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
                Listen
              </Text>
              {section.description && (
                <Text style={{ fontSize: 14, color: '#6B7280' }}>
                  {section.description}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );

      case 'practice':
        return (
          <TouchableOpacity
            key={index}
            style={{
              backgroundColor: '#059669',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 20,
            }}
            onPress={onPracticePress}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              Practice this section
            </Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16 }}>
        {content.sections.map((section, index) => renderSection(section, index))}
      </View>
    </ScrollView>
  );
} 