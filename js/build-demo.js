import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const demoDir = path.join(__dirname, '../demo');
const globalJs = path.join(__dirname, 'dist/index.global.js');

function build() {
  console.log('Copying global bundle to demo folder...');

  // Ensure dist file exists
  if (!fs.existsSync(globalJs)) {
    console.error(`Error: Global JS bundle not found at ${globalJs}. Run 'npm run build' first.`);
    process.exit(1);
  }

  // Copy global JS to demo/index.global.js
  fs.copyFileSync(globalJs, path.join(demoDir, 'index.global.js'));
  console.log('Successfully copied to demo/index.global.js');
}

build();
