#!/usr/bin/env node
/**
 * build-data.js - Game of Life Budget Dashboard Data Builder
 *
 * Reads the CSV export of the GoL Programming roster and outputs
 * src/data/students.json for the React dashboard.
 *
 * Usage:
 *   npm run build-data
 *   node scripts/build-data.js data/master.csv
 *   node scripts/build-data.js data/master.csv --output src/data/students.json
 *
 * CSV column mapping (by spreadsheet letter):
 *   A: Section Name       D: <<sid>>          G: First Name
 *   H: Email Address      I: <<lname>>        K: title1 (program)
 *   T: <gross>> (3rd)     V: <<bennies>>      X: <<fedtaxes>>
 *   Y: <<statetaxes>>     AA: <<annualnet>>   AB: <<monthlynet>>
 *   AH-AK: <<b1>>-<<b4>> (benefits)
 *
 * Values are currency-formatted ("$69,360.00") and parsed automatically.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { basename, dirname, join } from "path";
import { fileURLToPath } from "url";
import Papa from "papaparse";

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const inputFile = args.find((a) => !a.startsWith("--")) || "data/master.csv";
const outputIdx = args.indexOf("--output");
const outputFile =
  outputIdx !== -1 && args[outputIdx + 1]
    ? args[outputIdx + 1]
    : join(__dirname, "..", "src", "data", "students.json");

if (!existsSync(inputFile)) {
  console.error(`\n  File not found: ${inputFile}`);
  console.error(`  Place your roster CSV export at: data/master.csv\n`);
  process.exit(1);
}

console.log(`\nReading: ${inputFile}`);

// Parse with header: false because duplicate column names exist
const raw = readFileSync(inputFile, "utf-8");
const { data: rows, errors } = Papa.parse(raw, {
  header: false,
  skipEmptyLines: true,
});

if (errors.length > 0) {
  console.warn(`  CSV warnings: ${errors.length}`);
  errors.slice(0, 3).forEach((e) => console.warn(`    ${e.message}`));
}

const headers = rows.shift();
console.log(`  ${rows.length} data rows, ${headers.length} columns`);

// ── Column index finder ─────────────────────────────────────
function colIdx(name, nth = 1) {
  let count = 0;
  for (let i = 0; i < headers.length; i++) {
    if (headers[i] === name) { count++; if (count === nth) return i; }
  }
  return -1;
}

// Map columns. <gross>> appears 3 times; we want the 3rd (col T).
const C = {
  section:     colIdx("Section Name"),
  facLast:     colIdx("Faculty Last Name"),
  facFirst:    colIdx("Faculty First Name"),
  sid:         colIdx("<<sid>>"),
  sectionS:    colIdx("<<s>>"),
  firstName:   colIdx("First Name"),
  email:       colIdx("Email Address"),
  lastName:    colIdx("<<lname>>"),
  degree:      colIdx("Degree Level"),
  program:     colIdx("title1"),
  degreeTag:   colIdx("<<degtag>>"),
  activeProgs: colIdx("Active Programs in Term"),
  degreeFull:  colIdx("<<degree>>"),
  gross:       colIdx("<gross>>", 3),      // 3rd occurrence = col T
  benefits:    colIdx("<<bennies>>"),      // col V
  fedTax:      colIdx("<<fedtaxes>>"),     // col X
  stateTax:    colIdx("<<statetaxes>>"),   // col Y
  annualNet:   colIdx("<<annualnet>>"),    // col AA
  monthlyNet:  colIdx("<<monthlynet>>"),   // col AB
  b1:          colIdx("<<b1>>"),
  b2:          colIdx("<<b2>>"),
  b3:          colIdx("<<b3>>"),
  b4:          colIdx("<<b4>>"),
};

// Print mapping
console.log("  Column mapping:");
for (const [key, idx] of Object.entries(C)) {
  if (idx < 0) { console.log(`    ${key.padEnd(14)} → NOT FOUND`); continue; }
  const letter = idx < 26
    ? String.fromCharCode(65 + idx)
    : String.fromCharCode(64 + Math.floor(idx / 26)) + String.fromCharCode(65 + idx % 26);
  console.log(`    ${key.padEnd(14)} → ${letter} (${idx})`);
}

// Validate
for (const key of ["sid", "firstName", "monthlyNet", "gross"]) {
  if (C[key] < 0) {
    console.error(`\n  MISSING column: ${key}. Check your CSV headers.\n`);
    process.exit(1);
  }
}

// ── Helpers ─────────────────────────────────────────────────
// Parse "$69,360.00" → 69360.00
function money(val) {
  if (!val) return 0;
  const n = parseFloat(String(val).replace(/[$,\s]/g, ""));
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

function str(row, key) {
  const i = C[key];
  return i >= 0 && i < row.length ? (row[i] || "").trim() : "";
}

function num(row, key) {
  return money(str(row, key));
}

// ── Build records ───────────────────────────────────────────
const seen = new Set();
const students = [];
let skipped = 0;

for (const row of rows) {
  const sid = parseInt(str(row, "sid"), 10);
  if (!sid || isNaN(sid)) { skipped++; continue; }
  if (seen.has(sid)) continue;
  seen.add(sid);

  const bens = [str(row, "b1"), str(row, "b2"), str(row, "b3"), str(row, "b4")]
    .filter(Boolean);

  students.push({
    studentId:      String(sid),
    firstName:      str(row, "firstName"),
    lastName:       str(row, "lastName"),
    email:          str(row, "email"),
    section:        str(row, "section"),
    sectionShort:   str(row, "sectionS"),
    facultyFirst:   str(row, "facFirst"),
    facultyLast:    str(row, "facLast"),
    degreeLevel:    str(row, "degree"),
    programTitle:   str(row, "program"),
    degreeTag:      str(row, "degreeTag"),
    activePrograms: str(row, "activeProgs"),
    degreeFull:     str(row, "degreeFull"),
    grossIncome:    num(row, "gross"),
    benefitsPremium:num(row, "benefits"),
    federalTax:     num(row, "fedTax"),
    stateTax:       num(row, "stateTax"),
    annualNet:      num(row, "annualNet"),
    monthlyNet:     num(row, "monthlyNet"),
    benefits:       bens,
  });
}

students.sort((a, b) => {
  const s = a.section.localeCompare(b.section);
  return s !== 0 ? s : a.lastName.localeCompare(b.lastName);
});

console.log(`\n  ${students.length} unique students (${skipped} non-student rows skipped)`);

// Sanity check
console.log("\n  Sample:");
for (const s of students.slice(0, 3)) {
  console.log(`    ${s.firstName} ${s.lastName} | gross: $${s.grossIncome.toLocaleString()} | monthly net: $${s.monthlyNet.toLocaleString()}`);
}

const bad = students.filter(s => s.monthlyNet <= 0);
if (bad.length > 0) {
  console.warn(`\n  WARNING: ${bad.length} student(s) with $0 or negative monthly net:`);
  bad.slice(0, 5).forEach(s => console.warn(`    ${s.firstName} ${s.lastName}: gross=$${s.grossIncome}, net=$${s.monthlyNet}`));
}

// ── Output ──────────────────────────────────────────────────
const sections = [...new Set(students.map(s => s.section))].sort();
const programs = [...new Set(students.map(s => s.programTitle))].sort();

const output = {
  meta: {
    generatedAt: new Date().toISOString(),
    sourceFile: basename(inputFile),
    totalStudents: students.length,
    sections,
    programs,
  },
  students,
};

const outDir = dirname(outputFile);
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(outputFile, JSON.stringify(output, null, 2));

console.log(`\n  Wrote ${students.length} students → ${outputFile}`);
console.log(`  Sections: ${sections.length} | Programs: ${programs.length}`);
console.log(`\n  Done! Run 'npm run dev' to see the dashboard.\n`);
