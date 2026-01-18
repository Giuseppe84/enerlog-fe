export function normalizeEmptyToNull<T extends Record<string, any>>(obj: T): T {
  const result: any = {};

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === 'string') {
      const trimmed = value.trim();
      result[key] = trimmed === '' ? null : trimmed;
    } else if (Array.isArray(value)) {
      result[key] = value;
    } else {
      result[key] = value ?? null;
    }
  }

  return result;
}