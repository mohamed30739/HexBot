const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('انضمام البوت إلى القناة الصوتية'),
    async execute(interaction) {
        const channel = interaction.member?.voice?.channel;
        if (!channel) {
            return interaction.reply('❌ يجب أن تكون في قناة صوتية أولاً.');
        }

        try {
            joinVoiceChannel({
                channelId: channel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });
            await interaction.reply(`✅ تم الانضمام إلى ${channel.name}`);
        } catch (error) {
            console.error(error);
            await interaction.reply('❌ تعذّر الانضمام إلى القناة الصوتية.');
        }
    },
};
