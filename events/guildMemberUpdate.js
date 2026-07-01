const { AuditLogEvent, Events } = require("discord.js");
const protectManager = require("../protection/protectManager");

const LOG_CHANNEL_ID = "1521991677961568276";

module.exports = {
    name: Events.GuildMemberUpdate,

    async execute(oldMember, newMember) {
        try {

            // إذا لم تتغير الرتب، لا نفعل شيئًا
            if (oldMember.roles.cache.size === newMember.roles.cache.size) return;

            // هل العضو محمي؟
            const isProtected = await protectManager.isProtected(newMember.id);

            if (!isProtected) return;

            // معرفة من قام بتعديل الرتب
            const logs = await newMember.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberRoleUpdate,
                limit: 1,
            });

            const entry = logs.entries.first();

            if (!entry) return;

            const executor = entry.executor;

            // الحصول على العضو الذي قام بالتعديل
const badMember = await newMember.guild.members.fetch(executor.id).catch(() => null);

if (!badMember) return;

// إزالة جميع الرتب ما عدا @everyone
const roles = badMember.roles.cache.filter(role => role.id !== newMember.guild.id);

await badMember.roles.remove(roles);

// إرسال رسالة إلى قناة اللوق
const logChannel = newMember.guild.channels.cache.get(LOG_CHANNEL_ID);

if (logChannel) {
    await logChannel.send({
        content:
`🛡️ **نظام الحماية**

👤 المخالف: <@${executor.id}>
🎯 العضو المحمي: <@${newMember.id}>
⚠️ السبب: تعديل رتب عضو محمي.
🗑️ العقوبة: إزالة جميع الرتب.`
    });
}// الحصول على العضو الذي قام بالتعديل
const badMember = await newMember.guild.members.fetch(executor.id).catch(() => null);

if (!badMember) return;

// إزالة جميع الرتب ما عدا @everyone
const roles = badMember.roles.cache.filter(role => role.id !== newMember.guild.id);

await badMember.roles.remove(roles);

// إرسال رسالة إلى قناة اللوق
const logChannel = newMember.guild.channels.cache.get(LOG_CHANNEL_ID);

if (logChannel) {
    await logChannel.send({
        content:
`🛡️ **نظام الحماية**

👤 المخالف: <@${executor.id}>
🎯 العضو المحمي: <@${newMember.id}>
⚠️ السبب: تعديل رتب عضو محمي.
🗑️ العقوبة: إزالة جميع الرتب.`
    });
}
            if (executor.id === newMember.guild.ownerId) return;

            // تجاهل البوت نفسه
            if (executor.id === newMember.client.user.id) return;

            console.log(`🛡️ تم اكتشاف تعديل رتب بواسطة: ${executor.tag}`);

            // سنضيف العقوبة هنا

        } catch (error) {
            console.error(error);
        }
    },
};