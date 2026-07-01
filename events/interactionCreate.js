const cooldowns = new Map();

module.exports = {
    name: 'interactionCreate',

    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        // Cooldown (3 ثوانٍ)
        const key = `${interaction.user.id}-${interaction.commandName}`;
        const cooldown = 3000;

        if (cooldowns.has(key)) {
            const expires = cooldowns.get(key);

            if (Date.now() < expires) {
                const seconds = ((expires - Date.now()) / 1000).toFixed(1);

                return interaction.reply({
                    content: `⏳ انتظر ${seconds} ثانية قبل استخدام هذا الأمر مرة أخرى.`,
                    ephemeral: true,
                });
            }
        }
const command = client.commands.get(interaction.commandName);
if (!command) return;

// التحقق من صلاحيات المستخدم
if (command.permissions) {
    const missing = command.permissions.filter(
        perm => !interaction.member.permissions.has(perm)
    );

    if (missing.length) {
        return interaction.reply({
            content: "❌ ليس لديك الصلاحية لاستخدام هذا الأمر.",
            ephemeral: true,
        });
    }
}

// التحقق من صلاحيات البوت
if (command.botPermissions) {
    const missing = command.botPermissions.filter(
        perm => !interaction.guild.members.me.permissions.has(perm)
    );

    if (missing.length) {
        return interaction.reply({
            content: "❌ البوت لا يملك الصلاحيات اللازمة لتنفيذ هذا الأمر.",
            ephemeral: true,
        });
    }
}

try {
    await command.execute(interaction);
} catch (error) {
    console.error(`❌ خطأ في تنفيذ الأمر ${interaction.commandName}:`, error);

    if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
            content: '⚠️ حدث خطأ أثناء تنفيذ الأمر.',
            ephemeral: true,
        });
    }
}