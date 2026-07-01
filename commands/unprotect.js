const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const protectManager = require("../protection/protectManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unprotect")
        .setDescription("إزالة الحماية عن عضو")
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("اختر العضو")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const member = interaction.options.getUser("member");

        try {
            await protectManager.removeUser(member.id);

            await interaction.reply({
                content: `✅ تم إزالة الحماية عن ${member}.`,
                ephemeral: true,
            });
        } catch (err) {
            console.error(err);

            await interaction.reply({
                content: "❌ حدث خطأ أثناء إزالة الحماية.",
                ephemeral: true,
            });
        }
    },
};