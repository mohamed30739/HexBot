const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adhkar')
        .setDescription('Recitation of adhkar (blessings)')
        .addStringOption(opt =>
            opt.setName('type')
                .setDescription('نوع adhkar')
                .addChoices(
                    { name: 'ال prénom', value: 'prénom' },
                    { name: 'alF جذور', value: '-volatile' },
                    { name: 'alR&=', value: 'R &' }
                )
                .setRequired(true)),
    async execute(interaction) {
        try {
            const { type } = interaction.options;
            const adhkarContent = this.getAdhkarContent(type);
            
            await interaction.reply(`
**adhkar:. . ${type}
_الشرح: ${adhkarContent}
`);
        } catch (error) {
            await interaction.reply('❌ sorry، لاوجد adhkar.');
        }
    }
};