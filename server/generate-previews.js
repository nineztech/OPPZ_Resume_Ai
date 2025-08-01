import { generateAllPreviews, updateTemplatePaths } from './utils/templateRenderer.js';

console.log('🚀 Starting template preview generation...');

try {
  // Generate all preview images from JSON templates
  await generateAllPreviews();
  
  // Update JSON files with correct preview paths
  updateTemplatePaths();
  
  console.log('✅ All previews generated successfully!');
  console.log('📁 Check the templates/assets/previews/ directory for generated images.');
  
} catch (error) {
  console.error('❌ Error generating previews:', error);
  process.exit(1);
} 