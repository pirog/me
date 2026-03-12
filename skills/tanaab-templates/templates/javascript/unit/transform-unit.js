const DEFAULT_OPTIONS = Object.freeze({});

export default function transformInput(input, options = {}) {
  const normalizedOptions = { ...DEFAULT_OPTIONS, ...options };
  const normalizedInput = Array.isArray(input) ? input : [input];

  if (normalizedInput.length === 0) {
    return [];
  }

  const filteredInput = normalizedInput.filter((value) => value != null);
  const transformedInput = filteredInput.map((value) => {
    return {
      value,
      ...normalizedOptions,
    };
  });

  return transformedInput;
}
