
const testJava = `
  class Wow {

    Wow() {
      int y = 123;
    }

    float myFunc(float x) {
      return x * x * (2.0f + x);
    }
  }
`;

test('Minified build parses some Java code correctly', () => {

  const minBuild = require('../build/java-to-javascript.min.js');

  const result = minBuild(testJava);

  expect(typeof result).toBe('string');
});

test('Non-minified build parses some Java code correctly', () => {

  const build = require('../build/java-to-javascript.js');

  const result = build(testJava);

  expect(typeof result).toBe('string');
});
