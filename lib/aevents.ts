/* aevents.ts */

import { BaseEventsSystem, EventMap, Listener } from './base'

// ---

export interface DefaultAsyncEvents {
  connect: (username: string) => Promise<void>
  disconnect: (reason: string) => Promise<void>
}

export class AsyncEventSystem<
  Events extends EventMap<Events> = DefaultAsyncEvents
> extends BaseEventsSystem<Events> {
  emit<Ev extends keyof Events>(event: Ev, ...data: Parameters<Events[Ev]>) {
    let subs = this.subscribers.get(event)

    if (subs === undefined) return

    let promises: Promise<void>[] = []
    let once_subs: Listener<Events[keyof Events]>[] = []

    for (let sub of subs) {
      let promise = sub.call(...(data as Parameters<Events[Ev]>[]))
      if (sub.flags.once) once_subs.push(sub)
      promises.push(promise)
    }

    Promise.all(promises)

    for (let sub of once_subs) this.remove(event, sub)
  }
}
