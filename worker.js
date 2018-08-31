importScripts('https://unpkg.com/java-to-javascript/build/java-to-javascript.min.js');

self.onmessage = ({ data: [ cmd, data, options ] }) => {
  if (cmd === 'convert') {
    try {
      const result = self.javaToJavascript(data, options, (progress) => {
        self.postMessage([ 'progress', progress ]);
      });
      self.postMessage([ 'result', result ]);
    } catch (e) {
      self.postMessage([ 'error', e.message ]);
    }
  }
};
