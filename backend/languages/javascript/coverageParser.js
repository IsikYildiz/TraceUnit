// Javascript ve Typescript test sonuçlarıyla ilgili kısım
const fs = require('fs');

// Verilen yoldaki dosyada bulunan test sonuçları okur ve gerekli değerleri döndürür.
exports.parseLcov = (lcovPath) => {
  // İleride belki test sayısı gibi bilgilerde döndürülebilir
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