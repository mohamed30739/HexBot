const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearqueue')
        .setDescription('إفراغ قائمة الانتظار بالكامل'),
    async execute(interaction) {
        interaction.client.musicQueue = [];
        await interaction.reply('🧹 تم إفراغ قائمة الانتظار.');
    },
};