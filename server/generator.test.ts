import { describe, it, expect } from 'vitest';
import { stripCodeFences, ensureRenderCall, getPromptError } from './generator';

describe('stripCodeFences', () => {
  it('언어 태그가 붙은 코드펜스를 제거한다', () => {
    const input = '```tsx\nconst A = () => null;\n```';
    expect(stripCodeFences(input)).toBe('const A = () => null;');
  });

  it('언어 태그 없는 코드펜스도 제거한다', () => {
    const input = '```\nconst A = 1;\n```';
    expect(stripCodeFences(input)).toBe('const A = 1;');
  });

  it('펜스가 없으면 앞뒤 공백만 정리해 그대로 반환한다', () => {
    expect(stripCodeFences('  const A = 1;  ')).toBe('const A = 1;');
  });
});

describe('ensureRenderCall', () => {
  it('이미 render() 호출이 있으면 그대로 둔다', () => {
    const code = 'const Card = () => null;\nrender(<Card />);';
    expect(ensureRenderCall(code)).toBe(code);
  });

  it('const 컴포넌트 선언에 render 호출을 주입한다', () => {
    const code = 'const Card = () => null;';
    expect(ensureRenderCall(code)).toBe(`${code}\n\nrender(<Card />);`);
  });

  it('function 선언 컴포넌트에도 render 호출을 주입한다', () => {
    const code = 'function Widget() { return null; }';
    expect(ensureRenderCall(code)).toContain('render(<Widget />);');
  });

  it('대문자로 시작하는 컴포넌트 선언이 없으면 원본을 그대로 반환한다', () => {
    const code = 'const value = 42;';
    expect(ensureRenderCall(code)).toBe(code);
  });
});

describe('getPromptError', () => {
  it('유효한 프롬프트면 null을 반환한다', () => {
    expect(getPromptError('프로필 카드')).toBeNull();
  });

  it('프롬프트가 없거나 공백뿐이면 필수 에러를 반환한다', () => {
    expect(getPromptError(undefined)).toBe('Prompt is required');
    expect(getPromptError('   ')).toBe('Prompt is required');
  });

  it('문자열이 아니면 필수 에러를 반환한다', () => {
    expect(getPromptError(123)).toBe('Prompt is required');
  });

  it('500자를 넘으면 길이 에러 메시지를 반환한다', () => {
    expect(getPromptError('a'.repeat(501))).toContain('500');
  });

  it('정확히 500자면 통과한다', () => {
    expect(getPromptError('a'.repeat(500))).toBeNull();
  });
});
