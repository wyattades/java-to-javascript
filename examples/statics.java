
class MyClass {

  static int x = 1;

  static int getX() {
    return MyClass.x;
  }

  static int getX(boolean please) {
    return please ? MyClass.x : 0;
  }
}
