import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

console.log("Type of pdfParse:", typeof pdfParse);
console.log("Keys:", Object.keys(pdfParse));
console.log("Default:", pdfParse.default);
console.log("Type of default:", typeof pdfParse.default);

// Test correct usage
const testBuffer = Buffer.from("%PDF-1.4 test");
try {
  if (typeof pdfParse.default === 'function') {
    const result = await pdfParse.default(testBuffer);
    console.log("Default function works!");
  } else if (typeof pdfParse === 'function') {
    const result = await pdfParse(testBuffer);
    console.log("Direct function works!");
  }
} catch (err) {
  console.log("Error:", err.message);
}
