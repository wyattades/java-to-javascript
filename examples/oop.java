// Package and imports are ignored
package my_package;

import java.awt.*;

// Interfaces and abstract classes are ignored
interface Thing {
  void move(float angle);
  void move(int dx, int dy);
}
abstract class MyAbstract {
  void thing();
}

// Implements is ignored
class Vehicle implements Thing {
  int w, h;
  int x, y;
  
  // Method and constructor names that appear more than once are parsed in a special way
  Vehicle(int size) {
    w = h = size;
  }
  Vehicle(int width, int height) {
    w = width;
    h = height;
  }
  void move(float angle) {
    x += cos(angle);
    y += sin(angle);
  }
  void move(int dx, int dy) {
    x += dx;
    y += dy;
  }
}

class Car extends Vehicle {

  Car() {
    super(24);

    this instanceof Vehicle; // true
  }

  @Overrides
  void move(int dx, int dy) {
    super.move(dx, dy);

    move(0.5);
  }
}
