// Kullanıcının seçimlerini hatırlamak için settings.json dosyası oluşturulur ve seçimler kaydedilebilir, değiştirilebilir ve okunabilir.

const path = require('path');
const fs = require('fs');

// Settings.json dosyası yoksa oluşturan fonksiyon
exports.createSettingsJson = () => {
    // Settings json dosyası zaten var mı?
    const settingsPath = path.join(__dirname, 'settings.json');
    if (fs.existsSync(settingsPath)){
        return "Settings file already exists"
    }

    // Settings dosyasındaki json objeleri
    const settings = {
        "nodeModulesPath": "",
        "pythonPath": "",
        "ollamaModel": ""
    }
    const settingsJson = JSON.stringify(settings, null, 1);

    try{
        // Settings.json dosyası oluşturulur
        fs.writeFileSync(settingsPath, settingsJson, 'utf8');
    }
    catch{
        throw new Error("Settings.json dosyası oluşturulurken hata!");
    }

    return "Succesfully created settings file"
}

// Gelen parametreye göre kullanıcı seçimi döndürülür
exports.getSettings = (choice) => {
    const settingsPath = path.join(__dirname, 'settings.json');
    try {
        const data = fs.readFileSync(settingsPath, 'utf8');
        const settingsJson = JSON.parse(data);
        switch (choice) {
            case "nodeModulesPath":
                return settingsJson.nodeModulesPath;
            case "pythonPath":
                return settingsJson.pythonPath;
            case "ollamaModel":
                return settingsJson.ollamaModel;
            default:
                return "Hatalı seçim";
        }
    } catch (err) {
        console.error('Settings.json dosyasını okumaya çalışırken hata!', err);
        return null;
    }
}

// Kullanıcının gelen parametredeki seçimi değiştirilir
exports.setSettings = (choice, value) => {
    if(typeof value === "undefined"){
        return;
    }
    const settingsPath = path.join(__dirname, 'settings.json');
    try {
        const data = fs.readFileSync(settingsPath, 'utf8');
        const settingsJson = JSON.parse(data);
        switch (choice) {
            case "nodeModulesPath":
                settingsJson.nodeModulesPath = value;
                fs.writeFileSync(settingsPath,  JSON.stringify(settingsJson, null, 2), 'utf8');
                return "Başarılı";
            case "pythonPath":
                settingsJson.pythonPath = value;
                fs.writeFileSync(settingsPath,  JSON.stringify(settingsJson, null, 2), 'utf8');
                return "Başarılı";
            case "ollamaModel":
                settingsJson.ollamaModel = value;
                fs.writeFileSync(settingsPath,  JSON.stringify(settingsJson, null, 2), 'utf8');
                return "Başarılı";
            default:
                return "Hatalı seçim";
        }
    } catch (err) {
        console.error('Settings.json dosyasını okumaya çalışırken hata!', err);
        return 'Settings.json dosyasını okumaya çalışırken hata!';
    }
}