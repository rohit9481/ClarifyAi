import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

console.log("pdf-parse loaded:", typeof pdfParse);
console.log("pdf-parse is function:", typeof pdfParse === 'function');

// Create a minimal PDF buffer for testing
const testBuffer = Buffer.from("Test");
try {
  const result = await pdfParse(testBuffer);
  console.log("Success! Text:", result.text);
} catch (err) {
  console.log("Error:", err.message);
}
