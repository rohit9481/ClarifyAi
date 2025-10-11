import fs from 'fs';
import { execSync } from 'child_process';

// Create a simple DOCX for testing
const content = "Photosynthesis is the process where plants make food from sunlight using chlorophyll.";

// Use echo to create a simple test file
fs.writeFileSync('/home/runner/workspace/public/test-photosynthesis.docx', content);

console.log("Test DOCX created (simple text file with .docx extension for testing)");
console.log("Note: This is not a real DOCX, but mammoth should handle the error gracefully");

// Create a proper PDF using pdfkit
const PDFDocument = (await import('pdfkit')).default;
const doc = new PDFDocument();
const stream = fs.createWriteStream('/home/runner/workspace/public/test-sample.pdf');

doc.pipe(stream);
doc.fontSize(14).text('Photosynthesis Test Document');
doc.moveDown();
doc.fontSize(12).text('Photosynthesis is the process by which plants convert light energy into chemical energy. Chlorophyll absorbs sunlight.');
doc.end();

stream.on('finish', () => {
  console.log("Test PDF created successfully");
});
