class MyClass {
  constructor() {}
}
MyClass.x = 1;
MyClass.getX = (please) => {
  return please ? MyClass.x : 0;
};
