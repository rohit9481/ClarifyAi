import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

console.log("PDFParse type:", typeof PDFParse);

// Test with a minimal buffer
const testBuffer = Buffer.from("test");
try {
  const result = await PDFParse(testBuffer);
  console.log("Success!");
} catch (err) {
  console.log("Error:", err.message);
}
