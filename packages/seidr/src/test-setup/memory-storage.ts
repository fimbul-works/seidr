/**
 * Simple in-memory Storage mock
 */
export class MemoryStorage implements Storage {
  private data: Record<string, string> = {};

  get length() {
    return Object.keys(this.data).length;
  }

  clear() {
    this.data = {};
  }

  getItem(key: string) {
    return this.data[key] || null;
  }

  key(index: number) {
    return Object.keys(this.data)[index] || null;
  }

  removeItem(key: string) {
    delete this.data[key];
  }

  setItem(key: string, value: string) {
    this.data[key] = value;
  }
}
