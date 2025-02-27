/**
 * Custom A-Frame components for the enhanced VR language learning environment
 */
import AFRAME, { THREE } from 'aframe';

// Define interfaces for the components
interface ParticleSystemComponent {
  data: any;
  schema: any;
  particles: any[];
  particleContainer: any;
  init(): void;
  update(): void;
  createParticles(): void;
  startParticles(): void;
}

interface SpatialSoundComponent {
  data: any;
  el: any;
  schema: any;
  sound: HTMLAudioElement;
  audioContext?: AudioContext;
  audioSource?: MediaElementAudioSourceNode;
  panner?: PannerNode;
  init(): void;
  playSound(): void;
  tick(): void;
  remove(): void;
}

interface InteractiveObjectComponent {
  data: any;
  el: any;
  schema: any;
  grabbed: boolean;
  grabOffset: THREE.Vector3;
  init(): void;
  onGrabStart(evt: any): void;
  onGrabEnd(): void;
  tick(time: number, timeDelta: number): void;
}

interface TTSComponent {
  el: any;
  data: any;
  schema: any;
  init(): void;
  speak(): void;
}

interface GestureDetectorComponent {
  el: any;
  data: any;
  schema: any;
  touchStarted: boolean;
  pinchStarted: boolean;
  touchPoints: {x: number, y: number}[];
  initialTouchDistance: number;
  init(): void;
  onTouchStart(evt: TouchEvent): void;
  onTouchMove(evt: TouchEvent): void;
  onTouchEnd(evt: TouchEvent): void;
}

interface NetworkAvatarComponent {
  data: any;
  el: any;
  schema: any;
  init(): void;
  createAvatarBody(): void;
  update(oldData: any): void;
}

interface ProgressPlantComponent {
  el: any;
  data: any;
  schema: any;
  stem: any;
  leaves: any[];
  fruit: any;
  init(): void;
  createPlant(): void;
  update(): void;
  updatePlantGrowth(): void;
}

// Only register components if AFRAME is available (client-side)
if (typeof AFRAME !== 'undefined') {
  // Particle system for celebration effects
  AFRAME.registerComponent('particle-system', {
    schema: {
      color: { type: 'color', default: '#FFF' },
      duration: { type: 'number', default: 1 },
      particleCount: { type: 'number', default: 100 },
      size: { type: 'number', default: 0.1 },
      velocity: { type: 'number', default: 0.2 },
      active: { type: 'boolean', default: false }
    },
    init: function(this: ParticleSystemComponent & { data: any, el: any }) {
      const data = this.data;
      const el = this.el;
      
      this.particles = [];
      this.particleContainer = document.createElement('a-entity');
      el.appendChild(this.particleContainer);
      
      // Create initial particles (hidden)
      this.createParticles();
    },
    
    update: function(this: ParticleSystemComponent) {
      if (this.data.active) {
        this.startParticles();
      }
    },
    
    createParticles: function(this: ParticleSystemComponent) {
      const data = this.data;
      
      // Clear existing particles
      while (this.particleContainer.firstChild) {
        this.particleContainer.removeChild(this.particleContainer.firstChild);
      }
      
      // Create new particles
      for (let i = 0; i < data.particleCount; i++) {
        const particle = document.createElement('a-sphere');
        particle.setAttribute('radius', data.size);
        particle.setAttribute('color', data.color);
        particle.setAttribute('visible', 'false');
        
        this.particleContainer.appendChild(particle);
        this.particles.push(particle);
      }
    },
    
    startParticles: function(this: ParticleSystemComponent) {
      const data = this.data;
      const particles = this.particles;
      
      particles.forEach(particle => {
        // Random position offset
        const x = (Math.random() - 0.5) * data.velocity;
        const y = Math.random() * data.velocity;
        const z = (Math.random() - 0.5) * data.velocity;
        
        // Reset particle
        particle.setAttribute('position', '0 0 0');
        particle.setAttribute('visible', 'true');
        
        // Animate particle
        particle.setAttribute('animation', {
          property: 'position',
          to: `${x} ${y} ${z}`,
          dur: data.duration * 1000,
          easing: 'easeOutQuad'
        });
        
        // Fade out
        particle.setAttribute('animation__fade', {
          property: 'material.opacity',
          from: '1',
          to: '0',
          dur: data.duration * 1000,
          easing: 'easeOutQuad'
        });
      });
      
      // Reset after duration
      setTimeout(() => {
        particles.forEach(particle => {
          particle.setAttribute('visible', 'false');
          particle.removeAttribute('animation');
          particle.removeAttribute('animation__fade');
        });
        this.data.active = false;
      }, data.duration * 1000);
    }
  } as unknown as ParticleSystemComponent);

  // Spatial audio component
  AFRAME.registerComponent('spatial-sound', {
    schema: {
      src: { type: 'string' },
      loop: { type: 'boolean', default: false },
      volume: { type: 'number', default: 1 },
      autoplay: { type: 'boolean', default: false },
      maxDistance: { type: 'number', default: 10 },
      refDistance: { type: 'number', default: 1 },
      rolloffFactor: { type: 'number', default: 1 }
    },
    
    init: function(this: SpatialSoundComponent) {
      const data = this.data;
      const el = this.el;
      
      // Create audio element
      this.sound = new Audio();
      this.sound.src = data.src;
      this.sound.loop = data.loop;
      this.sound.volume = data.volume;
      // Create spatial audio context if supported
      if (window.AudioContext) {
        this.audioContext = new AudioContext();
        this.audioSource = this.audioContext.createMediaElementSource(this.sound);
        this.panner = this.audioContext.createPanner();
        // Configure panner
        this.panner.panningModel = 'HRTF';
        this.panner.distanceModel = 'inverse';
        this.panner.refDistance = data.refDistance;
        this.panner.maxDistance = data.maxDistance;
        this.panner.rolloffFactor = data.rolloffFactor;
        
        // Connect nodes
        this.audioSource.connect(this.panner);
        this.panner.connect(this.audioContext.destination);
      }
      
      // Autoplay if specified
      if (data.autoplay) {
        this.playSound();
      }
      
      // Setup event listener for playing sound
      el.addEventListener('click', () => this.playSound());
    },
    
    playSound: function(this: SpatialSoundComponent) {
      // Resume audio context if suspended
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      // Play sound
      if (this.sound.paused) {
        this.sound.play().catch(e => console.error('Error playing sound:', e));
      }
    },
    
    tick: function(this: SpatialSoundComponent) {
      // Update panner position based on entity position
      if (this.panner) {
        const worldPos = new THREE.Vector3();
        this.el.object3D.getWorldPosition(worldPos);
        this.panner.setPosition(worldPos.x, worldPos.y, worldPos.z);
      }
    },
    
    remove: function(this: SpatialSoundComponent) {
      if (this.sound) {
        this.sound.pause();
        this.sound.src = '';
      }
      
      if (this.audioContext && this.audioSource && this.panner) {
        this.audioSource.disconnect();
        this.panner.disconnect();
      }
    }
  } as unknown as SpatialSoundComponent);

  // Interactive object component with physics-based interactions
  AFRAME.registerComponent('interactive-object', {
    schema: {
      grabable: { type: 'boolean', default: true },
      throwable: { type: 'boolean', default: true },
      returnDelay: { type: 'number', default: 3000 },
      originalPosition: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
      hapticFeedback: { type: 'boolean', default: true },
      feedbackIntensity: { type: 'number', default: 0.5 }
    },
    
    init: function(this: InteractiveObjectComponent) {
      const data = this.data;
      const el = this.el;
      
      // Store original position
      const position = el.getAttribute('position');
      this.data.originalPosition = { x: position.x, y: position.y, z: position.z };
      
      // States
      this.grabbed = false;
      this.grabOffset = new THREE.Vector3();
      
      // Setup event listeners
      el.addEventListener('mousedown', this.onGrabStart.bind(this));
      el.addEventListener('mouseup', this.onGrabEnd.bind(this));
      
      // Add class for raycaster
      el.classList.add('interactive');
    },
    
    onGrabStart: function(this: InteractiveObjectComponent, evt: any) {
      if (!this.data.grabable) return;
      
      this.grabbed = true;
      const intersectionPoint = evt.detail.intersection.point;
      const objectPosition = this.el.object3D.position;
      
      // Calculate grab offset
      this.grabOffset.copy(intersectionPoint).sub(objectPosition);
      
      // Haptic feedback if supported and specified
      if (this.data.hapticFeedback && evt.detail.cursorEl && evt.detail.cursorEl.components['haptics']) {
        evt.detail.cursorEl.components['haptics'].pulse(this.data.feedbackIntensity, 100);
      }
      
      // Add visual feedback
      this.el.setAttribute('material', 'emissive', '#FFF');
      this.el.setAttribute('material', 'emissiveIntensity', 0.3);
    },
    
    onGrabEnd: function(this: InteractiveObjectComponent) {
      if (!this.grabbed) return;
      
      this.grabbed = false;
      
      // Remove visual feedback
      this.el.setAttribute('material', 'emissiveIntensity', 0);
      
      // Return to original position after delay
      setTimeout(() => {
        if (!this.grabbed) {
          this.el.setAttribute('animation', {
            property: 'position',
            to: `${this.data.originalPosition.x} ${this.data.originalPosition.y} ${this.data.originalPosition.z}`,
            dur: 1000,
            easing: 'easeOutElastic'
          });
        }
      }, this.data.returnDelay);
    },
    
    tick: function(this: InteractiveObjectComponent, time: number, timeDelta: number) {
      if (this.grabbed) {
        // Update position to follow cursor with offset
        const camera = document.querySelector('[camera]');
        const cursor = document.querySelector('[cursor]');
        
        if (camera && cursor) {
          const cursorPosition = new THREE.Vector3();
          cursor.object3D.getWorldPosition(cursorPosition);
          
          // Apply offset
          const targetPosition = cursorPosition.clone().sub(this.grabOffset);
          this.el.object3D.position.lerp(targetPosition, 0.2);
        }
      }
    }
  } as unknown as InteractiveObjectComponent);

  // Accessible text-to-speech component
  AFRAME.registerComponent('tts', {
    schema: {
      text: { type: 'string', default: '' },
      voice: { type: 'string', default: '' },
      rate: { type: 'number', default: 1 },
      pitch: { type: 'number', default: 1 },
      volume: { type: 'number', default: 1 },
      lang: { type: 'string', default: 'en-US' }
    },
    
    init: function(this: TTSComponent) {
      this.el.addEventListener('click', this.speak.bind(this));
      
      // Add visual cue for TTS availability
      const ttsBadge = document.createElement('a-entity');
      ttsBadge.setAttribute('geometry', 'primitive: plane; width: 0.2; height: 0.2');
      ttsBadge.setAttribute('material', 'src: #tts-icon; transparent: true');
      ttsBadge.setAttribute('position', '0 0.5 0.1');
      this.el.appendChild(ttsBadge);
    },
    
    speak: function(this: TTSComponent) {
      // Use Web Speech API if available
      if (typeof SpeechSynthesisUtterance !== 'undefined') {
        const utterance = new SpeechSynthesisUtterance(this.data.text);
        
        // Configure speech options
        utterance.lang = this.data.lang;
        utterance.rate = this.data.rate;
        utterance.pitch = this.data.pitch;
        utterance.volume = this.data.volume;
        
        // Set voice if specified
        if (this.data.voice) {
          const voices = window.speechSynthesis.getVoices();
          const voice = voices.find(v => v.name === this.data.voice);
          if (voice) {
            utterance.voice = voice;
          }
        }
        
        // Speak the text
        window.speechSynthesis.speak(utterance);
      }
    }
  } as unknown as TTSComponent);

  // Gesture recognition component
  AFRAME.registerComponent('gesture-detector', {
    schema: {
      minSwipeDistance: { type: 'number', default: 0.2 },
      minPinchScale: { type: 'number', default: 0.1 }
    },
    
    init: function(this: GestureDetectorComponent) {
      this.touchStarted = false;
      this.pinchStarted = false;
      this.touchPoints = [];
      this.initialTouchDistance = 0;
      
      this.el.addEventListener('touchstart', this.onTouchStart.bind(this));
      this.el.addEventListener('touchmove', this.onTouchMove.bind(this));
      this.el.addEventListener('touchend', this.onTouchEnd.bind(this));
    },
    
    onTouchStart: function(this: GestureDetectorComponent, evt: TouchEvent) {
      evt.preventDefault();
      
      if (evt.touches.length === 1) {
        // Single touch - potential swipe
        this.touchStarted = true;
        this.touchPoints = [{ x: evt.touches[0].clientX, y: evt.touches[0].clientY }];
      } else if (evt.touches.length === 2) {
        // Two touches - potential pinch
        this.pinchStarted = true;
        this.touchPoints = [
          { x: evt.touches[0].clientX, y: evt.touches[0].clientY },
          { x: evt.touches[1].clientX, y: evt.touches[1].clientY }
        ];
        
        // Calculate initial touch distance
        this.initialTouchDistance = Math.sqrt(
          Math.pow(this.touchPoints[1].x - this.touchPoints[0].x, 2) + 
          Math.pow(this.touchPoints[1].y - this.touchPoints[0].y, 2)
        );
      }
    },
    
    onTouchMove: function(this: GestureDetectorComponent, evt: TouchEvent) {
      if (!this.touchStarted && !this.pinchStarted) return;
      
      if (this.touchStarted && evt.touches.length === 1) {
        // Update for swipe
        this.touchPoints.push({ x: evt.touches[0].clientX, y: evt.touches[0].clientY });
        
        // Keep only the last 2 points
        if (this.touchPoints.length > 2) {
          this.touchPoints.shift();
        }
      } else if (this.pinchStarted && evt.touches.length === 2) {
        // Update for pinch
        const currentDistance = Math.sqrt(
          Math.pow(evt.touches[1].clientX - evt.touches[0].clientX, 2) + 
          Math.pow(evt.touches[1].clientY - evt.touches[0].clientY, 2)
        );
        
        // Calculate scale factor
        const scaleFactor = currentDistance / this.initialTouchDistance;
        
        // Emit scale event if significant
        if (Math.abs(scaleFactor - 1) > this.data.minPinchScale) {
          this.el.emit('pinch', { 
            scaleFactor: scaleFactor 
          });
          
          // Reset initial distance to prevent jumpy behaviour
          this.initialTouchDistance = currentDistance;
        }
      }
    },
    
    onTouchEnd: function(this: GestureDetectorComponent, evt: TouchEvent) {
      if (this.touchStarted && this.touchPoints.length === 2) {
        // Calculate swipe direction and distance
        const deltaX = this.touchPoints[1].x - this.touchPoints[0].x;
        const deltaY = this.touchPoints[1].y - this.touchPoints[0].y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // If swipe distance is significant
        if (distance > this.data.minSwipeDistance) {
          // Determine swipe direction
          const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
          let direction;
          
          if (angle > -45 && angle <= 45) {
            direction = 'right';
          } else if (angle > 45 && angle <= 135) {
            direction = 'down';
          } else if (angle > 135 || angle <= -135) {
            direction = 'left';
          } else {
            direction = 'up';
          }
          
          // Emit swipe event
          this.el.emit('swipe', { 
            direction: direction,
            distance: distance 
          });
        }
      }
      
      // Reset states
      this.touchStarted = false;
      this.pinchStarted = false;
    }
  } as unknown as GestureDetectorComponent);

  // Multiplayer avatar component
  AFRAME.registerComponent('network-avatar', {
    schema: {
      userId: { type: 'string' },
      username: { type: 'string', default: 'Anonymous' },
      color: { type: 'color', default: '#FFF' },
      avatarType: { type: 'string', default: 'default' }
    },
    
    init: function(this: NetworkAvatarComponent) {
      // Create avatar representation
      this.createAvatarBody();
      
      // Create username label
      const text = document.createElement('a-text');
      text.setAttribute('value', this.data.username);
      text.setAttribute('position', '0 0.7 0');
      text.setAttribute('align', 'center');
      text.setAttribute('color', '#FFF');
      text.setAttribute('scale', '0.5 0.5 0.5');
      this.el.appendChild(text);
    },
    
    createAvatarBody: function(this: NetworkAvatarComponent) {
      const avatarType = this.data.avatarType;
      const color = this.data.color;
      
      if (avatarType === 'robot') {
        // Robot avatar
        const head = document.createElement('a-sphere');
        head.setAttribute('color', color);
        head.setAttribute('radius', '0.25');
        head.setAttribute('position', '0 0.3 0');
        this.el.appendChild(head);
        
        const eye1 = document.createElement('a-sphere');
        eye1.setAttribute('color', '#000');
        eye1.setAttribute('radius', '0.05');
        eye1.setAttribute('position', '0.1 0.35 0.2');
        this.el.appendChild(eye1);
        
        const eye2 = document.createElement('a-sphere');
        eye2.setAttribute('color', '#000');
        eye2.setAttribute('radius', '0.05');
        eye2.setAttribute('position', '-0.1 0.35 0.2');
        this.el.appendChild(eye2);
        
        const body = document.createElement('a-box');
        body.setAttribute('color', color);
        body.setAttribute('width', '0.4');
        body.setAttribute('height', '0.5');
        body.setAttribute('depth', '0.2');
        body.setAttribute('position', '0 -0.2 0');
        this.el.appendChild(body);
      } else {
        // Default avatar (simple humanoid)
        const head = document.createElement('a-sphere');
        head.setAttribute('color', color);
        head.setAttribute('radius', '0.25');
        head.setAttribute('position', '0 0.3 0');
        this.el.appendChild(head);
        
        const body = document.createElement('a-cylinder');
        body.setAttribute('color', color);
        body.setAttribute('radius', '0.2');
        body.setAttribute('height', '0.6');
        body.setAttribute('position', '0 -0.2 0');
        this.el.appendChild(body);
      }
    },
    
    update: function(this: NetworkAvatarComponent, oldData: any) {
      // Update username if changed
      if (oldData?.username !== this.data.username) {
        const text = this.el.querySelector('a-text');
        if (text) {
          text.setAttribute('value', this.data.username);
        }
      }
    }
  } as unknown as NetworkAvatarComponent);

  // Progress visualization component (growing plant)
  AFRAME.registerComponent('progress-plant', {
    schema: {
      progress: { type: 'number', default: 0 }, // 0-100
      growthColor: { type: 'color', default: '#4CAF50' },
      seedColor: { type: 'color', default: '#795548' },
      fruitColor: { type: 'color', default: '#FF5722' },
      maxHeight: { type: 'number', default: 2 }
    },
    
    init: function(this: ProgressPlantComponent) {
      this.createPlant();
      this.updatePlantGrowth();
    },
    
    createPlant: function(this: ProgressPlantComponent) {
      // Create pot
      const pot = document.createElement('a-cylinder');
      pot.setAttribute('color', '#795548');
      pot.setAttribute('radius', '0.3');
      pot.setAttribute('height', '0.3');
      pot.setAttribute('position', '0 -0.15 0');
      this.el.appendChild(pot);
      
      // Create soil
      const soil = document.createElement('a-cylinder');
      soil.setAttribute('color', '#3E2723');
      soil.setAttribute('radius', '0.28');
      soil.setAttribute('height', '0.05');
      soil.setAttribute('position', '0 0.05 0');
      this.el.appendChild(soil);
      
      // Create stem (will be scaled based on progress)
      this.stem = document.createElement('a-cylinder');
      this.stem.setAttribute('color', this.data.growthColor);
      this.stem.setAttribute('radius', '0.05');
      this.stem.setAttribute('height', '0.1');
      this.stem.setAttribute('position', '0 0.1 0');
      this.stem.setAttribute('animation', 'property: height; dur: 1500; easing: easeOutElastic');
      this.el.appendChild(this.stem);
      
      // Create leaves (will appear based on progress thresholds)
      this.leaves = [];
      for (let i = 0; i < 3; i++) {
        const leaf = document.createElement('a-sphere');
        leaf.setAttribute('color', this.data.growthColor);
        leaf.setAttribute('scale', '0.15 0.05 0.15');
        leaf.setAttribute('visible', 'false');
        this.el.appendChild(leaf);
        this.leaves.push(leaf);
      }
      
      // Create flower/fruit (will appear at high progress)
      this.fruit = document.createElement('a-sphere');
      this.fruit.setAttribute('color', this.data.fruitColor);
      this.fruit.setAttribute('radius', '0.15');
      this.fruit.setAttribute('visible', 'false');
      this.el.appendChild(this.fruit);
    },
    
    update: function(this: ProgressPlantComponent) {
      this.updatePlantGrowth();
    },
    
    updatePlantGrowth: function(this: ProgressPlantComponent) {
      const progress = this.data.progress;
      
      // Update stem height (proportional to progress)
      const stemHeight = Math.max(0.1, (progress / 100) * this.data.maxHeight);
      this.stem.setAttribute('height', stemHeight);
      this.stem.setAttribute('position', `0 ${0.1 + stemHeight/2} 0`);
      
      // Show leaves at different progress thresholds
      if (progress >= 30) {
        this.leaves[0].setAttribute('visible', true);
        this.leaves[0].setAttribute('position', `0.15 ${0.3 + stemHeight * 0.2} 0`);
      }
      if (progress >= 60) {
        this.leaves[1].setAttribute('visible', true);
        this.leaves[1].setAttribute('position', `-0.15 ${0.3 + stemHeight * 0.5} 0`);
      }
      if (progress >= 80) {
        this.leaves[2].setAttribute('visible', true);
        this.leaves[2].setAttribute('position', `0.1 ${0.3 + stemHeight * 0.8} 0.1`);
      }
      
      // Show fruit/flower at 100% progress
      if (progress >= 100) {
        this.fruit.setAttribute('visible', true);
        this.fruit.setAttribute('position', `0 ${0.3 + stemHeight} 0`);
        this.fruit.setAttribute('animation', 'property: scale; to: 1.1 1.1 1.1; dir: alternate; loop: true; dur: 1000; easing: easeInOutSine');
      } else {
        this.fruit.setAttribute('visible', false);
        this.fruit.removeAttribute('animation');
      }
    }
  } as unknown as ProgressPlantComponent);
}

// A-Frame will import this in the browser, not on the server
export default (typeof AFRAME !== 'undefined' ? AFRAME : {}); 