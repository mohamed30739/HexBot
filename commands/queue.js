const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('عرض قائمة التشغيل الحالية'),
    async execute(interaction) {
        const queue = interaction.client.musicQueue;
        if (!queue || queue.length === 0) {
            return interaction.reply({ content: '📭 قائمة الانتظار فارغة.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('📜 قائمة التشغيل')
            .setDescription(queue.map((track, i) => `\`${i + 1}.\` ${track.title}`).join('\n'))
            .setColor(0x00AE86);

        await interaction.reply({ embeds: [embed] });
    },
};