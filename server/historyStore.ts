import fs from 'fs';
import path from 'path';
import type { HistorySession } from '../src/types/debugger.ts';

const DATA_DIR = process.env.VERCEL
  ? path.resolve('/tmp', '.data')
  : path.resolve(process.cwd(), '.data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

class HistoryStore {
  private sessions: HistorySession[] = [];
  private initialized = false;

  private init() {
    if (this.initialized) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(HISTORY_FILE)) {
        const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
        this.sessions = JSON.parse(raw);
      } else {
        this.sessions = [];
        this.save();
      }
    } catch (err) {
      console.warn('[HistoryStore] Failed to read history file, using in-memory store:', err);
      this.sessions = [];
    }
    this.initialized = true;
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(this.sessions, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[HistoryStore] Failed to persist history file:', err);
    }
  }

  public getAll(): HistorySession[] {
    this.init();
    // Return newest first
    return [...this.sessions].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public getById(id: string): HistorySession | undefined {
    this.init();
    return this.sessions.find((s) => s.id === id);
  }

  public add(session: HistorySession): HistorySession {
    this.init();
    // Prepend and limit to 100 sessions
    this.sessions.unshift(session);
    if (this.sessions.length > 100) {
      this.sessions = this.sessions.slice(0, 100);
    }
    this.save();
    return session;
  }

  public delete(id: string): boolean {
    this.init();
    const prevLen = this.sessions.length;
    this.sessions = this.sessions.filter((s) => s.id !== id);
    const deleted = this.sessions.length < prevLen;
    if (deleted) {
      this.save();
    }
    return deleted;
  }

  public clear(): void {
    this.init();
    this.sessions = [];
    this.save();
  }
}

export const historyStore = new HistoryStore();
