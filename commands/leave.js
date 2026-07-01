const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('إخراج البوت من الروم الصوتي'),

    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);

        if (!connection) {
            return interaction.reply({
                content: '❌ البوت ليس في روم صوتي.',
                ephemeral: true
            });
        }

        connection.destroy();

        await interaction.reply('👋 خرجت من الروم الصوتي.');
    },
};