const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('خلط قائمة التشغيل بشكل عشوائي'),
    async execute(interaction) {
        const queue = interaction.client.musicQueue;
        if (!queue || queue.length < 2) {
            return interaction.reply({ content: '📭 لا توجد أغاني كافية للخلط.', ephemeral: true });
        }

        // خلط فيمكان عشوائي
        for (let i = queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [queue[i], queue[j]] = [queue[j], queue[i]];
        }

        await interaction.reply('🔀 تم خلط قائمة التشغيل.');
    },
};