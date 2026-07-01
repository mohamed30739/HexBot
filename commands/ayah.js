const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ayah')
        .setDescription('عرض آية من القرآن الكريم')
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
            const surah = interaction.options.getInteger('surah');
            const ayah = interaction.options.getInteger('ayah');
            const response = await axios.get(`https://api.quran.info/quran/surah/${surah}/ayah/${ayah}`);

            if (!response.data.verse) throw new Error('آية غير صحيحة');

            const verse = response.data.verse;
            const translation = response.data.translations[0];

            await interaction.reply(`
**القرآن الكريم — السورة ${surah}: آية ${ayah}**
_الآية:_ ${verse}
_الترجمة:_ ${translation.translation}
`);
        } catch (error) {
            await interaction.reply('❌ عذرًا، لم يتم العثور على الآية.');
        }
    }
};
