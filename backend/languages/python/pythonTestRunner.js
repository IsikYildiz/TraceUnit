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

  const jsonReportPath = path.join(tempDir, 'pytest_report.json');

  let pytestOutput = "";

  try {
    try {
      pytestOutput = execSync(`"${pythonPath}" -m coverage run --source=user_code -m pytest --maxfail=0 --json-report --json-report-file="${jsonReportPath}" test_user_code.py`,
        { cwd: tempDir, encoding: 'utf8' });
    } catch (error) {
      console.error('Pytest hata stdout:', error.stdout);
      console.error('Pytest hata stderr:', error.stderr);
    }

    execSync(
      `"${pythonPath}" -m coverage json`,
      { cwd: tempDir, stdio: 'pipe' }
    );

    const coveragePath = path.join(tempDir, 'coverage.json');
    if (!fs.existsSync(coveragePath)) {
      console.error("coverage.json bulunamadı.");
      return {
        totals: {
          num_statements: 0,
          covered_lines: 0,
          percent_covered: 0
        },        
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        SkippedTests: 0,
        files: {
          "user_code.py": {
            executed_lines: []
          }
        }
      };
    }

    const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));

    if (fs.existsSync(jsonReportPath)) {
      const pytestReport = JSON.parse(fs.readFileSync(jsonReportPath, 'utf-8'));
      const summary = pytestReport.summary || {};

      const passed = summary.passed || 0;
      const failed = summary.failed || 0;
      const skipped = summary.skipped || 0;
      const total = passed + failed + skipped;

      coverageData.totalTests = total;
      coverageData.failedTests = failed;
      coverageData.passedTests = passed;
      coverageData.skippedTests = skipped;
    } else {
      console.error("pytest_report.json bulunamadı.");
      coverageData.totalTests = 0;
      coverageData.failedTests = 0;
      coverageData.passedTests = 0;
      coverageData.skippedTests = 0;
    }

    return coverageData;

  } catch (e) {
    console.error("Test çalıştırma sırasında hata:", e.message);
    return {};
  }
}