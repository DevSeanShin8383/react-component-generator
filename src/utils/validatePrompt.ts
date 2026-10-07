export const MAX_PROMPT_LENGTH = 500;

export interface PromptValidation {
  valid: boolean;
  length: number;
  error?: string;
}

/** 전송 기준(trim)과 동일하게 앞뒤 공백을 제외한 길이로 검증한다. */
export function validatePrompt(prompt: string): PromptValidation {
  const length = prompt.trim().length;

  if (length > MAX_PROMPT_LENGTH) {
    return {
      valid: false,
      length,
      error: `프롬프트는 ${MAX_PROMPT_LENGTH}자 이하로 입력해주세요.`,
    };
  }

  return { valid: true, length };
}
