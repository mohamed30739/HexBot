const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('تشغيل مقطع من يوتيوب أو بحث باسم الأغنية')
        .addStringOption(opt =>
            opt.setName('query')
                .setDescription('رابط اليوتيوب أو اسم الأغنية')
                .setRequired(true)),
    async execute(interaction) {
        const query = interaction.options.getString('query');
        const channel = interaction.member.voice.channel;

        if (!channel) {
            return interaction.reply({ content: '❌ يجب أن تكون في قناة صوتية أولاً.', ephemeral: true });
        }

        // انضمام القناة إذا لم يكن البوت متصلاً
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        // جلب معلومات الفيديو/المسار
        let stream;
        try {
            if (play.yt_validate(query) === 'video') {
                stream = await play.stream(query);
            } else {
                const result = await play.search(query, { limit: 1 });
                if (!result[0]) throw new Error('لم يتم العثور على نتيجة.');
                stream = await play.stream(result[0].url);
            }
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: '❌ فشل في تشغيل المسار.', ephemeral: true });
        }

        // إعداد المشغل
        const player = interaction.client.musicPlayer = interaction.client.musicPlayer || createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        const resource = createAudioResource(stream.stream, {
            inputType: stream.type,
            inlineVolume: true,
        });

        player.play(resource);
        connection.subscribe(player);

        // حفظ الحالة للوظائف الأخرى
        interaction.client.voiceConnection = connection;
        interaction.client.currentTrack = { title: stream.title || query, url: stream.url };

        await interaction.reply(`▶️**${stream.title || 'تشغيل'}**`);
    },
};