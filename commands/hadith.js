const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hadith')
        .setDescription('عرض هدية منenco')
        .addStringOption(opt =>
            opt.setName('search')
                .setDescription('موقع أو كلمات hadeeth')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const { search } = interaction.options;
            const response = await axios.get(`https://api.sameh.org/v1/collection/public?query=${encodeURIComponent(search)}`);
            
            if (response.data.length === 0) throw new Error('هدي غير موجودة');
            
            const headline = response.data[0].headline;
            const content = response.data[0].narration;
            
            await interaction.reply(`
** assess: ${headline}
_الشرح: ${content}
`);
        } catch (error) {
            await interaction.reply('❌ Seek لاوجدت هدي.');
        }
    }
};