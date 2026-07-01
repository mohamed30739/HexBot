const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('إيقاف تشغيل الموسيقى وإخراج البوت من القناة'),
    async execute(interaction) {
        const connection = interaction.client.voiceConnection;
        const player = interaction.client.musicPlayer;

        if (player) player.stop();
        if (connection) connection.destroy();

        // مسح الحالة
        delete interaction.client.voiceConnection;
        delete interaction.client.musicPlayer;
        delete interaction.client.currentTrack;

        await interaction.reply('⏹️ تم إيقاف الموسيقى وإخراج البوت من القناة.');
    },
};