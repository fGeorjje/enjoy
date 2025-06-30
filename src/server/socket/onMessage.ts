import { identified } from '../obs'
import type { RawData } from 'ws'
import { updateNames } from './names'
import { updateVideos } from './videos'
import type { Message } from '../../message'

let bodySize: DOMRect
export function getBodySize (): DOMRect {
  return bodySize
}

export function onMessage (data: RawData): void {
  if (!identified()) return
  const message = JSON.parse((data as Buffer).toString()) as Message
  if (message.names !== undefined) {
    updateNames(message.names)
  }
  if (message.body !== undefined) {
    bodySize = message.body
  }
  if (message.videos !== undefined) {
    void updateVideos(message.videos)
  }
  if (message.log !== undefined) {
    console.log(...message.log)
  }
}
