const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

/**
 * تحميل جميع أوامر السلاش من مجلد commands وإضافتها إلى client.commands
 * كل ملف يجب أن يصدر كائن أمر واحد (أو مصفوفة من الأوامر)
 */
module.exports.loadCommands = async (client) => {
    client.commands = new Collection();

    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    const registerCommand = (cmd, file) => {
        if (!cmd || !cmd.data || !cmd.data.name) {
            console.warn(`⚠️ تم تجاهل أمر غير صالح في ${file} (لا يحتوي على data.name)`);
            return;
        }
        if (typeof cmd.execute !== 'function') {
            console.warn(`⚠️ تم تجاهل الأمر ${cmd.data.name} في ${file} (لا يحتوي على دالة execute)`);
            return;
        }
        client.commands.set(cmd.data.name, cmd);
        console.log(`✅ أمر محمَّل: ${cmd.data.name}`);
    };

    for (const file of commandFiles) {
        try {
            const command = require(`../commands/${file}`);
            if (Array.isArray(command)) {
                for (const cmd of command) {
                    registerCommand(cmd, file);
                }
            } else {
                registerCommand(command, file);
            }
        } catch (err) {
            console.error(`❌ فشل تحميل الأمر من ${file}:`, err);
        }
    }
};
