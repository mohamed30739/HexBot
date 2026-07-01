const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('إيقاف تشغيل الموسيقى مؤقتًا'),
    async execute(interaction) {
        const player = interaction.client.musicPlayer;
        if (!player || player.state.status !== 'playing') {
            return interaction.reply({ content: '❌ لا توجد موسيقى قيد التشغيل.', ephemeral: true });
        }
        player.pause();
        await interaction.reply('⏸️ تم إيقاف الموسيقى مؤقتًا.');
    },
};