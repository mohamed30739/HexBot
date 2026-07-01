const { Events } = require("discord.js");

const cooldowns = new Map();

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.log(`❌ الأمر غير موجود: ${interaction.commandName}`);
            return;
        }

        try {
            console.log(`✅ تنفيذ الأمر: ${interaction.commandName}`);

            await command.execute(interaction);

        } catch (error) {
            console.error(error);

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "❌ حدث خطأ أثناء تنفيذ الأمر.",
                    ephemeral: true,
                });
            }
        }
    },
};