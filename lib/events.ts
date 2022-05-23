/* eventsystem.ts */

import { BaseEventsSystem, EventMap } from './base'

// ---

export interface DefaultEvents {
  connect: (username: string) => void
  disconnect: (reason: string) => void
}

export class EventSystem<
  Events extends EventMap<Events> = DefaultEvents
> extends BaseEventsSystem<Events> {
  emit<Event extends keyof Events>(
    event: Event,
    ...data: Parameters<Events[Event]>
  ) {
    let subs = this.subscribers.get(event)

    if (subs === undefined) return

    let once_subs = []

    for (let sub of subs) {
      if (sub.flags.once) once_subs.push(sub)
      sub.call(...(data as Parameters<Events[Event]>[]))
    }

    for (let sub of once_subs) this.remove(event, sub)
  }
}
