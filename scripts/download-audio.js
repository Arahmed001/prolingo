const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const AUDIO_MANIFEST = {
  ui: {
    click: 'https://assets.mixkit.co/sfx/preview/mixkit-interface-click-1126.mp3',
    success: 'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3',
    error: 'https://assets.mixkit.co/sfx/preview/mixkit-alert-error-988.mp3',
    hover: 'https://assets.mixkit.co/sfx/preview/mixkit-interface-hint-2271.mp3',
    notification: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-remove-2576.mp3'
  },
  ambient: {
    background: 'https://assets.mixkit.co/sfx/preview/mixkit-ethereal-meditation-115.mp3',
    nature: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-stream-ambience-2523.mp3',
    meditation: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-599.mp3'
  },
  effects: {
    complete: 'https://assets.mixkit.co/sfx/preview/mixkit-completion-of-a-level-2063.mp3',
    achievement: 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3',
    correct: 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3',
    incorrect: 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3',
    celebration: 'https://assets.mixkit.co/sfx/preview/mixkit-animated-small-group-applause-523.mp3'
  },
  voice: {
    welcome: 'https://assets.mixkit.co/sfx/preview/mixkit-male-voice-welcome-2364.mp3',
    instructions: 'https://assets.mixkit.co/sfx/preview/mixkit-female-voice-instructions-2860.mp3',
    encouragement: 'https://assets.mixkit.co/sfx/preview/mixkit-male-voice-good-job-2170.mp3'
  }
};

async function downloadFile(url, filepath) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://mixkit.co/'
      }
    });

    await fs.writeFile(filepath, response.data);
    console.log(`Downloaded: ${filepath}`);
  } catch (error) {
    console.error(`Error downloading ${filepath}:`, error.message);
    // Create a placeholder file with a note about the error
    await fs.writeFile(filepath, Buffer.from('Error: Could not download audio file'));
  }
}

async function downloadAllAudio() {
  for (const [category, sounds] of Object.entries(AUDIO_MANIFEST)) {
    const categoryPath = path.join(__dirname, '..', 'public', 'audio', category);
    
    // Ensure directory exists
    await fs.mkdir(categoryPath, { recursive: true });

    // Download each sound in category
    for (const [name, url] of Object.entries(sounds)) {
      const filepath = path.join(categoryPath, `${name}.mp3`);
      await downloadFile(url, filepath);
    }
  }
}

downloadAllAudio().catch(console.error); 