class Test {
  constructor() {
    let x = 0;
    while (x++ === 0) {
      do {
        myForLoop: for (let i = 0, p = 14; i < 14 && p > 0; i++, p--) {
          if (i >= 10 && i <= 13) {
            switch (i) {
              case 10:
              case 11:
                i++;
                break;
              case 12:
                break myForLoop;
              case 13:
                continue;
            }
          } else {
            if (i === 0) {
              let list = new ArrayList();
              for (const item of list) {}
            } else {
              if (!(x % 2 === 0)) throw 'Assertion Failed';
              if (!(x % 2 === 0)) throw 'Custom message';
            }
          }
        }
      } while (false);
    }
    for (;;) {}
    for (x = 1, x = 2;;) {}
  }
}
