import { describe, it, expect } from 'vitest';
import { validatePrompt, MAX_PROMPT_LENGTH } from './validatePrompt';

describe('validatePrompt', () => {
  it('최대 길이는 500자다', () => {
    expect(MAX_PROMPT_LENGTH).toBe(500);
  });

  it('500자 이하이면 유효하다', () => {
    const result = validatePrompt('a'.repeat(500));
    expect(result).toEqual({ valid: true, length: 500 });
  });

  it('500자를 넘으면 유효하지 않고 에러 메시지를 반환한다', () => {
    const result = validatePrompt('a'.repeat(501));
    expect(result.valid).toBe(false);
    expect(result.length).toBe(501);
    expect(result.error).toContain('500');
  });

  it('전송 기준과 같게 앞뒤 공백은 길이에서 제외한다', () => {
    const result = validatePrompt(`  ${'a'.repeat(500)}  `);
    expect(result).toEqual({ valid: true, length: 500 });
  });
});
