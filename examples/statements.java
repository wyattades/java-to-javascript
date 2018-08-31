class Test {
  Test() {
    int x = 0;
    while(x++ == 0) {
      do {
        myForLoop:
        for (int i = 0, p = 14; i < 14 && p > 0; i++, p--) {
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
          } else if (i == 0) {
            List list = new ArrayList();
            for (List item : list) {}
          } else {
            // assert is not supported in JavaScript, so it will convert to a throw condition
            assert x % 2 == 0;
            assert x % 2 == 0 : "Custom message";
          }
        }
      } while(false);
    }

    // edge cases
    for (;;) {}
    for (x = 1, x = 2;;) {}
  }
}
