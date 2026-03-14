/**
 * Centralized activity tracker — logs real user actions to localStorage.
 * Every page pushes events here; Dashboard reads them.
 */

const STORAGE_KEY = "omnid-activity";
const MAX_EVENTS = 100;

export interface ActivityEvent {
  id: number;
  action: string;
  icon: string;
  color: string;
  timestamp: number; // Date.now()
}

let _nextId: number | null = null;

function getNextId(): number {
  if (_nextId === null) {
    const events = getActivity();
    _nextId = events.length > 0 ? Math.max(...events.map((e) => e.id)) + 1 : 1;
  }
  return _nextId++;
}

export function pushActivity(action: string, icon: string, color: string): ActivityEvent {
  const event: ActivityEvent = {
    id: getNextId(),
    action,
    icon,
    color,
    timestamp: Date.now(),
  };
  const events = getActivity();
  events.unshift(event);
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  // Dispatch storage event so other components can react
  window.dispatchEvent(new Event("omnid-activity"));
  return event;
}

export function getActivity(): ActivityEvent[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ActivityEvent[];
  } catch {
    return [];
  }
}

export function clearActivity(): void {
  localStorage.removeItem(STORAGE_KEY);
  _nextId = null;
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
