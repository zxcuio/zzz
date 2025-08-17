let currentBase = 10;
let isScientific = true;
let currentInput = '';
let expression = '';
let memory = 0;

const display = document.getElementById('display');
const expressionDisplay = document.getElementById('expression');
const modeBtn = document.getElementById('toggle-mode');
const baseBtn = document.getElementById('toggle-base');
const hexButtons = document.querySelectorAll('.hex-only');
const hexRow = document.querySelector('.hex-row');
const scientificElems = document.querySelectorAll('.scientific');

function parseInput(str) {
  if (currentBase === 10) {
    return parseFloat(str);
  } else {
    let sign = 1;
    if (str.startsWith('-')) {
      sign = -1;
      str = str.slice(1);
    }
    if (str.includes('.')) {
      const [intPart, fracPart] = str.split('.');
      const intVal = parseInt(intPart || '0', 16);
      let fracVal = 0;
      for (let i = 0; i < fracPart.length; i++) {
        fracVal += parseInt(fracPart[i], 16) / Math.pow(16, i + 1);
      }
      return sign * (intVal + fracVal);
    }
    return sign * parseInt(str || '0', 16);
  }
}

function formatNumber(num) {
  if (currentBase === 10) {
    return String(num);
  }
  return num.toString(16).toUpperCase();
}

function updateDisplay() {
  display.value = currentInput || '0';
  expressionDisplay.textContent = expression;
}

function appendDigit(d) {
  if (d === '.' && currentInput.includes('.')) return;
  if (currentInput === '0' && d !== '.') {
    currentInput = d;
  } else {
    currentInput += d;
  }
  expression += d;
  updateDisplay();
}

function appendOperator(op) {
  if (expression === '' && currentInput === '') return;
  expression += op;
  currentInput = '';
  updateDisplay();
}

function appendParenthesis(p) {
  expression += p;
  updateDisplay();
}

function calculate() {
  if (expression === '') return;
  const tokens = expression.match(/[0-9A-F.]+|[+\-*/()]/g);
  if (!tokens) return;
  const converted = tokens
    .map(t => (/^[0-9A-F.]+$/.test(t) ? parseInput(t) : t))
    .join('');
  let result;
  try {
    result = Function('return ' + converted)();
  } catch (e) {
    result = 0;
  }
  currentInput = formatNumber(result);
  expression = currentInput;
  updateDisplay();
}

function applyFunction(func) {
  const value = parseInput(currentInput);
  let result = value;
  switch (func) {
    case 'sin':
      result = Math.sin(value);
      break;
    case 'cos':
      result = Math.cos(value);
      break;
    case 'tan':
      result = Math.tan(value);
      break;
    case 'log':
      result = Math.log10(value);
      break;
    case 'sqrt':
      result = Math.sqrt(value);
      break;
  }
  currentInput = formatNumber(result);
  expression = currentInput;
  updateDisplay();
}

function toggleMode() {
  isScientific = !isScientific;
  scientificElems.forEach(el => {
    el.style.display = isScientific ? 'flex' : 'none';
  });
  modeBtn.textContent = isScientific ? '標準' : '関数';
}

function toggleBase() {
  const decimalValue = parseInput(currentInput || '0');
  currentBase = currentBase === 10 ? 16 : 10;
  currentInput = formatNumber(decimalValue);
  const tokens = expression.match(/[0-9A-F.]+|[+\-*/()]/g);
  if (tokens) {
    expression = tokens
      .map(t => (/^[0-9A-F.]+$/.test(t) ? formatNumber(parseInput(t)) : t))
      .join('');
  }
  hexRow.style.display = currentBase === 16 ? 'flex' : 'none';
  hexButtons.forEach(btn => {
    btn.style.display = currentBase === 16 ? 'inline-block' : 'none';
  });
  baseBtn.textContent = currentBase === 16 ? 'DEC' : 'HEX';
  updateDisplay();
}

// Event listeners

document.querySelectorAll('.digit').forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.getAttribute('data-value');
    if (currentBase === 10 && /[ABCDEF]/.test(val)) return;
    appendDigit(val);
  });
});

document.querySelectorAll('.operator').forEach(btn => {
  btn.addEventListener('click', () => {
    appendOperator(btn.getAttribute('data-op'));
  });
});

document.getElementById('equals').addEventListener('click', calculate);

document.getElementById('clear').addEventListener('click', () => {
  currentInput = '';
  expression = '';
  updateDisplay();
});

document.getElementById('left-paren').addEventListener('click', () => appendParenthesis('('));
document.getElementById('right-paren').addEventListener('click', () => appendParenthesis(')'));

document.getElementById('mc').addEventListener('click', () => {
  memory = 0;
});

document.getElementById('mr').addEventListener('click', () => {
  currentInput = formatNumber(memory);
  expression += currentInput;
  updateDisplay();
});

document.getElementById('mplus').addEventListener('click', () => {
  memory += parseInput(currentInput || '0');
});

document.getElementById('mminus').addEventListener('click', () => {
  memory -= parseInput(currentInput || '0');
});

document.querySelectorAll('.function').forEach(btn => {
  btn.addEventListener('click', () => {
    applyFunction(btn.getAttribute('data-func'));
  });
});

modeBtn.addEventListener('click', toggleMode);
baseBtn.addEventListener('click', toggleBase);

updateDisplay();
