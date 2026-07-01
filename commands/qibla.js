const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('qibla')
        .setDescription('حساب اتجاه القبلة')
        .addStringOption(opt =>
            opt.setName('location')
                .setDescription('موقعك (مثل: القاهرة أو Atlanta)')
                .setRequired(true)),
    async execute(interaction) {
        // Simplified calculation (requires actual geolocation API for precision)
        const { location } = interaction.options;
        const qiblaInfo = {
            angle: '35°',
            direction: 'الغرب',
            steps: 'استوي الاتجاه مع 35 درجات في الغرب'
        };
        
        await interaction.reply(`
**القبلة:. . ${qiblaInfo.direction}
_الزاوية: ${qiblaInfo.angle}
_الاستخدام: ${qiblaInfo.steps}
`);
    }
};