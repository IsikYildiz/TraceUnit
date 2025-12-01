// Javascript ve Typescript testlerini çalıştıran kısım
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

`export function greeting() {  
console.log('Hello World!');
}`

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
  
  let testOutput = "";

  try {
    // Testler vitest ile çalıştırılıp coverage dosyası üretilir
    const nodeModulesLink = path.join(tempDir, 'node_modules');
    if (nodeModulePath && !fs.existsSync(nodeModulesLink)) {
      // Symlink oluşturulurken hata olasılığına karşı log
      console.log(`Node Modules Symlink oluşturuluyor: ${nodeModulePath} -> ${nodeModulesLink}`);
      fs.symlinkSync(nodeModulePath, nodeModulesLink, 'junction'); 
    }
    
    // Değişiklik: stdio: 'pipe' olarak ayarlanıp çıktı yakalanıyor.
    const result = execSync(`npx vitest run --config=vitest.config.ts --coverage --reporter=default`, 
        { cwd: tempDir, encoding: 'utf8', stdio: 'pipe'  });
    
    testOutput = result.toString();
    console.log("Vitest Çıktısı:\n", testOutput); // Terminale yazdır
    
    // Test çıktısını, coverage yolu ile birlikte döner
    return {
        lcovPath: path.join(tempDir, 'coverage', 'lcov.info'),
        output: testOutput
    };

  } catch (e) {
    testOutput = e.stdout ? e.stdout.toString() : "";
    if (e.stderr) testOutput += (e.stdout ? '\n-- STDERR --\n' : '') + e.stderr.toString();
    
    console.error("Vitest Çalıştırma Hatası (execSync Catch):", e.message);
    console.log("Vitest Hata Çıktısı:\n", testOutput); // Terminale yazdır
    
    return {
        lcovPath: null,
        output: testOutput 
    };
  }
};