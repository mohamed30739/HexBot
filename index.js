// Discord Bot Entry Point
// إعداد وتأسيس الاتصال الرئيسي للـ bot
require('dotenv').config();

const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Hex Bot Online");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🌐 Web Server يعمل على المنفذ ${PORT}`);
});

// ثم بقية كود البوت...
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { Guilds, GuildMembers, GuildMessages, GuildVoiceStates } = GatewayIntentBits;
const { Message, User, Thread, Channel } = Partials;

// استيراد تحميل الأوامر والأحداث
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');

// إنشاء الـ Client
const client = new Client({
    intents: [
        Guilds,
        GuildMembers,
        GuildMessages,
    
        GuildVoiceStates,
    ],
    partials: [Message, User, Thread, Channel],
});

// حالة البوت
let isReady = false;
let deploymentTimestamp = null;

// تشغيل البوت
(async () => {
    try {
        console.log('🤖 بدء تشغيل الـ Bot...');
        console.log('📋 تحميل الأوامر والأحداث...');

        // تحميل الأوامر والأحداث
        await loadCommands(client);
        await loadEvents(client);

        // تسجيل الدخول
        await client.login(process.env.TOKEN);

        isReady = true;
        deploymentTimestamp = Date.now();

        console.log('✅ تم تسجيل دخول الـ Bot بنجاح');
        console.log(`🆔 المعرف: ${client.user.tag} (${client.user.id})`);
client.once('ready', () => {
    const totalUsers = client.guilds.cache.reduce(
        (acc, guild) => acc + (guild.memberCount ?? 0),
        0
    );

    console.log(`🌐 عدد السيرفرات: ${client.guilds.cache.size}`);
    console.log(`👥 إجمالي الأعضاء: ${totalUsers.toLocaleString()} عضو`);
});
    } catch (error) {
        console.error('❌ فشل تسجيل الدخول:', error);
        process.exit(1);
    }
})();

// أخطاء الاتصال
client.on('error', (error) => {
    console.error('🚨 خطأ في الاتصال:', error);
});

// رسائل Debug (فقط أثناء التطوير)
if (process.env.NODE_ENV === 'development') {
    client.on('debug', (info) => {
        console.log('🐛 DEBUG:', info);
    });
}

// إيقاف البوت بشكل آمن
process.on('SIGINT', async () => {
    console.log('\n🔌 جاري إيقاف تشغيل الـ Bot...');
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
    console.log('\n🔌 تم استلام SIGTERM، جاري إيقاف التشغيل...');
    try {
        await client.destroy();
        console.log('✅ تم إيقاف التشغيل بنجاح');
        process.exit(0);
    } catch (error) {
        console.error('❌ خطأ أثناء إيقاف التشغيل:', error);
        process.exit(1);
    }
});

// معلومات عن حالة البوت
client.health = {
    isReady: () => isReady,
    uptime: () => isReady ? Date.now() - (deploymentTimestamp || Date.now()) : 0,
    guildCount: () => client.guilds.cache.size,
    userCount: () =>
        client.guilds.cache.reduce(
            (acc, guild) => acc + (guild.memberCount || 0),
            0
        ),
};

module.exports = client;