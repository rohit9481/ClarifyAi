import PDFDocument from 'pdfkit';
import fs from 'fs';

const doc = new PDFDocument();
const outputPath = '/home/runner/workspace/public/sample-photosynthesis.pdf';

// Pipe to a file
doc.pipe(fs.createWriteStream(outputPath));

// Add educational content about photosynthesis
doc.fontSize(16).text('Photosynthesis', { align: 'center' });
doc.moveDown();

doc.fontSize(12).text('Photosynthesis is the process by which plants convert light energy into chemical energy. This fundamental biological process allows plants to create their own food using sunlight, water, and carbon dioxide.');
doc.moveDown();

doc.text('Key Components:');
doc.moveDown(0.5);
doc.text('• Chlorophyll: The green pigment in plants that absorbs sunlight');
doc.text('• Carbon Dioxide: Absorbed from the air through tiny pores called stomata');
doc.text('• Water: Absorbed from the soil through the roots');
doc.text('• Sunlight: Provides the energy needed for the process');
doc.moveDown();

doc.text('The Process:');
doc.moveDown(0.5);
doc.text('Plants use chlorophyll to capture light energy from the sun. This energy is used to convert carbon dioxide from the air and water from the soil into glucose (sugar) and oxygen. The glucose is used by the plant for energy and growth, while oxygen is released as a byproduct into the atmosphere.');
doc.moveDown();

doc.text('Location:');
doc.moveDown(0.5);
doc.text('Photosynthesis occurs in chloroplasts, which are specialized organelles found within plant cells. These chloroplasts contain the chlorophyll that makes plants appear green.');
doc.moveDown();

doc.text('Importance:');
doc.moveDown(0.5);
doc.text('Photosynthesis is essential for life on Earth. It produces oxygen that animals and humans need to breathe, and it forms the base of most food chains. Without photosynthesis, life as we know it would not exist.');

// Finalize the PDF
doc.end();

console.log(`Sample PDF created at: ${outputPath}`);
