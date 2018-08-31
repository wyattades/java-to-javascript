class MyClass {}
MyClass.x = 1;
MyClass.getX$0 = () => {
  return MyClass.x;
};
MyClass.getX$1 = (please) => {
  return please ? MyClass.x : 0;
};
MyClass.getX = (...args$) => {
  switch (args$.length) {
    case 0:
      return MyClass.getX$0(...args$);
    case 1:
      return MyClass.getX$1(...args$);
  }
};
