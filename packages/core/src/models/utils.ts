// eslint-disable-next-line import/prefer-default-export
export function ObjToArr<T>(
  data: Record<string | number | symbol, T>,
  keyToTranslate = 'key',
) {
  return Object
    .entries(data)
    .map(([key, value]) => Object.assign(value, { [keyToTranslate]: key }));
}
