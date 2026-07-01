module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`❌ خطأ في تنفيذ الأمر ${interaction.commandName}:`, error);
            if (!interaction.replied) {
                await interaction.reply({ content: '⚠️ حدث خطأ أثناء تنفيذ الأمر.', ephemeral: true });
            }
        }
    },
};