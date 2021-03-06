/* aevents.ts */

import { BaseEventsSystem, EventMap } from './base'

// ---

export interface DefaultAsyncEvents {
  connect: (username: string) => Promise<void>
  disconnect: (reason: string) => Promise<void>
}

export class AsyncEventSystem<
  Events extends EventMap<Events> = DefaultAsyncEvents
> extends BaseEventsSystem<Events> {
  emit<Event extends keyof Events>(
    event: Event,
    ...data: Parameters<Events[Event]>
  ) {
    let subs = this.subscribers.get(event)

    if (subs === undefined) return

    let promises: Promise<any>[] = []
    let once_subs = []

    for (let sub of subs) {
      let promise = sub.call(...(data as Parameters<Events[Event]>[]))
      if (sub.flags.once) once_subs.push(sub)
      promises.push(promise)
    }

    Promise.all(promises)

    for (let sub of once_subs) this.remove(event, sub)
  }

  async aemit<Event extends keyof Events>(
    event: Event,
    ...data: Parameters<Events[Event]>
  ) {
    let subs = this.subscribers.get(event)

    if (subs === undefined) return

    let promises: Promise<any>[] = []
    let once_subs = []

    for (let sub of subs) {
      let promise = sub.call(...(data as Parameters<Events[Event]>[]))
      if (sub.flags.once) once_subs.push(sub)
      promises.push(promise)
    }

    await Promise.all(promises)

    for (let sub of once_subs) this.remove(event, sub)
  }
}
