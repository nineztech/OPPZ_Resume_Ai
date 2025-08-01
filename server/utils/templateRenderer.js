import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Generate preview image from template JSON data
export const generateTemplatePreview = async (templateData, outputPath) => {
  try {
    // Create HTML from template data
    const html = generateHTMLFromTemplate(templateData);
    
    // Launch browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set viewport for consistent image size
    await page.setViewport({ width: 600, height: 800 });
    
    // Load HTML content
    await page.setContent(html);
    
    // Wait for content to render
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await page.screenshot({
      path: outputPath,
      type: 'png',
      fullPage: false
    });
    
    await browser.close();
    console.log(`✅ Preview generated: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error generating preview:', error);
    throw error;
  }
};

// Generate HTML from template JSON data
const generateHTMLFromTemplate = (template) => {
  const { settings, sections, layout } = template;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: ${settings.fontFamily}; 
          font-size: ${settings.fontSize}; 
          line-height: ${settings.lineHeight};
          color: ${settings.textColor};
          background: ${settings.backgroundColor};
        }
        .resume-container {
          max-width: ${layout.maxWidth};
          margin: 0 auto;
          padding: 0;
        }
        .header {
          background: ${settings.primaryColor};
          color: white;
          padding: 2rem;
          text-align: center;
        }
        .name { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
        .title { font-size: 1.25rem; margin-bottom: 1rem; }
        .section {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: ${settings.primaryColor};
          margin-bottom: 1rem;
          text-transform: uppercase;
        }
        .experience-item {
          margin-bottom: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 4px;
          border-left: 4px solid ${settings.primaryColor};
        }
        .experience-title { font-weight: 600; font-size: 1rem; }
        .experience-company { color: ${settings.primaryColor}; font-size: 0.875rem; }
        .experience-duration { font-size: 0.75rem; color: #6b7280; }
        .placeholder-text {
          color: #9ca3af;
          font-style: italic;
          text-align: center;
          padding: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="resume-container">
        <div class="header">
          <div class="name">John Doe</div>
          <div class="title">Senior Software Engineer</div>
          <div>john.doe@email.com • (555) 123-4567 • New York, NY</div>
        </div>
        
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <div class="placeholder-text">
            Experienced software engineer with 8+ years developing scalable web applications...
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Work Experience</div>
          <div class="experience-item">
            <div class="experience-title">Senior Software Engineer</div>
            <div class="experience-company">Tech Company Inc.</div>
            <div class="experience-duration">2020 - Present</div>
            <div class="placeholder-text">
              Led development of microservices architecture...
            </div>
          </div>
          <div class="experience-item">
            <div class="experience-title">Software Engineer</div>
            <div class="experience-company">Startup XYZ</div>
            <div class="experience-duration">2018 - 2020</div>
            <div class="placeholder-text">
              Developed full-stack web applications...
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Education</div>
          <div class="experience-item">
            <div class="experience-title">Bachelor of Science in Computer Science</div>
            <div class="experience-company">University of Technology</div>
            <div class="experience-duration">2014 - 2018</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate all template previews
export const generateAllPreviews = async () => {
  const templatesDir = path.join(process.cwd(), 'templates');
  const previewsDir = path.join(templatesDir, 'assets', 'previews');
  
  // Ensure previews directory exists
  if (!fs.existsSync(previewsDir)) {
    fs.mkdirSync(previewsDir, { recursive: true });
  }
  
  // Read all template JSON files
  const categories = ['modern', 'creative', 'traditional', 'minimal', 'professional', 'simple'];
  
  for (const category of categories) {
    const categoryDir = path.join(templatesDir, category);
    if (!fs.existsSync(categoryDir)) continue;
    
    const files = fs.readdirSync(categoryDir).filter(file => file.endsWith('.json'));
    
    for (const file of files) {
      const templatePath = path.join(categoryDir, file);
      const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      
      const previewName = file.replace('.json', '.png');
      const previewPath = path.join(previewsDir, previewName);
      
      console.log(`🔄 Generating preview for ${templateData.name}...`);
      await generateTemplatePreview(templateData, previewPath);
    }
  }
  
  console.log('✅ All template previews generated!');
};

// Update template JSON files with correct preview paths
export const updateTemplatePaths = () => {
  const templatesDir = path.join(process.cwd(), 'templates');
  const categories = ['modern', 'creative', 'traditional', 'minimal', 'professional', 'simple'];
  
  for (const category of categories) {
    const categoryDir = path.join(templatesDir, category);
    if (!fs.existsSync(categoryDir)) continue;
    
    const files = fs.readdirSync(categoryDir).filter(file => file.endsWith('.json'));
    
    for (const file of files) {
      const templatePath = path.join(categoryDir, file);
      const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      
      const previewName = file.replace('.json', '.png');
      const previewPath = `templates/assets/previews/${previewName}`;
      
      // Update preview paths in JSON
      templateData.preview = {
        image: previewPath,
        thumbnail: previewPath
      };
      
      // Write updated JSON
      fs.writeFileSync(templatePath, JSON.stringify(templateData, null, 2));
      console.log(`✅ Updated ${file} with preview path: ${previewPath}`);
    }
  }
}; 