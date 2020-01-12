import fs from 'fs-extra';
import * as path from 'path';

const pkgContent = fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8');
const pkg = JSON.parse(pkgContent);

export default pkg;
