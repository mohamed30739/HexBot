const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,

    async execute(client) {
        console.log(`✅ ${client.user.tag} جاهز!`);

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