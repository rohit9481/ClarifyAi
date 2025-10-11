import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParseModule = require("pdf-parse");

// Check if module itself is callable
console.log("Module type:", typeof pdfParseModule);
console.log("Module constructor:", pdfParseModule.constructor);

// Try using it directly (common pattern for pdf-parse)
const testBuffer = Buffer.from("test");
try {
  if (typeof pdfParseModule === 'function') {
    const result = await pdfParseModule(testBuffer);
    console.log("Direct call worked!");
  } else {
    console.log("Module is not a function, checking for parse method...");
    if (pdfParseModule.parse) {
      console.log("Has parse method");
    }
  }
} catch (err) {
  console.log("Error:", err.message);
}
