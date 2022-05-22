/* eventsystem.ts */

type EventMap<Events> = {
  [Prop in keyof Events]: Events[Prop]
}

interface ListenerFlags {
  once?: boolean
}

interface Listener<T> {
  callback: T
  flags: ListenerFlags
}

export interface BaseEvents {
  connect: (username: string) => void
  disconnect: (reason: string) => void
}

export class EventSystem<Events extends EventMap<Events> = BaseEvents> {
  private subscribers: Map<keyof Events, Listener<Events[keyof Events]>[]>

  constructor() {
    this.subscribers = new Map()
  }

  private setdefault(event: keyof Events) {
    let subs = this.subscribers.get(event)
    if (subs === undefined) {
      this.subscribers.set(event, [])
      subs = this.subscribers.get(event)
    }
    return subs as Listener<Events[keyof Events]>[]
  }

  on<Ev extends keyof Events>(event: Ev, callback: Events[Ev]) {
    let listener = { callback: callback, flags: {} }
    this.setdefault(event).push(listener)
    return () => this.remove(event, listener)
  }

  once<Ev extends keyof Events>(event: Ev, callback: Events[Ev]) {
    let listener = { callback: callback, flags: { once: true } }
    this.setdefault(event).push(listener)
    return () => this.remove(event, listener)
  }

  emit<Ev extends keyof Events>(event: Ev, ...data: Parameters<Events[Ev]>) {
    let subs = this.subscribers.get(event)

    if (subs === undefined) return

    let once_subs: Listener<Events[keyof Events]>[] = []

    for (let sub of subs) {
      sub.callback(...(data as Events[Ev][]))
      if (sub.flags.once) once_subs.push(sub)
    }

    for (let sub of once_subs) this.remove(event, sub)
  }

  private remove<Ev extends keyof Events>(
    event: Ev,
    listener: Listener<Events[Ev]>
  ) {
    let subs = this.subscribers.get(event)
    if (subs === undefined) return
    subs.splice(subs.indexOf(listener), 1)
  }
}
