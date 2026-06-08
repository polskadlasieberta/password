const fs = require('fs');

const COMMON = new Set(
  fs.existsSync("common.txt")
    ? fs.readFileSync("common.txt","utf8").trim().split("\n")
    : ["123456","password","qwerty","123456789","111111","123123"]
);

function analyze(pwd) {
  return {
    len: pwd.length,
    lower: /[a-z]/.test(pwd),
    upper: /[A-Z]/.test(pwd),
    digit: /[0-9]/.test(pwd),
    special: /[^a-zA-Z0-9]/.test(pwd),
    common: COMMON.has(pwd)
  };
}

function rate(m) {
  if (m.common) return { score: 0, cat: "Bardzo słabe (na liście popularnych)" };

  let score = 0;
  if (m.len >= 12) score += 2;
  else if (m.len >= 8) score += 1;

  if (m.lower) score++;
  if (m.upper) score++;
  if (m.digit) score++;
  if (m.special) score++;

  const cat = score <= 2 ? "Słabe"
          : score <= 4 ? "Średnie"
          : score <= 6 ? "Silne"
          : "Bardzo silne";

  return { score, cat };
}

function suggest(m) {
  const out = [];
  if (m.len < 12) out.push("Wydłuż hasło do 12+ znaków.");
  if (!m.lower) out.push("Dodaj małe litery.");
  if (!m.upper) out.push("Dodaj wielkie litery.");
  if (!m.digit) out.push("Dodaj cyfry.");
  if (!m.special) out.push("Dodaj znaki specjalne.");
  if (m.common) out.push("Hasło jest zbyt popularne — zmień je.");
  return out.length ? out : ["Hasło wygląda dobrze."];
}

const pwd = process.argv[2];
if (!pwd) {
  console.log("Użycie: node password-check.js <hasło>");
  process.exit(0);
}

const m = analyze(pwd);
const r = rate(m);
const s = suggest(m);

console.log("=== Analiza hasła ===");
console.log("Długość:", m.len);
console.log("Małe:", m.lower, "Wielkie:", m.upper, "Cyfry:", m.digit, "Specjalne:", m.special);
console.log("Wynik:", r.score);
console.log("Kategoria:", r.cat);
console.log("Sugestie:");
s.forEach(x => console.log(" -", x));
