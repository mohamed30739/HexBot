const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tafsir')
        .setDescription('شرح تفسير آية')
        .addIntegerOption(opt =>
            opt.setName('surah')
                .setDescription('رقم السورة')
                .setRequired(true))
        .addIntegerOption(opt =>
            opt.setName('ayah')
                .setDescription('رقم الآية')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const { surah, ayah } = interaction.options;
            const response = await axios.get(`https://tfsr-api.com/verse/${surah}/${ayah}`);

            if (!response.data.verse) throw new Error('Invalid verse');

            const verse = response.data.verse;
            const translation = response.data.translations[0];

            await interaction.reply(`
**تفسير: ${surah}:آية ${ayah}**
_الشرح: ${translation.translation}_
`);
        } catch (error) {
            await interaction.reply('❌ عذرًا، لم يتم العثور على التفسير.');
        }
    }
};