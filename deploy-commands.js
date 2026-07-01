require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    if (command.data) {
        commands.push(command.data.toJSON());
        console.log(`✅ تم تحميل الأمر: ${command.data.name}`);
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('📡 البدء في تحميل الأوامر...');

        if (process.env.GUILD_ID) {

            await rest.put(
                Routes.applicationGuildCommands(
                    process.env.CLIENT_ID,
                    process.env.GUILD_ID
                ),
                { body: commands }
            );

            console.log('🔗 تم تسجيل أوامر السيرفر');

        } else {

            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );

            console.log('🌍 تم تسجيل الأوامر العالمية');

        }

        console.log('✅ تم الانتهاء من عملية التسجيل.');

    } catch (error) {
        console.error('❌ فشل في تسجيل الأوامر:', error);
    }
})();