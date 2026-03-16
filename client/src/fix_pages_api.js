const fs = require('fs');
const path = require('path');

const dir = 'c:/viboo/client/src/pages';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (!file.endsWith('.js')) return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes('http://localhost:5000/api') && !content.includes('const API_URL = process.env.REACT_APP_API_URL')) {
    console.log(`Fixing absolute URLs in ${file}`);
    
    // Replace 'http://localhost:5000/api' or "http://localhost:5000/api"
    content = content.replace(/['"]http:\/\/localhost:5000\/api(.*?)['"]/g, '`${API_URL}$1`');
    
    // Replace `http://localhost:5000/api` (backticks)
    content = content.replace(/`http:\/\/localhost:5000\/api(.*?)`/g, '`${API_URL}$1`');
    
    // Add import if not present
    if (!content.includes('import { API_URL }')) {
      content = 'import { API_URL } from "../config";\n' + content;
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
  }
});

console.log('Script execution finished.');
