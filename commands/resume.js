const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('متابعة تشغيل الموسيقى بعد الإيقاف المؤقت'),
    async execute(interaction) {
        const player = interaction.client.musicPlayer;
        if (!player || player.state.status !== 'paused') {
            return interaction.reply({ content: '❌ لا توجد موسيقى متوقفة مؤقتًا.', ephemeral: true });
        }
        player.unpause();
        await interaction.reply('▶️ تم استئناف الموسيقى.');
    },
};