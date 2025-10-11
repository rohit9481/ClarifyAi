import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

console.log("Keys:", Object.keys(pdfParse));
console.log("Default:", pdfParse.default);
console.log("Type of default:", typeof pdfParse.default);
