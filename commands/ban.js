const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('حظر عضو من الخادم')
        .addUserOption(option =>
            option.setName('user')
                .setDescription(' العضو الذي تريد حظره')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('سبب الحظر')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('مدة الحظر بالدقائق (اختياري)')
                .setRequired(false)),
    async execute(interaction) {
        const { user, reason, duration } = interaction.options;
        const target = interaction.guild.members.cache.get(user.id);
        
        if (!target.bannable) {
            return interaction.reply({ 
                content: '❌ لا يمكنني حظر هذا العضو (لا أملك صلاحيات كافية).',
                ephemeral: true 
            });
        }

        try {
            await target.ban({ reason: reason.value || 'غير محدد' });
            if (duration) {
                setTimeout(() => {
                    target.unban();
                }, duration.value * 60000);
            }
            
            await interaction.reply(`✅ تم حظر ${target.user.tag} بسبب: ${reason.value || 'غير محدد'}`);
        } catch (error) {
            console.error(error);
            interaction.reply({ 
                content: '❌ فشل الحظر.',
                ephemeral: true 
            });
        }
    }
};