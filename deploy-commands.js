require('dotenv').config();
/**
 * Deploy Commands Script
 * يقوم بتسجيل الأوامر الجديدة وتحديث الأوامر الموجودة
 */
const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');

// قراءة مجلدات الأوامر لجمع أسماء الأوامر
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsPath)) {
    console.error('❌ دليل commands غير موجود.');
    process.exit(1);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const pushCommand = (cmd, file) => {
    if (!cmd || !cmd.data || !cmd.data.name) {
        console.warn(`⚠️ تم تجاهل أمر غير صالح في ${file} (لا يحتوي على data.name)`);
        return;
    }
    commands.push(cmd.data.toJSON ? cmd.data.toJSON() : cmd.data);
    console.log(`✅ تم تحميل الأمر: ${cmd.data.name}`);
};

for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`);
        if (Array.isArray(command)) {
            for (const cmd of command) {
                pushCommand(cmd, file);
            }
        } else {
            pushCommand(command, file);
        }
    } catch (error) {
        console.error(`❌ فشل تحميل ${file}:`, error);
    }
}

if (!process.env.TOKEN || !process.env.CLIENT_ID) {
    console.error('❌ يجب تعيين TOKEN و CLIENT_ID في ملف .env قبل تشغيل النشر.');
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('📡 البدء في تحميل الأوامر...');

        if (process.env.GUILD_ID) {
            // تسجيل الأوامر على مستوى الخادم فقط
            await rest.put(
                Routes.guildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            console.log(`🔗 تم تسجيل الأوامر على الخادم`);
        } else {
            // تسجيل الأوامر العالمية
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
            console.log(`🌍 تم تسجيل الأوامر العالمية`);
        }
        console.log('✅ تم الانتهاء من عملية التسجيل.');
    } catch (error) {
        console.error('❌ فشل في تحميل الأوامر:', error);
        process.exit(1);
    }
})();
