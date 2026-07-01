const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,

    async execute(client) {
        console.log(`✅ ${client.user.tag} جاهز!`);

        // حساب عدد الأعضاء
        const totalUsers = client.guilds.cache.reduce(
            (acc, guild) => acc + (guild.memberCount || 0),
            0
        );

        console.log(`🌐 عدد السيرفرات: ${client.guilds.cache.size}`);
        console.log(`👥 إجمالي الأعضاء: ${totalUsers.toLocaleString()} عضو`);

        client.user.setPresence({
            status: 'online',
            activities: [
                {
                    name: '🎧 تشغيل الموسيقى',
                    type: ActivityType.Listening,
                },
            ],
        });
    },
};