class Vehicle {
  constructor$1(size) {
    this.w = this.h = size;
  }
  constructor$2(width, height) {
    this.w = width;
    this.h = height;
  }
  constructor(...args$) {
    switch (args$.length) {
      case 1:
        return this.constructor$1(...args$);
      case 2:
        return this.constructor$2(...args$);
    }
  }
  move$1(angle) {
    this.x += cos(angle);
    this.y += sin(angle);
  }
  move$2(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
  move(...args$) {
    switch (args$.length) {
      case 1:
        return this.move$1(...args$);
      case 2:
        return this.move$2(...args$);
    }
  }
}

class Car extends Vehicle {
  constructor() {
    super(24);
    this instanceof Vehicle;
  }
  move(dx, dy) {
    super.move(dx, dy);
    this.move(0.5);
  }
}
