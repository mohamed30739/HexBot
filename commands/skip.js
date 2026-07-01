const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('تخطي المسار الحالي والانتقال إلى التالي في القائمة'),
    async execute(interaction) {
        const player = interaction.client.musicPlayer;
        if (!player) {
            return interaction.reply({ content: '❌ لا توجد قائمة تشغيل.', ephemeral: true });
        }
        // إشارة إلى تخطي؛ إذا تم تمكين وضع الحلقة قد تحتاج إلى منطق إضافي
        player.stop();
        await interaction.reply('⏭️ تم تخطي المسار الحالي.');
    },
};