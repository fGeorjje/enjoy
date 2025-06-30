import { EMPTY_SLOTS } from '../env'
import { obs } from '../obs'

let cachedNames: string[] = []
export function getCachedNames (): string[] {
  return cachedNames
}

export function updateNames (names: string[]): void {
  if (names.length === 0) return
  cachedNames = names
  for (let i = EMPTY_SLOTS; i < 25; i++) {
    setName(names[i - EMPTY_SLOTS], i)
  }
}

function setName (name: string | undefined, i: number): void {
  void obs.call('SetInputSettings', {
    inputName: `Player ${i + 1}`,
    inputSettings: {
      text: ` ${name ?? ''} `
    }
  })
}
