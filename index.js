// Discord Bot Entry Point
// إعداد وتأسيس الاتصال الرئيسي للـ bot
require('dotenv').config(); // تحميل متغيرات .env
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const { Guilds, GuildMembers, GuildMessages, GuildVoiceStates, MessageComponents } = GatewayIntentBits;
const { Message, User, Thread, Channel } = Partials;

// استيراد إداريي تحميل الأوامر والأحداث
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');

// تهيئة الـ client
const client = new Client({
    intents: [
        Guilds,
        GuildMembers,
        GuildMessages,
        GuildVoiceStates,
    ],
    partials: [Message, User, Thread, Channel],
    // استخدام token من البيئة فقط في الإنتاج
});

// حالة التجهيز
let isReady = false;
let deploymentTimestamp = null;

// تشغيل الـ bot
(async () => {
    try {
        console.log('🤖 بدء تشغيل الـ Bot...');
        console.log('📋 تحميل الأوامر والأحداث...');

        // تحميل الأوامر والأحداث
        await loadCommands(client);
        await loadEvents(client);

        // تسجيل دخول الـ bot
        await client.login(process.env.TOKEN);
        isReady = true;
        deploymentTimestamp = Date.now();
        console.log(`✅ تم تسجيل دخول الـ Bot بنجاح`);
        console.log(`🆔 المعرف: ${client.user.tag} (${client.user.id})`);
        console.log(`🌐 إجمالي الأعضاء: ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toLocaleString()} عضو`);
    } catch (error) {
        console.error('❌ فشل تسجيل الدخول:', error);
        process.exit(1);
    }
})();

// معالجة أخطاء الاتصال
client.on('error', (error) => {
    console.error('🚨 خطأ في الاتصال:', error);
});

client.on('debug', (info) => {
    console.log('🐛 DEBUG:', info);
});

// غسلقة الإغلاق الناعمة
process.on('SIGINT', async () => {
    console.log('\\n🔌 جاري إيقاف تشغيل الـ Bot...');
    try {
        await client.destroy();
        console.log('✅ تم إغلاق الاتصال بنجاح');
        process.exit(0);
    } catch (error) {
        console.error('❌ خطأ أثناء إيقاف التشغيل:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('\\n🔌 تم استلام SIGTERM، جاري إيقاف التشغيل...');
    try {
        await client.destroy();
        console.log('✅ تم إيقاف التشغيل بنجاح');
        process.exit(0);
    } catch (error) {
        console.error('❌ خطأ أثناء إيقاف التشغيل:', error);
        process.exit(1);
    }
});

// بيانات الصحة للبيئة الخارجية (اختياري)
client.health = {
    isReady: () => isReady,
    uptime: () => isReady ? Date.now() - (deploymentTimestamp || Date.now()) : 0,
    guildCount: () => client.guilds.cache.size,
    userCount: () => client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
};