const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.runPythonTests = (pythonPath, code, tests, tempDir) => {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const codePath = path.join(tempDir, 'code.py');
  const testPath = path.join(tempDir, 'test_code.py');

  fs.writeFileSync(codePath, code);
  fs.writeFileSync(testPath, tests);

  try {
    const runResult = spawnSync(
      pythonPath,
      ['-m', 'coverage', 'run', '--source=code', 'test_code.py'],
      { cwd: tempDir, stdio: 'inherit', shell: true }
    );

    if (runResult.error) {
      console.error("Çalıştırma hatası:", runResult.error);
      return null;
    }

    const reportResult = spawnSync(
      pythonPath,
      ['-m', 'coverage', 'json'],
      { cwd: tempDir, stdio: 'inherit', shell: true }
    );

    if (reportResult.error) {
      console.error("JSON raporu hatası:", reportResult.error);
      return null;
    }

    const coveragePath = path.join(tempDir, 'coverage.json');
    const coverageData = JSON.parse(fs.readFileSync(coveragePath));
    return coverageData;

  } catch (e) {
    console.error("Test çalıştırma sırasında hata:", e.message);
    return null;
  }
};
