const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('247')
        .setDescription('يبقى البوت في القناة الصوتية بشكل دائم')
        .addBooleanOption(opt => 
            opt.setName('enable')
                .setDescription('تفعيل أو تعطيل الوضع')
                .setRequired(true)),
    async execute(interaction) {
        const enable = interaction.options.getBoolean('enable');
        // حفظ الحالة في الذاكرة (يمكن ربطها بقاعدة بيانات لاحقاً)
        interaction.client.voice247 = interaction.client.voice247 || new Map();
        interaction.client.voice247.set(interaction.guild.id, enable);
        await interaction.reply(`✅ تم ${enable ? 'تفعيل' : 'إلغاء'} وضع 24/7`);
    },
};