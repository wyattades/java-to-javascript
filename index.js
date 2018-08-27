const $error = document.getElementById('error');
const $input = document.getElementById('input');
const $output = document.getElementById('output');
const $progress = document.getElementById('progress');

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
})

const outEditor = CodeMirror.fromTextArea($output, Object.assign({
  mode: 'javascript',
  readOnly: true,
}, editorOptions));

const updateProgress = (progress) => {
  if (progress === 0) progress = 0.4;
  $progress.style.width = (progress * 100) + '%';
};

let options = {};
try {
  const opt = JSON.parse(window.localStorage.getItem('java2js-options'));
  if (opt && typeof opt === 'object') options = opt;
} catch(_) {}


const convert = () => {
  const javaString = inEditor.getValue();
  if (javaString) {
    try {
      const jsString = window.javaToJavascript(javaString, options, updateProgress);
      outEditor.setValue(jsString);
      $error.classList.remove('active');
    } catch(e) {
      // console.error(e);
      $error.classList.add('active');
      if (e.name === 'SyntaxError') $error.innerText = `SyntaxError around line ${e.location.start.line}: ${e.message}`;
      else $error.innerText = `Error: ${e}`;
    }
  } else {
    outEditor.setValue('');
    $progress.style.width = 0;
  }
};
convert();

const updateOptions = (e) => {
  const el = e.target;
  const key = el.getAttribute('name');
  let val;
  if (key === 'p5') val = el.checked;
  else if (key === 'globalScope') val = el.value;
  else {
    try {
      const _val = JSON.parse(el.value);
      if (_val && typeof _val === 'object') val = _val;
    } catch(_) {}
  }
  options[key] = val;
  window.localStorage.setItem('java2js-options', JSON.stringify(options));
  convert();
};
document.querySelectorAll('#menu input').forEach((el) => {
  el.addEventListener('change', updateOptions);
});

inEditor.on('change', () => {
  window.localStorage.setItem('java2js-editor', inEditor.getValue());
  convert();
});
