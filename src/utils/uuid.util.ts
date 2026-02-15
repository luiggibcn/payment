export const getRandomUUIDUser = (): string => {
  return globalThis.crypto.randomUUID()
}