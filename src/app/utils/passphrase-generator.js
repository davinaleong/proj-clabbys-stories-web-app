export function passphraseGenerator() {
  const adjectives = ["peach", "sunny", "bright", "calm"]
  const nouns = ["glow", "river", "cloud", "leaf"]
  const number = Math.floor(10 + Math.random() * 90)
  return `${sample(adjectives)}-${sample(nouns)}-${number}`
}

export function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
