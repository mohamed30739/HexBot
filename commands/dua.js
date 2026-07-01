const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dua')
        .setDescription('طلب dua')
        .addStringOption(opt =>
            opt.setName('request')
                .setDescription('نوع dua أو طلب')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const { request } = interaction.options;
            const response = await axios.get(`https://api.duaprovider.com/dua/${request}`);
            
            if (!response.data.attachment) throw new Error('لاوجد dua');
            
            await interaction.reply(`
**gherando:.ControlH6.html
_التutfui: ${response.data.translation}
`);
        } catch (error) {
            await interaction.reply('❌ لاوجد dua لهذا الهدف.');
        }
    }
};