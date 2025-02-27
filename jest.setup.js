// Import Jest DOM matchers
require('@testing-library/jest-dom');

// Mock window properties and methods used by A-Frame
global.HTMLCanvasElement.prototype.getContext = () => {};
global.HTMLMediaElement.prototype.play = () => Promise.resolve();
global.HTMLMediaElement.prototype.pause = () => {};

// Mock WebGL context more completely
const mockWebGLContext = {
  getShaderPrecisionFormat: () => ({
    precision: 'mediump',
    rangeMin: 1,
    rangeMax: 1
  }),
  getExtension: () => null,
  getParameter: () => null,
  createShader: () => null,
  createProgram: () => null,
  createTexture: () => null,
  bindTexture: () => null,
  texImage2D: () => null,
  texParameteri: () => null,
  getShaderParameter: () => true,
  getProgramParameter: () => true,
  getShaderInfoLog: () => '',
  getProgramInfoLog: () => ''
};

// Mock getContext for WebGL
HTMLCanvasElement.prototype.getContext = function(contextType) {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return mockWebGLContext;
  }
  return null;
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock WebXR
global.navigator.xr = {
  isSessionSupported: () => Promise.resolve(true),
  requestSession: () => Promise.resolve({}),
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.URL
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

// Mock AudioContext
global.AudioContext = class AudioContext {
  createMediaElementSource() {
    return {
      connect: () => {},
      disconnect: () => {},
    };
  }
  createPanner() {
    return {
      connect: () => {},
      disconnect: () => {},
      setPosition: () => {},
    };
  }
  createGain() {
    return {
      connect: () => {},
      disconnect: () => {},
      gain: { value: 1 },
    };
  }
  destination = {};
  state = 'running';
  resume() {
    return Promise.resolve();
  }
};

// Mock WebSocket
global.WebSocket = class WebSocket {
  constructor() {
    setTimeout(() => {
      this.onopen && this.onopen();
    }, 0);
  }
  send() {}
  close() {}
};

// Suppress specific console errors that we expect during tests
const originalError = console.error;
console.error = (...args) => {
  const errorMessage = args[0]?.toString() || '';
  if (
    errorMessage.includes('Warning: ReactDOM.render is no longer supported') ||
    errorMessage.includes('Error: Not implemented: HTMLCanvasElement.prototype.getContext') ||
    errorMessage.includes('Expected first argument to collection()') ||
    errorMessage.includes('An update to ForwardRef(LoadableComponent) inside a test')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Mock SpeechSynthesis API more completely
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn().mockReturnValue([
    { name: 'English US', lang: 'en-US' },
    { name: 'Spanish', lang: 'es-ES' }
  ]),
  pending: false,
  speaking: false,
  paused: false,
  onvoiceschanged: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
};

// Mock Keyboard Navigation
global.KeyboardEvent = class KeyboardEvent extends Event {
  constructor(type, options) {
    super(type);
    this.key = options.key || '';
    this.code = options.code || '';
    this.keyCode = options.keyCode || 0;
  }
};

// Enhanced Accessibility Mocks
global.MutationObserver = class {
  constructor(callback) {}
  disconnect() {}
  observe(element, initObject) {}
};

// Mock Accessibility API
global.window.getComputedStyle = jest.fn().mockImplementation(() => ({
  getPropertyValue: jest.fn().mockReturnValue(''),
}));

// Mock Focus Management
let activeElement = document.body;
Object.defineProperty(document, 'activeElement', {
  get: () => activeElement,
  set: (element) => { activeElement = element; }
});

// Mock High Contrast Mode
global.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Mock A-Frame more completely
global.AFRAME = {
  components: {},
  geometries: {},
  materials: {},
  primitives: {},
  scenes: [],
  systems: {
    material: {
      registerMaterial: () => {},
      unregisterMaterial: () => {},
      dispose: () => {},
      getMaterial: () => ({
        dispose: () => {}
      })
    }
  },
  utils: {
    coordinates: {
      isCoordinates: () => true
    }
  },
  registerComponent: (name, component) => {
    global.AFRAME.components[name] = component;
  },
  registerGeometry: (name, geometry) => {
    global.AFRAME.geometries[name] = geometry;
  },
  registerPrimitive: (name, primitive) => {
    global.AFRAME.primitives[name] = primitive;
  },
  registerSystem: (name, system) => {
    global.AFRAME.systems[name] = system;
  }
};

// Mock custom elements for A-Frame entities
customElements.define('a-scene', class extends HTMLElement {
  constructor() {
    super();
    this.object3D = {
      add: () => {},
      remove: () => {},
      position: { set: () => {} },
      rotation: { set: () => {} },
      scale: { set: () => {} }
    };
    this.systems = global.AFRAME.systems;
    this.components = {};
    this.emit = () => {};
    this.addEventListener = () => {};
    this.removeEventListener = () => {};
  }
});

customElements.define('a-entity', class extends HTMLElement {
  constructor() {
    super();
    this.object3D = {
      add: () => {},
      remove: () => {},
      position: { set: () => {} },
      rotation: { set: () => {} },
      scale: { set: () => {} }
    };
    this.components = {};
    this.emit = () => {};
    this.addEventListener = () => {};
    this.removeEventListener = () => {};
  }
}); 