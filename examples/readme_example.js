class MyClass {
  constructor(secret) {
    this.x = 42;

    const result = MyClass.y + secret + this.x;
    if (result !== null) {
      purpose();
    }
  }
}
MyClass.y = 'Life';
