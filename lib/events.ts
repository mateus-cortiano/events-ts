/* eventsystem.ts */

import { BaseEventsSystem, EventMap, Listener } from './base'

// ---

export interface DefaultEvents {
  connect: (username: string) => void
  disconnect: (reason: string) => void
}

export class EventSystem<
  Events extends EventMap<Events> = DefaultEvents
> extends BaseEventsSystem<Events> {
  emit<Ev extends keyof Events>(event: Ev, ...data: Parameters<Events[Ev]>) {
    let subs = this.subscribers.get(event)

    if (subs === undefined) return

    let once_subs: Listener<Events[keyof Events]>[] = []

    for (let sub of subs) {
      sub.call(...(data as Events[Ev][]))
      if (sub.flags.once) once_subs.push(sub)
    }

    for (let sub of once_subs) this.remove(event, sub)
  }
}
