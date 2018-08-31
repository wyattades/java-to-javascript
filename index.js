const $error = document.getElementById('error');
const $input = document.getElementById('input');
const $output = document.getElementById('output');
const $progress = document.getElementById('progress');
let worker;

const editorOptions = {
  tabSize: 2,
  lineNumbers: true,
};

const inEditor = CodeMirror.fromTextArea($input, Object.assign({
  mode: 'text/x-java',
  placeholder: 'Write Java code here',
}, editorOptions));
inEditor.setValue(window.localStorage.getItem('java2js-editor') || '')
inEditor.setOption('extraKeys', {
  'Ctrl-/': () => inEditor.execCommand('toggleComment'),
});

const outEditor = CodeMirror.fromTextArea($output, Object.assign({
  mode: 'javascript',
  readOnly: true,
}, editorOptions));

const updateProgress = (progress) => {
  if (progress === 0) {
    $progress.classList.add('easing', 'start');
    $progress.style.width = '30%';
  } else {
    $progress.classList.remove('start');
    $progress.style.width = (progress * 100) + '%';
  }
};

let options = {};
try {
  const opt = JSON.parse(window.localStorage.getItem('java2js-options'));
  if (opt && typeof opt === 'object') options = opt;
} catch(_) {}


const handleError = (e) => {
  outEditor.setValue('');
  $progress.classList.add('error');
  $error.classList.add('active');
  $error.innerText = e;
};

const setResult = (str) => {
  outEditor.setValue(str);
  $error.classList.remove('active');  

  if (!str) {
    $progress.classList.remove('easing', 'start');
    $progress.style.width = 0;
  }
};

let converting = false;

const convert = () => {
  $error.classList.remove('active');
  $progress.classList.remove('error', 'easing', 'start');
  $progress.style.width = 0;

  setTimeout(() => {
    const javaString = inEditor.getValue().trim();
    if (javaString) {
      if (worker) {
        converting = true;
        worker.postMessage([ 'convert', javaString, options ]);
      } else {
        try {
          setResult(window.javaToJavascript(javaString, options, updateProgress));
        } catch(e) {
          handleError(e);
        }
      }
    } else {
      setResult('');
    }
  }, 100);
};

const setWorker = () => {
  if (worker) worker.terminate();
  worker = new Worker('worker.js');
  worker.onmessage = ({ data: [ cmd, data ] }) => {
    if (cmd === 'progress') updateProgress(data);
    else if (cmd === 'result') setResult(data);
    else if (cmd === 'error') handleError(data);

    if (cmd === 'result' || cmd === 'error') {
      converting = false;
    }
  };
}

if (window.Worker) {
  setWorker();
  convert();
} else {
  // Synchronously load java-to-javascript
  const s = document.createElement('script');
  s.onload = () => convert();
  s.src = 'https://unpkg.com/java-to-javascript/build/java-to-javascript.min.js';
  s.type = 'text/javascript';
  document.head.appendChild(s);
}

const updateOptions = (e) => {
  const el = e.target;
  const key = el.getAttribute('name');
  let val;
  if (key === 'p5') val = el.checked;
  else if (key === 'globalScope') val = el.value;
  else if (key === 'globalVars') {
    try {
      const _val = JSON.parse(el.value);
      val = (_val && typeof _val === 'object') ? _val : null;
    } catch(_) {
      val = null;
    }
  }
  options[key] = val;
  window.localStorage.setItem('java2js-options', JSON.stringify(options));
  convert();
};
document.querySelectorAll('#menu [name]').forEach((el) => {
  const key = el.getAttribute('name');
  if (options[key]) {
    if (key === 'p5') el.checked = !!options[key];
    else if (key === 'globalScope') el.value = options[key];
    else if (key === 'globalVars') el.value = JSON.stringify(options[key]);
  }

  el.addEventListener('change', updateOptions);
});

let timeout;
inEditor.on('change', () => {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    window.localStorage.setItem('java2js-editor', inEditor.getValue());
    if (worker && converting) {
      setWorker();
    }
    convert();
  }, 900);
});
