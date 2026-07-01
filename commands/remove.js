const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('إزالة مسار من قائمة الانتظار')
        .addIntegerOption(opt =>
            opt.setName('position')
                .setDescription('رقم موقع المسار في القائمة')
                .setRequired(true)
                .setMinValue(1)),
    async execute(interaction) {
        const pos = interaction.options.getInteger('position') - 1;
        const queue = interaction.client.musicQueue;

        if (!queue || pos < 0 || pos >= queue.length) {
            return interaction.reply({ content: '❌ موقع غير صالح.', ephemeral: true });
        }

        const [removed] = queue.splice(pos, 1);
        await interaction.reply(`🗑️ تم إزالة **${removed.title}** من القائمة.`);
    },
};