function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function deepMerge(base = {}, override = {}) {
  const result = { ...base };

  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], value);
      continue;
    }

    result[key] = value;
  }

  return result;
}
