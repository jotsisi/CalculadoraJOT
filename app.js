const display = document.getElementById("display");
const displayHistory = document.getElementById("display-history");
const modeIndicator = document.getElementById("mode-indicator");

let isDeg = false; // false = rad, true = deg

function updateDisplay(value) {
  display.textContent = value;
}

function appendToDisplay(value) {
  if (display.textContent === "0" || display.textContent === "Error") {
    display.textContent = value;
  } else {
    display.textContent += value;
  }
}

function clearDisplay() {
  updateDisplay("0");
  displayHistory.textContent = "";
}

function backspace() {
  if (display.textContent.length <= 1 || display.textContent === "Error") {
    updateDisplay("0");
  } else {
    updateDisplay(display.textContent.slice(0, -1));
  }
}

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function toRadians(x) {
  return isDeg ? (x * Math.PI) / 180 : x;
}

function parseExpression(expr) {
  let parsed = expr;

  parsed = parsed.replace(/π/g, "Math.PI");
  parsed = parsed.replace(/e/g, "Math.E");

  parsed = parsed.replace(/sqrt\(/g, "Math.sqrt(");
  parsed = parsed.replace(/ln\(/g, "Math.log(");
  parsed = parsed.replace(/log10\(/g, "Math.log10(");

  parsed = parsed.replace(/sin\(([^()]*)\)/g, (_, g1) => `Math.sin(toRadians(${g1}))`);
  parsed = parsed.replace(/cos\(([^()]*)\)/g, (_, g1) => `Math.cos(toRadians(${g1}))`);
  parsed = parsed.replace(/tan\(([^()]*)\)/g, (_, g1) => `Math.tan(toRadians(${g1}))`);

  parsed = parsed.replace(/(\d+|\))\s*\^2/g, "Math.pow($1,2)");
  parsed = parsed.replace(/(\d+|\))\s*\^3/g, "Math.pow($1,3)");

  parsed = parsed.replace(/fact\(([^()]*)\)/g, (_, g1) => `factorial(${g1})`);

  parsed = parsed.replace(/1\/x/g, "1/");

  return parsed;
}

function calculate() {
  try {
    const expr = display.textContent;
    const parsed = parseExpression(expr);
    const result = Function("toRadians", "factorial", "Math", `return ${parsed}`)(
      toRadians,
      factorial,
      Math
    );
    displayHistory.textContent = expr + " =";
    if (result === undefined || Number.isNaN(result)) {
      updateDisplay("Error");
    } else {
      updateDisplay(result.toString());
    }
  } catch (e) {
    displayHistory.textContent = "";
    updateDisplay("Error");
  }
}

function toggleMode() {
  isDeg = !isDeg;
  modeIndicator.textContent = isDeg ? "DEG" : "RAD";
}

// Click en botones
document.querySelectorAll(".btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    const value = btn.dataset.value;
    const func = btn.dataset.func;

    if (action === "clear") {
      clearDisplay();
      return;
    }

    if (action === "backspace") {
      backspace();
      return;
    }

    if (action === "equals") {
      calculate();
      return;
    }

    if (action === "toggle-mode") {
      toggleMode();
      return;
    }

    if (value !== undefined) {
      appendToDisplay(value);
      return;
    }

    if (func) {
      if (func === "pi") {
        appendToDisplay("π");
      } else if (func === "e") {
        appendToDisplay("e");
      } else {
        appendToDisplay(func);
      }
    }
  });
});

// Soporte de teclado
const keyMap = {
  "+": "+",
  "-": "-",
  "*": "*",
  "/": "/",
  ".": ".",
  "(": "(",
  ")": ")"
};

document.addEventListener("keydown", (e) => {
  const key = e.key;

  // números
  if (key >= "0" && key <= "9") {
    appendToDisplay(key);
    markKey(key);
    return;
  }

  // operadores básicos
  if (keyMap[key]) {
    appendToDisplay(keyMap[key]);
    markKey(keyMap[key]);
    return;
  }

  if (key === "Enter") {
    e.preventDefault();
    calculate();
    markAction("equals");
    return;
  }

  if (key === "Backspace") {
    backspace();
    markAction("backspace");
    return;
  }

  if (key === "Escape") {
    clearDisplay();
    markAction("clear");
    return;
  }
});

// Marca visual cuando se pulsa desde teclado
function markKey(value) {
  const btn = document.querySelector(`.btn[data-value="${value}"]`);
  if (!btn) return;
  btn.classList.add("key-active");
  setTimeout(() => btn.classList.remove("key-active"), 100);
}

function markAction(action) {
  const btn = document.querySelector(`.btn[data-action="${action}"]`);
  if (!btn) return;
  btn.classList.add("key-active");
  setTimeout(() => btn.classList.remove("key-active"), 100);
}
