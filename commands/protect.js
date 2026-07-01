const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const protectManager = require("../protection/protectManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("protect")
        .setDescription("إضافة عضو إلى قائمة الحماية")
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("اختر العضو")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        console.log("✅ أمر protect تم تنفيذه");

        const member = interaction.options.getUser("member");

        try {
            await protectManager.addUser(member.id);

            await interaction.reply({
                content: `🛡️ تم توثيق ${member} وإضافته إلى قائمة الحماية.`,
                ephemeral: true,
            });

        } catch (err) {
            console.error(err);

            await interaction.reply({
                content: "❌ حدث خطأ أثناء إضافة العضو للحماية.",
                ephemeral: true,
            });
        }
    },
};