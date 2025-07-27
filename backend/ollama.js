// Burada ollama ile bağlantı sağlanır
// Kullanıcıdan gelen kod ile ilgili işlemler yapılır

// Ollamaya http ile istek gönderen fonksiyon
async function sendOllamaRequest(prompt) {
  console.log("\n🔵 [Ollama Prompt]\n", prompt);
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen2.5-coder:7b',
      messages: [
        { role: 'user', content: prompt }
      ],
      stream: false
    })
  });

  const data = await response.json();
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
    - Use **Jest** and **Supertest** for writing tests for testing JavaScript code.
    - Mock external or third-party modules (e.g., **bcrypt**, **axios**, **database clients**) using \`jest.mock()\`.
    - Always mock modules like \`db.js\`, \`services/*.js\`, \`utils/*.js\`, or any network/database call.
    - Avoid importing or calling real services or APIs in tests.
    - Use \`mockResolvedValue()\`, \`mockRejectedValue()\` for async functions.
    - Avoid using \`app.listen()\`; use Supertest to test endpoints.
    - Return test code only; do not include explanation or comments.`,
    
    "TypeScript": `
    - Use **Jest** and **ts-jest** for testing TypeScript code.
    - Use \`jest.mock()\` to mock third-party or project-specific modules like \`bcrypt\`, \`axios\`, or \`db.ts\`.
    - Use **TypeScript typings** in mocks, e.g., \`jest.MockedFunction<typeof someFunction>\` to ensure type safety.
    - Always mock external systems (e.g., DB access, HTTP requests, file systems).
    - Do not import or invoke real modules. Use strict type annotations and dependency injection where possible.
    - Avoid usage of \`app.listen()\`; prefer endpoint testing with \`supertest\`.
    - Write clean, valid TypeScript test code compatible with tsconfig and test runners.`,
    
    "Python": `
    - Use **pytest** and optionally **pytest-mock** for mocking.
    - Mock external services (e.g., **requests**, **sqlalchemy**, **boto3**) using \`mocker.patch()\` or \`patch()\`.
    - Do not connect to real databases, services, or file systems in tests.
    - Structure tests using functions (not classes unless required) and follow pytest conventions.
    - For Flask or FastAPI, use the test client for endpoint testing and mock dependencies.
    - Return only test code. Do not include documentation or outputs.`,
    
    "Java": `
    - Use **JUnit 5** for writing unit and integration tests.
    - Use **Mockito** for mocking dependencies like services, repositories, or HTTP clients.
    - Use \`@Mock\`, \`@InjectMocks\`, and \`Mockito.when(...)\` for behavior mocking.
    - Do not use or call real service implementations, file I/O, or databases.
    - If the code uses Spring, use \`@WebMvcTest\` or \`@SpringBootTest\` appropriately and isolate layers.
    - Ensure the test class is self-contained and executable.`,
    
    "C#": `
    - Use **NUnit**for writing tests.
    - Use **Moq** or **NSubstitute** to mock services and dependencies.
    - Do not connect to real databases or services; mock interfaces like \`IUserRepository\`, \`IEmailService\`, etc.
    - Use \`Setup(...).Returns(...)\` and \`Verify(...)\` for asserting mock behavior.
    - Use dependency injection to pass mocks.
    - Structure tests with proper naming conventions: \`MethodName_StateUnderTest_ExpectedBehavior()\`.
    - All tests should compile with no external configuration.`
  };


  const testInstructions = mocksByLanguage[language] || `
  - Write tests that can be run for the given code.
  - If there are external dependencies, mock them.
  `;

  return `
  Write test cases for the following code written in ${language}.
  ${testInstructions}
  
  Return just the tests themselvs.
  
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

  const response = await sendOllamaRequest(request);
  
  return extractCodeBlock(response);
}