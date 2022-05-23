/* base.ts */

type Callable = (...any: any) => any

export type EventMap<Events> = {
  [Event in keyof Events]: Events[Event]
}

export interface ListenerFlags {
  once?: boolean
}

export interface Listener_I<T extends Callable> {
  call: T
  flags: ListenerFlags
}

class Listener<T extends Callable> implements Listener_I<T> {
  constructor(public call: T, public flags: ListenerFlags = {}) {}
}

function default_listener<T extends Callable>(call: T) {
  return new Listener(call)
}

function once_listener<T extends Callable>(call: T) {
  return new Listener(call, { once: true })
}

export class BaseEventsSystem<Events extends EventMap<Events>> {
  protected subscribers: Map<keyof Events, Listener_I<Events[keyof Events]>[]>

  constructor() {
    this.subscribers = new Map()
  }

  protected setdefault(event: keyof Events) {
    if (!this.subscribers.has(event)) this.subscribers.set(event, [])
    return this.subscribers.get(event) as Listener_I<Events[keyof Events]>[]
  }

  on<Event extends keyof Events>(event: Event, callback: Events[Event]) {
    const listener = default_listener(callback)
    this.setdefault(event).push(listener)
    return () => this.remove(event, listener)
  }

  once<Event extends keyof Events>(event: Event, callback: Events[Event]) {
    const listener = once_listener(callback)
    this.setdefault(event).push(listener)
    return () => this.remove(event, listener)
  }

  protected remove<Event extends keyof Events>(
    event: Event,
    listener: Listener_I<Events[Event]>
  ) {
    let subs = this.subscribers.get(event)
    if (subs === undefined) return
    subs.splice(subs.indexOf(listener), 1)
  }
}
