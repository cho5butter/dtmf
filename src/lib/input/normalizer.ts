export interface NormalizeResult {
  display: string;
  digits: string;
  hadInternationalPrefix: boolean;
  removed: string;
  truncated: boolean;
}

const MAX_DIGITS = 64;
const _DIGIT_PATTERN = /[0-9*#]/g;
const FULLWIDTH_DIGIT_OFFSET = 0xfee0;

function toHalfWidth(char: string): string {
  const code = char.charCodeAt(0);
  if (code >= 0xff10 && code <= 0xff19) {
    return String.fromCharCode(code - FULLWIDTH_DIGIT_OFFSET);
  }
  if (code >= 0xff0a && code <= 0xff0f) {
    const map: Record<number, string> = {
      65290: "*",
      65291: "+",
      65292: ",",
      65293: "-",
      65294: ".",
      65295: "/",
    };
    return map[code] ?? char;
  }
  return char;
}

export function normalizePhoneNumber(input: string): NormalizeResult {
  let hadInternationalPrefix = false;
  const removedChars: string[] = [];
  const displayChars: string[] = [];
  const digitChars: string[] = [];
  let seenLeadingPlus = false;

  for (const rawChar of input) {
    const char = toHalfWidth(rawChar);

    if (char === "+" && !seenLeadingPlus && displayChars.length === 0 && digitChars.length === 0) {
      hadInternationalPrefix = true;
      seenLeadingPlus = true;
      displayChars.push("+");
      continue;
    }

    if (char === "+" && (displayChars.length > 0 || digitChars.length > 0)) {
      removedChars.push(char);
      continue;
    }

    if (/[0-9*#]/.test(char)) {
      displayChars.push(char);
      digitChars.push(char);
      continue;
    }

    if (/[a-zA-Z]/.test(char)) {
      removedChars.push(char);
      continue;
    }

    if (/\s/.test(char) || "-()[]{}./\\".includes(char)) {
      removedChars.push(char);
      continue;
    }

    removedChars.push(char);
  }

  let digits = digitChars.join("");
  let truncated = false;
  if (digits.length > MAX_DIGITS) {
    digits = digits.slice(0, MAX_DIGITS);
    truncated = true;
  }

  return {
    display: displayChars.join(""),
    digits,
    hadInternationalPrefix,
    removed: removedChars.join(""),
    truncated,
  };
}
