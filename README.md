# TraceUnit - Ollama Tabanlı Otomatik Test Yazılımı / Ollama Based Automatic Testing Software

---

## Türkçe Açıklama

### Proje Özeti

**Traceunit**, otomatik yazılım testleri oluşturmayı sağlayan bir masaüstü uygulamasıdır. Uygulama kullanıcıların çalıştırdığı ollama modelini kullanır. Kullanıcılar ayarlara doğru ollama modelini yazmalıdır. 
Ardından kodlarını belirtilen bölüme yazıp ilişkin programlama dilini seçmelidirler. Daha sonra tek yapmaları gereken "Create" tuşuna basmak ve paket yöneticisinin yolunu seçmektir. 
Eğer kullanıcı "fix coding mistakes" seçeneğini seçmişse, ollama öncelikle koddaki syntax v.b hataları düzeltmeye çalışır.
Devamında ollama kod için testler oluşturur ve daha sonra bu testler çalıştırılır. 
Oluşturulan testler, cover rate ( hem yüzde hem de kod üzerinde kırmızı-yeşil olarak) ve kodun son hali kullanıcıya sunulur. Eğer testler çalıştırılamazsa cover rate hesabı yapılmaz.

**Doğruluk**: Uygulama şuanda javascript/typescript ve python kodları için oluşturulan testleri çalıştırabilir. Ancak diğer programlama dilindeki kodların, testlerini çalıştırmaz. 
Bunun yerine cover rate ollama tarafından hesaplanır. Testlerin ve cover rate (az önceki anlatılan durumlarda) doğruluğu tamamen ollama modeline bağlıdır. Mümkünse 20b ve üstü parametreye sahip modellerin kullanılması tavsiye edilir. 

### Kullanılan Teknolojiler

- **Visual Studio Code** (ide)
- **React** (frontend)
- **Node.js** (backend)
- **Electron** (framework)
- **Ollama** (otomatik test oluşturma)

**Teknoloji Seçimleri**: Uygulamanın tüm masaüstü platformlarda çalıştırılabilmesi için electron framework ü tercih edilmiştir. VSCode ve React teknolojileri, tecrübeli olduğum için seçilmiştir.

---

## English Description

### Project Overview

**TraceUnit** is a desktop application that enables automatic software test generation. The application leverages the Ollama model provided by the user.
Users need to specify the correct Ollama model in the settings. After that, they can paste their code into the input section and select the corresponding programming language. 
The only step left is to click the "Create" button and choose the path of the package manager.
If the user enables the "fix coding mistakes" option, Ollama will first attempt to correct syntax or similar errors in the code. Then, Ollama generates tests for the code and these tests are executed.
The generated tests are presented to the user along with the coverage rate (both as a percentage and visualized in red/green on the code) and the final version of the code. 
If the tests cannot be executed, the coverage rate will not be calculated.

**Accuracy**: Currently, the application can execute generated tests for JavaScript/TypeScript and Python code. 
For other programming languages, the tests are not executed; instead, the coverage rate is estimated by Ollama. 
The accuracy of the tests and coverage rate (in these cases) fully depends on the Ollama model. It is recommended to use models with 20B parameters or higher for better accuracy.

### Technologies Used

- **Visual Studio Code** (ide)
- **React** (frontend)
- **Node.js** (backend)
- **Electron** (framework)
- **Ollama** (creating automatic tests)

**Technology Choices**: The Electron framework was chosen to ensure the application runs on all desktop platforms. VSCode and React were selected based on my prior experience with these technologies.

---
