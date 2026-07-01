const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('تعديل مستوى الصوت')
        .addIntegerOption(opt =>
            opt.setName('level')
                .setDescription('القيمة بين 0 و 100')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)),
    async execute(interaction) {
        const level = interaction.options.getInteger('level');
        const player = interaction.client.musicPlayer;
        if (!player) {
            return interaction.reply({ content: '❌ لا يوجد مشغل صوتي حالياً.', ephemeral: true });
        }

        const resource = player.state.resource;
        if (resource && resource.volume) {
            resource.volume.setVolumeLogarithmic(level / 100);
            await interaction.reply(`🔊 تم ضبط مستوى الصوت إلى **${level}%**`);
        } else {
            await interaction.reply({ content: '⚠️ لا يمكن ضبط الصوت الآن.', ephemeral: true });
        }
    },
};