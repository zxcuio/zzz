let currentBase = 10;
let isScientific = true;
let currentInput = '0';
let previousValue = null;
let operator = null;

const display = document.getElementById('display');
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
  display.value = currentInput;
}

function appendDigit(d) {
  if (currentInput === '0' && d !== '.') {
    currentInput = d;
  } else {
    currentInput += d;
  }
  updateDisplay();
}

function setOperator(op) {
  previousValue = parseInput(currentInput);
  operator = op;
  currentInput = '0';
}

function calculate() {
  if (operator === null || previousValue === null) return;
  const currentValue = parseInput(currentInput);
  let result;
  switch (operator) {
    case '+':
      result = previousValue + currentValue;
      break;
    case '-':
      result = previousValue - currentValue;
      break;
    case '*':
      result = previousValue * currentValue;
      break;
    case '/':
      result = previousValue / currentValue;
      break;
  }
  currentInput = formatNumber(result);
  previousValue = null;
  operator = null;
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
  const decimalValue = parseInput(currentInput);
  currentBase = currentBase === 10 ? 16 : 10;
  currentInput = formatNumber(decimalValue);
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
    if (val === '.' && currentInput.includes('.')) return;
    if (currentBase === 10 || /[ABCDEF]/.test(val) === false || currentBase === 16) {
      appendDigit(val);
    }
  });
});

document.querySelectorAll('.operator').forEach(btn => {
  btn.addEventListener('click', () => {
    calculate();
    setOperator(btn.getAttribute('data-op'));
  });
});

document.getElementById('equals').addEventListener('click', calculate);

document.getElementById('clear').addEventListener('click', () => {
  currentInput = '0';
  previousValue = null;
  operator = null;
  updateDisplay();
});

document.querySelectorAll('.function').forEach(btn => {
  btn.addEventListener('click', () => {
    applyFunction(btn.getAttribute('data-func'));
  });
});

modeBtn.addEventListener('click', toggleMode);
baseBtn.addEventListener('click', toggleBase);

updateDisplay();
