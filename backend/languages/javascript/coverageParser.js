const fs = require('fs');


exports.parseLcov = (lcovPath) => {
  const lcov = fs.readFileSync(lcovPath, 'utf8');
  const lines = lcov.split(/\r?\n/);
  const coverage = {};

  for (const line of lines) {
    if (line.startsWith('DA:')) {
      const [_, data] = line.split(':');
      const [lineNum, hits] = data.split(',').map(Number);
      coverage[lineNum] = hits;
    }
  }

  const total = Object.keys(coverage).length;
  const covered = Object.values(coverage).filter(h => h > 0).length;
  const rate = total === 0 ? 0 : (covered / total);

  return { total, covered, rate, coverage };
};