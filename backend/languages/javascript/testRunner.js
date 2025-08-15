// Javascript ve Typescript testlerini çalıştıran kısım
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Verilen kod ve testleri ayrı iki dosyaya yazar temp klasöründe
function writeFiles(tempDir, language, code, tests) {
  const ext = language === 'TypeScript' ? 'ts' : 'js';

  // Dosyalara yazma
  fs.mkdirSync(tempDir, { recursive: true });
  fs.writeFileSync(path.join(tempDir, `code.${ext}`), code);
  fs.writeFileSync(path.join(tempDir, `code.test.${ext}`), tests);

  // Vitest config dosyasını oluşturur
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

  // Typescript dili için tsconfig dosyası
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

// Testleri çalıştırır
exports.runTests = (language, code, tests, nodeModulePath) => {
  // Üstteki fonksiyon kullanılarak dosyalar oluşturulur
  const tempDir = path.join(__dirname, '../../temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
  writeFiles(tempDir, language, code, tests);

  try {
    // Testler vitest ile çalıştırılıp coverage dosyası üretilir
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