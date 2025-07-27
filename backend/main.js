const ollama = require('./ollama');

const code=`
exports.register = async (req, res) => {
  const { fullName, username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      \`INSERT INTO Users (fullName, username, email, passwordHash, joinDate)
      VALUES (?, ?, ?, ?, NOW())\`,
      [fullName, username, email, hashedPassword]
    );

    res.status(201).json({ success: true, userId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
`;

async function main(code) {
  const fixedCode = await ollama.fixCodeMistakes(code);
  if (fixedCode == "unknown" || !fixedCode ){
    return "Couldn't understand code";
  }
  const language  = await ollama.detectProgrammingLanguage(fixedCode);
  const tests  = await ollama.writeTests(fixedCode,language);
  const coveredLines = await ollama.findCoverRate(fixedCode,tests);
  console.log(fixedCode)
  console.log(tests)
  console.log(coveredLines);
}

main(code)