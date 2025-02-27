import { Component, ComponentConstructor, ComponentDefinition, Coordinate, System, SystemConstructor } from 'aframe';

// Define minimal types for our mocks
interface MockComponent {
  el: any;
  data: any;
  init?: () => void;
  update?: () => void;
  remove?: () => void;
}

interface MockSystem {
  init?: () => void;
  tick?: () => void;
  remove?: () => void;
}

// Mock types for testing
interface MockAFrameGlobal {
  components: Record<string, any>;
  systems: Record<string, any>;
  registerComponent: any;
  registerSystem: any;
  utils: {
    coordinates: {
      parse: (str: string) => { x: number; y: number; z: number };
      isCoordinate: (value: string) => boolean;
      stringify: (coord: { x: number; y: number; z: number }) => string;
    };
  };
}

class MockAFrameBase extends HTMLElement {
  components: { [key: string]: any } = {};
  object3D = {
    add: jest.fn(),
    remove: jest.fn(),
    position: { set: jest.fn() },
    rotation: { set: jest.fn() },
    scale: { set: jest.fn() }
  };
  systems = {
    material: {
      init: jest.fn(),
      tick: jest.fn(),
      remove: jest.fn()
    }
  };
  isPlaying = true;
  
  getAttribute(attr: string) {
    return this.components[attr]?.data || null;
  }
  
  setAttribute(attr: string, value: any) {
    this.components[attr] = { data: value };
  }
  
  removeAttribute(attr: string) {
    delete this.components[attr];
  }
  
  hasAttribute(attr: string) {
    return attr in this.components;
  }
  
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
  emit = jest.fn();
  
  // Component lifecycle methods
  initComponent() {}
  updateComponent() {}
  removeComponent() {}
  
  // Scene-specific methods
  hasLoaded = true;
  renderStart = jest.fn();
  load = jest.fn();
}

// Define specific element classes
class MockAFrameScene extends MockAFrameBase {}
class MockAFrameEntity extends MockAFrameBase {}
class MockAFrameBox extends MockAFrameBase {}
class MockAFrameCamera extends MockAFrameBase {}

// Map element names to their classes
const elementMap = {
  'A-SCENE': MockAFrameScene,
  'A-ENTITY': MockAFrameEntity,
  'A-BOX': MockAFrameBox,
  'A-CAMERA': MockAFrameCamera
};

// Register custom elements
Object.entries(elementMap).forEach(([name, constructor]) => {
  if (!customElements.get(name.toLowerCase())) {
    customElements.define(name.toLowerCase(), constructor);
  }
});

// Mock global AFRAME object
if (typeof global.AFRAME === 'undefined') {
  const mockAFrame: MockAFrameGlobal = {
    components: {} as Record<string, any>,
    systems: {} as Record<string, any>,
    registerComponent: (name: string, definition: any) => {
      const Constructor = function(this: any) {
        this.el = null;
        this.data = {};
        Object.assign(this, definition);
      };
      mockAFrame.components[name] = Constructor;
      return Constructor;
    },
    registerSystem: (name: string, definition: any) => {
      const Constructor = function(this: any) {
        Object.assign(this, definition);
      };
      mockAFrame.systems[name] = Constructor;
      return Constructor;
    },
    utils: {
      coordinates: {
        parse: (str: string) => ({ x: 0, y: 0, z: 0 }),
        isCoordinate: (value: string) => true,
        stringify: (coord: { x: number; y: number; z: number }) => `${coord.x} ${coord.y} ${coord.z}`
      }
    }
  };
  
  global.AFRAME = mockAFrame as unknown as typeof AFRAME;
}

export { MockAFrameBase, elementMap }; 