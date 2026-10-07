import type { GeneratedComponent, Provider } from '../types';

// API 키는 의도적으로 저장하지 않는다 (AGENTS.md Immutable 규칙).
export const STORAGE_KEYS = {
  provider: 'rcg:provider',
  promptHistory: 'rcg:promptHistory',
  components: 'rcg:components',
} as const;

export const MAX_HISTORY = 20;

const PROVIDERS: readonly Provider[] = ['anthropic', 'google'];

function readJSON(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 용량 초과나 저장소 비활성화 시에는 조용히 무시한다.
  }
}

export function loadProvider(fallback: Provider): Provider {
  const value = localStorage.getItem(STORAGE_KEYS.provider);
  return PROVIDERS.find((p) => p === value) ?? fallback;
}

export function saveProvider(provider: Provider): void {
  try {
    localStorage.setItem(STORAGE_KEYS.provider, provider);
  } catch {
    // 무시
  }
}

export function loadPromptHistory(): string[] {
  const value = readJSON(STORAGE_KEYS.promptHistory);
  return Array.isArray(value) && value.every((v) => typeof v === 'string') ? value : [];
}

export function savePromptHistory(history: string[]): void {
  writeJSON(STORAGE_KEYS.promptHistory, history);
}

export function addPromptToHistory(history: string[], prompt: string): string[] {
  return [prompt, ...history.filter((p) => p !== prompt)].slice(0, MAX_HISTORY);
}

function isStoredComponent(value: unknown): value is Omit<GeneratedComponent, 'createdAt'> & {
  createdAt: string;
} {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.prompt === 'string' &&
    typeof v.code === 'string' &&
    typeof v.createdAt === 'string'
  );
}

export function loadComponents(): GeneratedComponent[] {
  const value = readJSON(STORAGE_KEYS.components);
  if (!Array.isArray(value)) return [];
  return value
    .filter(isStoredComponent)
    .map((c) => ({ ...c, createdAt: new Date(c.createdAt) }));
}

export function saveComponents(components: GeneratedComponent[]): void {
  writeJSON(STORAGE_KEYS.components, components);
}
