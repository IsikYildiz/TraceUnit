// Burada ollama ile bağlantı sağlanır
// Kullanıcıdan gelen kod ile ilgili işlemler yapılır
const jsonOperations = require('./jsonOperations')

// Ollamaya http ile istek gönderen fonksiyon
async function sendOllamaRequest(prompt) {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: jsonOperations.getSettings("ollamaModel"),
      messages: [
        { role: 'user', content: prompt }
      ],
      stream: false
    })
  });

  const data = await response.json();
  if (!data.message) {
    throw new Error(data.error || 'Ollama API beklenmeyen cevap döndü');
  }
  return data.message.content.trim();
}

// Ollamanın çıktılarındaki gereksiz işaretleri kaldırır
function extractCodeBlock(text) {
  // Kod bloğu varsa (``` ile çevrili)
  const codeBlockRegex = /```(?:[a-zA-Z]+)?\s*([\s\S]*?)\s*```/;
  const match = text.match(codeBlockRegex);
  if (match) {
    return match[1].trim();
  }

  // Tırnakla gelmişse: "code\n..."
  if ((text.startsWith('"') && text.endsWith('"')) || 
      (text.startsWith('“') && text.endsWith('”'))) {
    try {
      return JSON.parse(text);
    } catch (e) {
      return text.slice(1, -1).trim(); // Güvenli değilse tırnakları kırp
    }
  }

  // Hiçbiri değilse tümünü döndür 
  return text.trim();
}

// Ollamaya koddaki hataları gidermesi için istek gönderilir, gelen kod döndürülür
exports.fixCodeMistakes = async (code) => {
  const request = `
  You will be given a code snippet.
  
  Your task is to correct any syntax, logic, or runtime errors.
  
  Only return the corrected code.
  Do NOT include any explanations, formatting hints, or comments.

  if you didn't change the code at all just return "same"

  İf you can't understand the code at all just return "unknown"

  Code:
  ${code}`;

  const fixed_code = await sendOllamaRequest(request);

  return extractCodeBlock(fixed_code);
}

// Ollamaya kodun programlama dilini saptaması söylenir, programlama dili döndürülür
exports.detectProgrammingLanguage = async (code) => {
  const programming_languages = ["Javascript","TypeScript","Python","Java","C#"] //Uygulamanın desteklediği diller
  const request = `
  You will be given a code snippet.
  Return only the programming language it is written in.
  
  Valid languages: ${programming_languages.join(", ")}
  
  Do NOT guess any frameworks or runtimes like Node.js. Do NOT explain.

  Code:
  ${code}`;
  
  const response = await sendOllamaRequest(request);

  return extractCodeBlock(response);
}

// Ollamaya testleri oluşturması için verilecek promptu hazırlayan fonksiyon
function generateTestPrompt(code, language) {
  // Dillere göre ollamaya yapması gerekenler verilir
  const mocksByLanguage = {
    "JavaScript": `
    - Use **Vitest** for writing and running tests for JavaScript code.
    - Use \`vi.mock()\` to mock third-party or project-specific modules (e.g., **axios**, **bcrypt**, **fs**, **db.js**, or \`services/*.js\`).
    - Always mock external systems such as databases, APIs, or file system modules.
    - Avoid using \`app.listen()\` or running actual servers. If testing API endpoints, simulate requests if possible.
    - Use \`vi.fn()\`, \`vi.mocked()\`, \`mockResolvedValue()\`, and \`mockRejectedValue()\` for mocking and spying.
    - Do not include explanation or comments, return test code only.`,
    
    "TypeScript": `
    - Use **Vitest** and TypeScript for writing and running tests.
    - Use \`vi.mock()\` and \`vi.fn()\` to mock third-party or internal modules (e.g., **axios**, **bcrypt**, \`./db.ts\`, etc.).
    - Always mock database access, network calls, and file system operations.
    - Avoid using \`app.listen()\`; focus on function-level testing or endpoint simulation.
    - Use **TypeScript typings** where appropriate, e.g., \`vi.mocked<typeof myFunc>()\` to ensure type safety.
    - Do not import real implementations if they rely on unavailable modules or services.
    - Write clean, valid TypeScript test code with type safety.
    - Return test code only, without explanation or output.`,
    
    "Python": `
    - Use **pytest** and optionally **pytest-mock** for mocking.
    - Mock external services (e.g., **requests**, **sqlalchemy**, **boto3**) using \`mocker.patch()\` or \`patch()\`.
    - Do not connect to real databases, services, or file systems in tests.
    - Structure tests using functions (not classes unless required) and follow pytest conventions.
    - For Flask or FastAPI, use the test client for endpoint testing and mock dependencies.
    - Return only test code. Do not include documentation or outputs.`,
  };


  const testInstructions = mocksByLanguage[language] || `
  - Write tests that can be run for the given code.
  - If there are external dependencies, mock them.
  `;

  return `
  Write test cases for the following code written in ${language}.
  ${testInstructions}
  
  Return just the tests themselvs.

  İf you can't understand the code at all just return "unknown"
  
  Code:
  ${code} 
  `;
}

// Ollamaya testleri yazması için istekte bulunulur, testler geri döndürülür
exports.writeTests = async (code, programming_language) => {
  const request = generateTestPrompt(code, programming_language)

  const response = await sendOllamaRequest(request);
  
  return extractCodeBlock(response);
}

exports.findCoverRate = async (code, tests) => {
  const request = `
  You will be given a code snippet and a set of tests for that code.
  Your task is to identify which **line numbers** in the code are executed (covered) by the tests.
  
  Respond strictly in this format (nothing else, no explanation, no code block):
  [list of executed line numbers, separated by commas]
  
  Example response:
  [2, 3, 5, 7]
  
  Here is the code:
  ${code}
  
  Here are the tests:
  ${tests}
  `;

  let response = await sendOllamaRequest(request);

  response = extractCodeBlock(response)

  response = JSON.parse(response);
  
  return response;
}