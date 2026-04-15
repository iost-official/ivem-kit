import EventEmitter from "eventemitter3";

export type Emitter<TEventMap extends Record<string, any>> = {
  on<TEvent extends keyof TEventMap>(
    event: TEvent,
    listener: (data: TEventMap[TEvent]) => void
  ): () => void;
  once<TEvent extends keyof TEventMap>(
    event: TEvent,
    listener: (data: TEventMap[TEvent]) => void
  ): () => void;
  off<TEvent extends keyof TEventMap>(
    event: TEvent,
    listener: (data: TEventMap[TEvent]) => void
  ): void;
  emit<TEvent extends keyof TEventMap>(
    event: TEvent,
    data: TEventMap[TEvent]
  ): void;
  listenerCount<TEvent extends keyof TEventMap>(event: TEvent): number;
  uid: string;
};

let uid = 0;
function getUid() {
  return (++uid).toString();
}

export function createEmitter<TEventMap extends Record<string, any>>(
  uidValue: string = getUid()
): Emitter<TEventMap> {
  const emitter = new EventEmitter();

  return {
    uid: uidValue,
    on(event, listener) {
      emitter.on(event as string, listener);
      return () => emitter.off(event as string, listener);
    },
    once(event, listener) {
      emitter.once(event as string, listener);
      return () => emitter.off(event as string, listener);
    },
    off(event, listener) {
      emitter.off(event as string, listener);
    },
    emit(event, data) {
      emitter.emit(event as string, data);
    },
    listenerCount(event) {
      return emitter.listenerCount(event as string);
    },
  };
}
