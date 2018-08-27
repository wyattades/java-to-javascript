class MyClass {
  int x = 42;
  static String y = "Life";
  
  MyClass(String secret) {
    final String result = MyClass.y + secret + x;
    if (result != null) {
      purpose();
    }
  }
}