const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  content = content.replace(/\.\.\/\.\.\/api\//g, '../../services/');
  content = content.replace(/\.\.\/api\//g, '../../services/');
  content = content.replace(/\.\/api\//g, './services/');
  content = content.replace(/\.\/API\//g, './services/');
  content = content.replace(/\.\.\/\.\.\/api\/API/g, '../../services/API');
  content = content.replace(/\.\.\/api\/API/g, '../../services/API');
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'build', 'public', '.git'].includes(entry.name)) continue;
      walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      replaceInFile(fullPath);
    }
  }
}

walk(path.resolve(__dirname, 'src'));
console.log('Import replacement done');
