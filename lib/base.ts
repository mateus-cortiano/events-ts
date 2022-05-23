/* base.ts */

export type EventMap<Events> = {
  [Prop in keyof Events]: Events[Prop]
}

export interface ListenerFlags {
  once?: boolean
}

export interface IListener<T> {
  call: T
  flags: ListenerFlags
}

class Listener<T> implements IListener<T> {
  constructor(public call: T, public flags: ListenerFlags = {}) {}
}

function default_listener<T>(call: T) {
  return new Listener(call)
}

function once_listener<T>(call: T) {
  return new Listener(call, { once: true })
}

export class BaseEventsSystem<Events extends EventMap<Events>> {
  protected subscribers: Map<keyof Events, IListener<Events[keyof Events]>[]>

  constructor() {
    this.subscribers = new Map()
  }

  protected setdefault(event: keyof Events) {
    if (!this.subscribers.has(event)) this.subscribers.set(event, [])
    return this.subscribers.get(event) as IListener<Events[keyof Events]>[]
  }

  on<Ev extends keyof Events>(event: Ev, callback: Events[Ev]) {
    const listener = default_listener(callback)
    this.setdefault(event).push(listener)
    return () => this.remove(event, listener)
  }

  once<Ev extends keyof Events>(event: Ev, callback: Events[Ev]) {
    const listener = once_listener(callback)
    this.setdefault(event).push(listener)
    return () => this.remove(event, listener)
  }

  protected remove<Ev extends keyof Events>(
    event: Ev,
    listener: IListener<Events[Ev]>
  ) {
    let subs = this.subscribers.get(event)
    if (subs === undefined) return
    subs.splice(subs.indexOf(listener), 1)
  }
}
