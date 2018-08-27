
// List
class List extends Array {
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
  get(i) { return this[i] || null; }
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
  clone() { return new ArrayList(this.slice()); }
}

// ArrayList
class ArrayList extends List {}
