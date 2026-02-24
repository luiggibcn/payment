export const deepClone = <T>(source: T): T => {
  return structuredClone(source)
}

export const deepMerge = <T = any>(target: any, source: any): T => {
  const result = { ...target }
  for (const key in source) {
    const srcVal = source[key]
    const tgtVal = result[key]
    if (
      srcVal !== null &&
      typeof srcVal === 'object' &&
      !Array.isArray(srcVal) &&
      typeof tgtVal === 'object' &&
      tgtVal !== null &&
      !Array.isArray(tgtVal)
    ) {
      result[key] = deepMerge(tgtVal, srcVal)
    } else {
      result[key] = srcVal
    }
  }
  return result as T
}