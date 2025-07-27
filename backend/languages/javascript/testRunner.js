const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function writeFiles(tempDir, language, code, tests) {
  const ext = language === 'TypeScript' ? 'ts' : 'js';

  fs.mkdirSync(tempDir, { recursive: true });
  fs.writeFileSync(path.join(tempDir, `code.${ext}`), code);
  fs.writeFileSync(path.join(tempDir, `code.test.${ext}`), tests);

  fs.writeFileSync(path.join(tempDir, 'jest.config.js'), `
    module.exports = {
      preset: '${language === "TypeScript" ? "ts-jest" : ""}',
      testEnvironment: 'node',
      collectCoverage: true,
      collectCoverageFrom: ['code.${ext}'],
      coverageDirectory: 'coverage'
    };
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

exports.runTests = (language, code, tests) => {
  const tempDir = path.join(__dirname, '../../temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
  writeFiles(tempDir, language, code, tests);

  try {
    execSync(`npx jest --config=jest.config.js --coverage --silent`, { cwd: tempDir });
    return path.join(tempDir, 'coverage', 'lcov.info');
  } catch (e) {
    return null;
  }
};