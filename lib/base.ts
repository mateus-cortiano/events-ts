/* base.ts */

export type EventMap<Events> = {
  [Prop in keyof Events]: Events[Prop]
}

export interface ListenerFlags {
  once?: boolean
}

export interface Listener<T> {
  call: T
  flags: ListenerFlags
}

export class BaseEventsSystem<Events extends EventMap<Events>> {
  protected subscribers: Map<keyof Events, Listener<Events[keyof Events]>[]>

  constructor() {
    this.subscribers = new Map()
  }

  protected setdefault(event: keyof Events) {
    let subs = this.subscribers.get(event)
    if (subs === undefined) {
      this.subscribers.set(event, [])
      subs = this.subscribers.get(event)
    }
    return subs as Listener<Events[keyof Events]>[]
  }

  on<Ev extends keyof Events>(event: Ev, callback: Events[Ev]) {
    const listener = { call: callback, flags: {} }
    this.setdefault(event).push(listener)
    return () => this.remove(event, listener)
  }

  once<Ev extends keyof Events>(event: Ev, callback: Events[Ev]) {
    const listener = { call: callback, flags: { once: true } }
    this.setdefault(event).push(listener)
    return () => this.remove(event, listener)
  }

  protected remove<Ev extends keyof Events>(
    event: Ev,
    listener: Listener<Events[Ev]>
  ) {
    let subs = this.subscribers.get(event)
    if (subs === undefined) return
    subs.splice(subs.indexOf(listener), 1)
  }
}
