// 現在の基数（10進数または16進数）
let currentBase = 10;
// 関数電卓モードかどうか
let isScientific = true;
// 現在入力中の値
let currentInput = '';
// これまでに入力された式
let expression = '';
// メモリに保存された値
let memory = 0;

// 画面上の各種要素を取得
const display = document.getElementById('display');
const expressionDisplay = document.getElementById('expression');
const modeBtn = document.getElementById('toggle-mode');
const baseBtn = document.getElementById('toggle-base');
const hexButtons = document.querySelectorAll('.hex-only');
const hexRow = document.querySelector('.hex-row');
const scientificElems = document.querySelectorAll('.scientific');

// 入力された文字列を現在の基数に応じて数値に変換
function parseInput(str) {
  if (currentBase === 10) {
    // 10進数の場合はそのまま数値に変換
    return parseFloat(str);
  } else {
    let sign = 1;
    // 先頭がマイナスなら符号を記録して除去
    if (str.startsWith('-')) {
      sign = -1;
      str = str.slice(1);
    }
    if (str.includes('.')) {
      // 小数点で整数部と小数部に分割
      const [intPart, fracPart] = str.split('.');
      // 整数部を16進数として変換
      const intVal = parseInt(intPart || '0', 16);
      let fracVal = 0;
      // 小数部を各桁ごとに10進数へ変換して加算
      for (let i = 0; i < fracPart.length; i++) {
        fracVal += parseInt(fracPart[i], 16) / Math.pow(16, i + 1);
      }
      // 符号を適用して結果を返す
      return sign * (intVal + fracVal);
    }
    // 小数部がない場合は整数部のみ変換
    return sign * parseInt(str || '0', 16);
  }
}

// 数値を現在の基数の文字列表現に変換
function formatNumber(num) {
  if (currentBase === 10) {
    // 10進数はそのまま文字列化
    return String(num);
  }
  // 16進数に変換し、大文字に統一
  return num.toString(16).toUpperCase();
}

// 入力値と式を画面に表示
function updateDisplay() {
  // 現在入力中の値を表示、空なら0
  display.value = currentInput || '0';
  // これまでの式を表示
  expressionDisplay.textContent = expression;
}

// 数字や小数点を現在の入力に追加
function appendDigit(d) {
  // 小数点が既に含まれている場合は追加しない
  if (d === '.' && currentInput.includes('.')) return;
  if (currentInput === '0' && d !== '.') {
    // 先頭が0の場合は置き換える
    currentInput = d;
  } else {
    // 末尾に文字を追加
    currentInput += d;
  }
  // 式にも同じ文字を追加
  expression += d;
  // 表示を更新
  updateDisplay();
}

// 演算子を式に追加
function appendOperator(op) {
  // 何も入力されていない場合は無視
  if (expression === '' && currentInput === '') return;
  // 式に演算子を追加
  expression += op;
  // 新しい数値入力のためにリセット
  currentInput = '';
  // 表示を更新
  updateDisplay();
}

// 括弧を式に追加
function appendParenthesis(p) {
  // 式に括弧を追加
  expression += p;
  // 表示を更新
  updateDisplay();
}

// バックスペースで1文字削除
function handleBackspace() {
  if (expression === '') return;
  // 式の末尾を削除
  expression = expression.slice(0, -1);
  // 式末尾に残る数値部分を現在の入力として取得
  const match = expression.match(/[0-9A-F.]+$/);
  currentInput = match ? match[0] : '';
  updateDisplay();
}

// 式を評価して結果を計算
function calculate() {
  // 式が空なら何もしない
  if (expression === '') return;
  // 数字と演算子に分割
  const tokens = expression.match(/[0-9A-F.]+|[+\-*/()]/g);
  if (!tokens) return;
  // 各トークンを10進数に変換
  const converted = tokens
    .map(t => (/^[0-9A-F.]+$/.test(t) ? parseInput(t) : t))
    .join('');
  let result;
  try {
    // 変換後の式を評価
    result = Function('return ' + converted)();
  } catch (e) {
    // エラー時は0を返す
    result = 0;
  }
  // 結果を現在の基数で文字列化
  currentInput = formatNumber(result);
  // 式を結果で置き換える
  expression = currentInput;
  // 表示を更新
  updateDisplay();
}

// 三角関数や平方根などの関数を適用
function applyFunction(func) {
  // 現在の入力を数値に変換
  const value = parseInput(currentInput);
  let result = value;
  // 選択された関数を適用
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
  // 結果を表示用に変換
  currentInput = formatNumber(result);
  expression = currentInput;
  updateDisplay();
}

// 標準モードと関数モードを切り替え
function toggleMode() {
  // モードを反転
  isScientific = !isScientific;
  // 関数ボタンの表示を切り替え
  scientificElems.forEach(el => {
    el.style.display = isScientific ? 'flex' : 'none';
  });
  // ボタンの表示テキストを更新
  modeBtn.textContent = isScientific ? '標準' : '関数';
}

// 10進数と16進数の表示を切り替え
function toggleBase() {
  // 現在の入力を10進数に変換して保持
  const decimalValue = parseInput(currentInput || '0');
  // 基数を切り替え
  currentBase = currentBase === 10 ? 16 : 10;
  // 新しい基数で入力を表示
  currentInput = formatNumber(decimalValue);
  // 式内の数値も新しい基数に変換
  const tokens = expression.match(/[0-9A-F.]+|[+\-*/()]/g);
  if (tokens) {
    expression = tokens
      .map(t => (/^[0-9A-F.]+$/.test(t) ? formatNumber(parseInput(t)) : t))
      .join('');
  }
  // 16進数専用ボタンの表示を切り替え
  hexRow.style.display = currentBase === 16 ? 'flex' : 'none';
  hexButtons.forEach(btn => {
    btn.style.display = currentBase === 16 ? 'inline-block' : 'none';
  });
  // 切り替えボタンのラベルを更新
  baseBtn.textContent = currentBase === 16 ? 'DEC' : 'HEX';
  // 表示を更新
  updateDisplay();
}

// 各種ボタンのイベントリスナー

// 数字ボタン
document.querySelectorAll('.digit').forEach(btn => {
  btn.addEventListener('click', () => {
    // ボタンの値を取得
    const val = btn.getAttribute('data-value');
    // 10進数モードで16進数の文字が押された場合は無視
    if (currentBase === 10 && /[ABCDEF]/.test(val)) return;
    // 値を入力に追加
    appendDigit(val);
  });
});

// 演算子ボタン
document.querySelectorAll('.operator').forEach(btn => {
  btn.addEventListener('click', () => {
    // クリックされた演算子を追加
    appendOperator(btn.getAttribute('data-op'));
  });
});

// イコールボタン
document.getElementById('equals').addEventListener('click', calculate);

// クリアボタン
document.getElementById('clear').addEventListener('click', () => {
  // 入力と式をリセット
  currentInput = '';
  expression = '';
  // 表示を更新
  updateDisplay();
});

// 括弧ボタン
document.getElementById('left-paren').addEventListener('click', () => appendParenthesis('('));
document.getElementById('right-paren').addEventListener('click', () => appendParenthesis(')'));

// メモリをクリア
document.getElementById('mc').addEventListener('click', () => {
  // メモリを0にリセット
  memory = 0;
});

// メモリ値を呼び出し
document.getElementById('mr').addEventListener('click', () => {
  // メモリの値を入力に設定
  currentInput = formatNumber(memory);
  // 式に追加
  expression += currentInput;
  // 表示を更新
  updateDisplay();
});

// メモリに加算
document.getElementById('mplus').addEventListener('click', () => {
  // 現在の入力をメモリに加算
  memory += parseInput(currentInput || '0');
});

// メモリから減算
document.getElementById('mminus').addEventListener('click', () => {
  // 現在の入力をメモリから減算
  memory -= parseInput(currentInput || '0');
});

// 関数ボタン
document.querySelectorAll('.function').forEach(btn => {
  btn.addEventListener('click', () => {
    // 選択された関数を適用
    applyFunction(btn.getAttribute('data-func'));
  });
});

// モード切替ボタンと基数切替ボタン
modeBtn.addEventListener('click', toggleMode);
baseBtn.addEventListener('click', toggleBase);

// キーボード入力に対応
document.addEventListener('keydown', e => {
  const key = e.key;

  // 数字入力
  if (/^[0-9]$/.test(key)) {
    appendDigit(key);
    const btn = document.querySelector(`button[data-value="${key}"]`);
    burstFromElement(btn);
    return;
  }

  const upper = key.toUpperCase();
  // 16進数入力
  if (currentBase === 16 && /^[A-F]$/.test(upper)) {
    appendDigit(upper);
    const btn = document.querySelector(`button[data-value="${upper}"]`);
    burstFromElement(btn);
    return;
  }

  switch (key) {
    case '.':
      appendDigit('.');
      burstFromElement(document.querySelector('button[data-value="."]'));
      break;
    case '+':
    case '-':
    case '*':
    case '/':
      appendOperator(key);
      burstFromElement(document.querySelector(`button[data-op="${key}"]`));
      break;
    case '(':
      appendParenthesis('(');
      burstFromElement(document.getElementById('left-paren'));
      break;
    case ')':
      appendParenthesis(')');
      burstFromElement(document.getElementById('right-paren'));
      break;
    case 'Enter':
    case '=':
      e.preventDefault();
      calculate();
      burstFromElement(document.getElementById('equals'));
      break;
    case 'Backspace':
      e.preventDefault();
      handleBackspace();
      break;
    case 'Escape':
    case 'c':
    case 'C':
      currentInput = '';
      expression = '';
      updateDisplay();
      burstFromElement(document.getElementById('clear'));
      break;
    default:
      break;
  }
});

// ボタンに虹色パーティクルを付与
function createParticle(x, y) {
  const particle = document.createElement('span');
  particle.className = 'particle';
  const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
  particle.style.background = color;
  particle.style.left = `${x - 4}px`;
  particle.style.top = `${y - 4}px`;
  const angle = Math.random() * Math.PI * 2;
  const distance = 80 * Math.random() + 20;
  particle.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
  particle.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
  document.body.appendChild(particle);
  particle.addEventListener('animationend', () => particle.remove());
}


  });
});

updateDisplay();
