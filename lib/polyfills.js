
export class List extends Array {
  constructor(a) {
    if (Array.isArray(a)) super(...a);
    else super();
  }
  add(a, b) {
    if (arguments.length >= 2) this.splice(a, 0, b);
    else this.push(a);
  }
  addAll(a, b) {
    if (arguments.length >= 2) this.splice(a, 0, ...b);
    else this.push(...b);
  }
  contains(val) { return this.indexOf(val) !== -1; }
  set(i, val) { this[i] = val; }
  get(i) { return this[i] === undefined ? null : this[i]; }
  size() { return this.length; }
  remove(val) {
    if (typeof val === 'number') this.splice(val, 1);
    for(let i = 0; i < this.length; i++) {
      if (this[i] === val) {
        this.splice(i, 1);
        break;
      }
    }
  }
  clear() { this.length = 0; }
  clone() { return new List(this.slice()); }
}

export class ArrayList extends List {}

class Map {
  constructor(a) {
    this.obj = {};
    if (a instanceof Map) Object.assign(this.obj, a.obj);
  }
  containsKey(key) { return key in this.obj; }
  containsValue(val) {
    for (const key in this.obj)
      if (this.obj[key] === val) return true;
    return false;
  }
  put(key, val) { this.obj[key] = val; }
  putAll(obj) { Object.assign(this.obj, obj) }
  get(key) { return this.obj[key] === undefined ? null : this.obj[key]; }
  size() { return Object.keys(this.obj).length; }
  remove(key) { delete this.obj[key]; }
  clear() { this.obj = {}; }
  clone() { return new Map(this); }
  values() { return Object.values(this.obj); }
  keySet() { return Object.keys(this.obj); }
}

export class HashMap extends Map {}
