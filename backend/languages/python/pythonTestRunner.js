const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.runPythonTests = (pythonPath, code, tests, tempDir) => {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const codePath = path.join(tempDir, 'user_code.py');
  const testPath = path.join(tempDir, 'test_user_code.py');

  fs.writeFileSync(codePath, code);
  fs.writeFileSync(testPath, tests);

  try {
    // coverage run
    try {
      execSync(`"${pythonPath}" -m coverage run --source=user_code -m pytest --maxfail=0 test_user_code.py`,
        { cwd: tempDir, stdio: 'pipe', encoding: 'utf8' });
    } catch (error) {
      console.error('Hata stdout:', error.stdout);
      console.error('Hata stderr:', error.stderr);
    }

    // coverage json export
    execSync(
      `"${pythonPath}" -m coverage json`,
      { cwd: tempDir, stdio: 'pipe' }
    );

    // coverage.json dosyasını oku
    const coveragePath = path.join(tempDir, 'coverage.json');
    if (!fs.existsSync(coveragePath)) {
      console.error("coverage.json bulunamadı.");
      return null;
    }

    const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));
    return coverageData;

  } catch (e) {
    console.error("Test çalıştırma sırasında hata:", e.message);
    return null;
  }
};
