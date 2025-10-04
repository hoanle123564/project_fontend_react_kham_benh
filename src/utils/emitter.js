import EventEmitter from 'events';

const _emitter = new EventEmitter();
export const emitter = _emitter;