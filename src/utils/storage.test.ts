import { describe, it, expect, beforeEach } from 'vitest';
import {
  STORAGE_KEYS,
  MAX_HISTORY,
  loadProvider,
  saveProvider,
  loadPromptHistory,
  addPromptToHistory,
  savePromptHistory,
  loadComponents,
  saveComponents,
} from './storage';

beforeEach(() => {
  localStorage.clear();
});

describe('provider 저장', () => {
  it('저장된 값이 없으면 기본값을 반환한다', () => {
    expect(loadProvider('google')).toBe('google');
  });

  it('저장한 provider를 다시 읽어온다', () => {
    saveProvider('anthropic');
    expect(loadProvider('google')).toBe('anthropic');
  });

  it('알 수 없는 값이 저장돼 있으면 기본값을 반환한다', () => {
    localStorage.setItem(STORAGE_KEYS.provider, 'openai');
    expect(loadProvider('google')).toBe('google');
  });
});

describe('프롬프트 히스토리', () => {
  it('저장된 값이 없으면 빈 배열을 반환한다', () => {
    expect(loadPromptHistory()).toEqual([]);
  });

  it('저장한 히스토리를 다시 읽어온다', () => {
    savePromptHistory(['a', 'b']);
    expect(loadPromptHistory()).toEqual(['a', 'b']);
  });

  it('JSON이 깨져 있으면 빈 배열을 반환한다', () => {
    localStorage.setItem(STORAGE_KEYS.promptHistory, '{broken');
    expect(loadPromptHistory()).toEqual([]);
  });

  it('문자열 배열이 아니면 빈 배열을 반환한다', () => {
    localStorage.setItem(STORAGE_KEYS.promptHistory, JSON.stringify([1, 2]));
    expect(loadPromptHistory()).toEqual([]);
  });

  it('새 프롬프트를 맨 앞에 추가한다', () => {
    expect(addPromptToHistory(['a'], 'b')).toEqual(['b', 'a']);
  });

  it('중복 프롬프트는 기존 항목을 제거하고 맨 앞으로 올린다', () => {
    expect(addPromptToHistory(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c']);
  });

  it(`최대 ${MAX_HISTORY}개까지만 유지한다`, () => {
    const full = Array.from({ length: MAX_HISTORY }, (_, i) => `p${i}`);
    const next = addPromptToHistory(full, 'new');
    expect(next).toHaveLength(MAX_HISTORY);
    expect(next[0]).toBe('new');
    expect(next).not.toContain(`p${MAX_HISTORY - 1}`);
  });
});

describe('생성된 컴포넌트 목록', () => {
  it('저장된 값이 없으면 빈 배열을 반환한다', () => {
    expect(loadComponents()).toEqual([]);
  });

  it('저장 후 읽으면 createdAt이 Date로 복원된다', () => {
    const createdAt = new Date('2026-01-02T03:04:05.000Z');
    saveComponents([{ id: '1', prompt: 'p', code: 'c', createdAt }]);
    const [loaded] = loadComponents();
    expect(loaded.createdAt).toBeInstanceOf(Date);
    expect(loaded.createdAt.getTime()).toBe(createdAt.getTime());
    expect(loaded).toMatchObject({ id: '1', prompt: 'p', code: 'c' });
  });

  it('JSON이 깨져 있으면 빈 배열을 반환한다', () => {
    localStorage.setItem(STORAGE_KEYS.components, 'nope');
    expect(loadComponents()).toEqual([]);
  });

  it('형식이 맞지 않는 항목은 걸러낸다', () => {
    localStorage.setItem(
      STORAGE_KEYS.components,
      JSON.stringify([
        { id: '1', prompt: 'p', code: 'c', createdAt: '2026-01-02T03:04:05.000Z' },
        { id: 2, prompt: 'p' },
      ]),
    );
    expect(loadComponents()).toHaveLength(1);
  });
});

describe('API 키', () => {
  it('어떤 저장 함수도 localStorage에 API 키를 쓰지 않는다', () => {
    saveProvider('google');
    savePromptHistory(['a']);
    saveComponents([]);
    const stored = Object.keys(localStorage).join(',');
    expect(stored).not.toMatch(/key/i);
  });
});
