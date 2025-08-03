import { INTERPOLATION } from "./Types";

export function GetEasing(method: number, start: number, end: number, count: number) {
  switch (method) {
    case INTERPOLATION.Linear: return [];
    case INTERPOLATION.EaseInCirc: return easeInCirc(start, end, count);
    case INTERPOLATION.EaseOutCirc: return easeOutCirc(start, end, count);
    case INTERPOLATION.EaseInBack: return easeInBack(start, end, count);
    case INTERPOLATION.EaseOutElastic: return easeOutElastic(start, end, count);
    default: return [];
  }
}

function easeInBack(start: number, end: number, count: number): number[] {
  const values: number[] = [];
  const change = end - start;
  const s = 1.70158;

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const easedValue = start + change * (t * t * ((s + 1) * t - s));
    values.push(easedValue);
  }

  return values;
}

function easeOutCirc(start: number, end: number, count: number): number[] {
  const values: number[] = [];
  const change = end - start;

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const easedValue = start + change * Math.sqrt(1 - Math.pow(t - 1, 2));
    values.push(easedValue);
  }

  return values;
}

function easeInCirc(start: number, end: number, count: number): number[] {
  const values: number[] = [];
  const change = end - start;

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const easedValue = start + change * (1 - Math.sqrt(1 - Math.pow(t, 2)));
    values.push(easedValue);
  }

  return values;
}

function easeOutElastic(start: number, end: number, count: number): number[] {
  const values: number[] = [];
  const change = end - start;
  const duration = count - 1;
  const amplitude = 1;

  for (let i = 0; i < count; i++) {
    const t = i / duration;
    const easedValue = (t === 1)
      ? start + change
      : start + change * (Math.pow(2, -10 * t) * Math.sin((t - (amplitude / 4)) * (2 * Math.PI) / amplitude) + 1);
    values.push(easedValue);
  }

  return values;
}

