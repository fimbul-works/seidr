import { afterEach } from 'vitest';

afterEach(() => {
  // Clean up DOM after each test
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

// Mock DOM environment for testing
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'test',
  },
  writable: true,
});