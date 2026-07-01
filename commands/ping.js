const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('رد بـ Pong!'),
    execute(interaction) {
        interaction.reply('Pong!');
    },
};