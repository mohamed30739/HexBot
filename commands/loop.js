const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('تشغيل/إيقاف تشغيل وضع التكرار')
        .addStringOption(opt =>
            opt.setName('type')
                .setDescription('نوع التكرار')
                .addChoices(
                    { name: 'قائمة الانتظار', value: 'queue' },
                    { name: 'المسار الحالي', value: 'track' }
                )
                .setRequired(true)),
    async execute(interaction) {
        const type = interaction.options.getString('type');
        interaction.client.loopMode = interaction.client.loopMode || { queue: false, track: false };

        if (type === 'queue') {
            interaction.client.loopMode.queue = !interaction.client.loopMode.queue;
            await interaction.reply(`🔁 وضع تكرار القائمة الآن ${interaction.client.loopMode.queue ? 'مفعل' : 'معطل'}.`);
        } else {
            interaction.client.loopMode.track = !interaction.client.loopMode.track;
            await interaction.reply(`🔂 وضع تكرار المسار الآن ${interaction.client.loopMode.track ? 'مفعل' : 'معطل'}.`);
        }
    },
};