const { AuditLogEvent, Events } = require("discord.js");
const protectManager = require("../protection/protectManager");

const LOG_CHANNEL_ID = "1521991677961568276";

module.exports = {
    name: Events.GuildMemberUpdate,

    async execute(oldMember, newMember) {
        try {

            // إذا لم تتغير الرتب
            if (oldMember.roles.cache.size === newMember.roles.cache.size) return;

            // هل العضو محمي؟
            const isProtected = await protectManager.isProtected(newMember.id);
            if (!isProtected) return;

            // معرفة من عدّل الرتب
            const logs = await newMember.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberRoleUpdate,
                limit: 1,
            });

            const entry = logs.entries.first();
            if (!entry) return;

            const executor = entry.executor;

            // تجاهل المالك والبوت
            if (
                executor.id === newMember.guild.ownerId ||
                executor.id === newMember.client.user.id
            ) {
                return;
            }

            // العضو المخالف
            const badMember = await newMember.guild.members.fetch(executor.id).catch(() => null);
            if (!badMember) return;

           // إزالة جميع الرتب من المخالف
const roles = badMember.roles.cache.filter(
    role => role.id !== newMember.guild.id
);

await badMember.roles.remove(roles);

// إعادة الرتب الأصلية للعضو المحمي
const oldRoles = oldMember.roles.cache.filter(
    role => role.id !== newMember.guild.id
);

await newMember.roles.set(oldRoles).catch(console.error);

// إرسال اللوق
const logChannel = newMember.guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                await logChannel.send({
                    content:
`🛡️ **نظام الحماية**

👤 المخالف: <@${executor.id}>
🎯 العضو المحمي: <@${newMember.id}>
⚠️ السبب: تعديل رتبة عضو محمي.
🗑️ العقوبة: إزالة جميع الرتب.`,
                });
            }

            console.log(`🛡️ تمت معاقبة ${executor.tag}`);

        } catch (error) {
            console.error(error);
        }
    },
};