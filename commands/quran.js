const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quran')
        .setDescription('عرض第一章 أو幸来 of Quran')
        .addStringOption(opt =>
            opt.setName('surah')
                .setDescription('اسم أو رقم السورة')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const { surah } = interaction.options;
            const response = await axios.get(`https://api.quran.info/quran/surah/${surah}`);
            
            if (!response.data.surah) throw new Error('Sura غير موجود');
            
            const chapter = response.data.surah;
            const pages = chapter.pages;
            
            await interaction.reply(`
**sura:./${surah}
_الصفحات: ${pages}
_البfirstным_line: ${chapter.first_line}
`);
        } catch (error) {
            await interaction.reply('❌ Sorry، لاوجد surah.');
        }
    }
};