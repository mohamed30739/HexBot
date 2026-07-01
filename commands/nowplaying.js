const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('عرض المقطع الحالي المشغل'),
    async execute(interaction) {
        const track = interaction.client.currentTrack;
        if (!track) {
            return interaction.reply({ content: '❌ لا يوجد مسار مشغل حالياً.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('▶️ الآن يتم تشغيل')
            .setDescription(`[${track.title}](${track.url})`)
            .setColor(0x00AE86);

        await interaction.reply({ embeds: [embed] });
    },
};