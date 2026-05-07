const passwordOutput = document.getElementById("passwordOutput");
const lengthRange = document.getElementById("lengthRange");
const lengthValue = document.getElementById("lengthValue");
const uppercase = document.getElementById("uppercase");
const lowercase = document.getElementById("lowercase");
const numbers = document.getElementById("numbers");
const symbols = document.getElementById("symbols");
const strengthLabel = document.getElementById("strengthLabel");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");

const characterSets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}<>?"
};

function updateStrength(password) {
  const score = [uppercase.checked, lowercase.checked, numbers.checked, symbols.checked, password.length >= 14].filter(Boolean).length;
  strengthLabel.textContent = score >= 4 ? "Strong" : score >= 3 ? "Medium" : "Weak";
}

function generatePassword() {
  const selectedSets = Object.entries({
    uppercase: uppercase.checked,
    lowercase: lowercase.checked,
    numbers: numbers.checked,
    symbols: symbols.checked
  }).filter(([, enabled]) => enabled).map(([key]) => characterSets[key]);

  if (!selectedSets.length) {
    passwordOutput.value = "Select one option";
    strengthLabel.textContent = "None";
    return;
  }

  const pool = selectedSets.join("");
  let password = "";
  for (let index = 0; index < Number(lengthRange.value); index += 1) {
    password += pool[Math.floor(Math.random() * pool.length)];
  }
  passwordOutput.value = password;
  updateStrength(password);
}

lengthRange.addEventListener("input", () => {
  lengthValue.textContent = lengthRange.value;
  generatePassword();
});

[uppercase, lowercase, numbers, symbols].forEach((input) => input.addEventListener("change", generatePassword));
generateBtn.addEventListener("click", generatePassword);
copyBtn.addEventListener("click", () => navigator.clipboard.writeText(passwordOutput.value));
generatePassword();
