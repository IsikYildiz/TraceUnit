const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function writeFiles(tempDir, language, code, tests) {
  const ext = language === 'TypeScript' ? 'ts' : 'js';

  fs.mkdirSync(tempDir, { recursive: true });
  fs.writeFileSync(path.join(tempDir, `code.${ext}`), code);
  fs.writeFileSync(path.join(tempDir, `code.test.${ext}`), tests);

  fs.writeFileSync(path.join(tempDir, 'vitest.config.ts'), `
    import { defineConfig } from 'vitest/config';

    export default defineConfig({
      test: {
        globals: true,
        environment: 'node',
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html'],
          reportsDirectory: './coverage',
          include: ['code.${ext}'],
        },
      },
    });
  `);

  if (language === 'TypeScript') {
    fs.writeFileSync(path.join(tempDir, 'tsconfig.json'), JSON.stringify({
      compilerOptions: {
        target: "es6",
        module: "commonjs",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true
      }
    }, null, 2));
  }
}

exports.runTests = (language, code, tests, nodeModulePath) => {
  const tempDir = path.join(__dirname, '../../temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
  writeFiles(tempDir, language, code, tests);

  try {
    const nodeModulesLink = path.join(tempDir, 'node_modules');
    if (nodeModulePath && !fs.existsSync(nodeModulesLink)) {
      fs.symlinkSync(nodeModulePath, nodeModulesLink, 'junction'); 
    }
    execSync(`npx vitest run --config=vitest.config.ts --coverage`, { cwd: tempDir, stdio: 'inherit'  });
    return path.join(tempDir, 'coverage', 'lcov.info');
  } catch (e) {
    console.log(e.message);
    return null;
  }
};