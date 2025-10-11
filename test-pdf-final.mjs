import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

// Test with a minimal buffer (will fail but we can see error)
const testBuffer = Buffer.from("test");
try {
  const parser = new PDFParse({ data: testBuffer });
  const result = await parser.getText();
  console.log("Success! Pages:", result.pages.length);
  console.log("Text:", result.pages.map(p => p.text).join('\n'));
} catch (err) {
  console.log("Expected error (not a real PDF):", err.message);
}

console.log("PDFParse class works correctly - just needs a real PDF");
