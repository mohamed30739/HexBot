// ============================================================================
//  events/voiceStateUpdate.js
//  نظام الترحيب الصوتي عند دخول عضو لقناة صوتية باستخدام Google TTS المجاني.
//  Discord.js v14 + @discordjs/voice + google-tts-api + axios + ffmpeg-static
//  + prism-media + libsodium-wrappers  (بدون أي API مدفوع وبدون مفتاح)
//
//  أُعيدت كتابته بالكامل ليتبع التدفق الرسمي الموصى به في @discordjs/voice:
//    joinVoiceChannel -> انتظار Ready (مع معالجة صحيحة لـ Disconnected)
//    -> createAudioResource -> createAudioPlayer -> subscribe
//    -> player.play -> انتظار Playing -> انتظار Idle -> destroy
//  بدون أي AbortController/timeout يدوي يسبّب AbortError، وبدون catch يخفي الخطأ.
// ============================================================================

const {
    joinVoiceChannel,
    getVoiceConnection,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    StreamType,
    NoSubscriberBehavior,
} = require('@discordjs/voice');

const googleTTS = require('google-tts-api');
const axios = require('axios');
const fs = require('fs');
const os = require('os');
const path = require('path');

// ----------------------------------------------------------------------------
//  تهيئة مكتبة التشفير (مطلوبة لـ @discordjs/voice وإلا لن يخرج صوت إطلاقًا)
// ----------------------------------------------------------------------------
let sodiumReady = false;
(async () => {
    try {
        const sodium = require('libsodium-wrappers');
        await sodium.ready;
        sodiumReady = true;
        console.log('🔐 [VoiceTTS] libsodium-wrappers جاهزة.');
    } catch (err) {
        console.error('❌ [VoiceTTS] فشل تحميل libsodium-wrappers:', err);
    }
})();

// ----------------------------------------------------------------------------
//  ضبط مسار FFmpeg من ffmpeg-static حتى يستخدمه prism-media / @discordjs/voice
// ----------------------------------------------------------------------------
try {
    const ffmpegPath = require('ffmpeg-static');
    if (ffmpegPath) {
        process.env.FFMPEG_PATH = ffmpegPath;
        console.log('🎬 [VoiceTTS] FFMPEG_PATH =', ffmpegPath);
    }
} catch (err) {
    console.error('⚠️ [VoiceTTS] ffmpeg-static غير متوفر:', err);
}

// ----------------------------------------------------------------------------
//  إعدادات
// ----------------------------------------------------------------------------
const WELCOME_TEXT = 'مرحبًا بك في سيرفر هيكس، نتمنى لك وقتًا ممتعًا.';
const COOLDOWN_MS = 30 * 1000; // منع تكرار الترحيب لنفس العضو لمدة 30 ثانية
const READY_TIMEOUT_MS = 30_000; // مهلة الوصول لحالة Ready للاتصال الصوتي
const PLAYING_TIMEOUT_MS = 15_000; // مهلة الوصول لحالة Playing للمشغّل
const IDLE_TIMEOUT_MS = 60_000; // مهلة انتظار انتهاء التشغيل

const lastGreeted = new Map(); // userId -> timestamp
const activeGuilds = new Set(); // guildIds التي بها ترحيب نشط

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ----------------------------------------------------------------------------
//  تنزيل صوت Google TTS كـ MP3 وحفظه في ملف مؤقت (أكثر موثوقية من stream حي).
// ----------------------------------------------------------------------------
async function downloadTTSToFile(text) {
    const parts = googleTTS.getAllAudioUrls(text, {
        lang: 'ar',
        slow: false,
        host: 'https://translate.google.com',
    });

    const buffers = [];
    for (const part of parts) {
        const response = await axios.get(part.url, {
            responseType: 'arraybuffer',
            timeout: 20000,
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
            },
        });
        buffers.push(Buffer.from(response.data));
    }

    const mp3Buffer = Buffer.concat(buffers);
    if (!mp3Buffer.length) {
        throw new Error('Google TTS أرجع بيانات فارغة.');
    }

    const filePath = path.join(
        os.tmpdir(),
        `hexbot-tts-${Date.now()}-${Math.floor(Math.random() * 1e6)}.mp3`
    );
    await fs.promises.writeFile(filePath, mp3Buffer);
    return { filePath, size: mp3Buffer.length };
}

// ----------------------------------------------------------------------------
//  انتظار وصول الاتصال إلى Ready بالطريقة الرسمية.
//  يعالج تذبذب signalling <-> connecting، وكذلك حالة Disconnected:
//    - إن كانت إعادة اتصال مؤقتة (مثل نقل بين القنوات) ننتظر عودته Connecting/Ready.
//    - إن كان انقطاعًا حقيقيًا نرمي الخطأ الحقيقي بدل تركه يعلق حتى AbortError.
//  ملاحظة: لا نستخدم AbortController يدوي هنا؛ نعتمد على entersState الرسمي فقط.
// ----------------------------------------------------------------------------
async function waitForConnectionReady(connection, timeoutMs) {
    // نعالج Disconnected مرة واحدة أثناء الانتظار
    const onDisconnected = async () => {
        try {
            // نمنح الاتصال فرصة لإعادة التفاوض تلقائيًا (مثل التنقّل بين القنوات)
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
            // إعادة اتصال جارية: لا نفعل شيئًا، سيتابع entersState(Ready) أدناه.
        } catch {
            // انقطاع حقيقي: ندمّر الاتصال حتى لا يعلق ويظهر السبب الحقيقي.
            if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
                connection.destroy();
            }
        }
    };

    connection.on(VoiceConnectionStatus.Disconnected, onDisconnected);
    try {
        await entersState(connection, VoiceConnectionStatus.Ready, timeoutMs);
    } finally {
        connection.off(VoiceConnectionStatus.Disconnected, onDisconnected);
    }
}

module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    async execute(oldState, newState, client) {
        let connection;
        let guildId;
        let ttsFilePath;
        let lastStep = 'NONE';
        const step = (n, msg) => {
            lastStep = `STEP ${n}: ${msg}`;
            console.log(`🩺 ${lastStep}`);
        };

        try {
            step(1, 'Voice event received');

            const member = newState.member;
            if (!member) return;
            if (member.user.bot) return; // تجاهل البوتات (ومنها البوت نفسه)

            const newChannel = newState.channel;
            const oldChannel = oldState.channel;

            // نُرحّب فقط عند الانضمام إلى قناة صوتية جديدة
            const joinedNewChannel =
                newChannel && newChannel.id !== (oldChannel && oldChannel.id);
            if (!joinedNewChannel) return;

            console.log(`👋 [VoiceTTS] ${member.user.tag} -> "${newChannel.name}"`);

            // منع التكرار لنفس العضو خلال 30 ثانية
            const now = Date.now();
            const last = lastGreeted.get(member.id) || 0;
            if (now - last < COOLDOWN_MS) {
                console.log('⏳ [VoiceTTS] تجاهل: فترة تهدئة 30 ثانية.');
                return;
            }
            lastGreeted.set(member.id, now);

            guildId = newState.guild.id;

            // إذا كان البوت موجودًا بالفعل في نفس السيرفر فلا ننشئ اتصالًا ثانيًا
            const existingConnection = getVoiceConnection(guildId);
            if (existingConnection || activeGuilds.has(guildId)) {
                console.log('🔁 [VoiceTTS] تجاهل: يوجد اتصال/ترحيب نشط بنفس السيرفر.');
                return;
            }
            activeGuilds.add(guildId);

            // التأكد من جاهزية مكتبة التشفير قبل أي شيء
            if (!sodiumReady) {
                const sodium = require('libsodium-wrappers');
                await sodium.ready;
                sodiumReady = true;
            }

            // نُنزّل صوت الترحيب أولًا (قبل الاتصال) حتى يكون جاهزًا فور الوصول لـ Ready
            step(4, 'Downloading TTS');
            const { filePath, size } = await downloadTTSToFile(WELCOME_TEXT);
            ttsFilePath = filePath;
            step(5, `TTS Download Complete (${size} bytes): ${filePath}`);

            // ---------------------------------------------------------------
            //  STEP 2: joinVoiceChannel (الطريقة الرسمية)
            // ---------------------------------------------------------------
            step(2, 'Joining channel');
            connection = joinVoiceChannel({
                channelId: newChannel.id,
                guildId: guildId,
                adapterCreator: newState.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false,
            });

            connection.on('error', (err) => {
                console.error('🚨 [VoiceTTS] Connection error:', err);
                console.error('🚨 [VoiceTTS] Connection error stack:', err && err.stack);
            });
            connection.on('stateChange', (oldS, newS) => {
                console.log(
                    `🔗 [DIAG] connection.stateChange: ${oldS.status} -> ${newS.status}`
                );
            });

            // ---------------------------------------------------------------
            //  STEP 3: انتظار Ready قبل إنشاء أي Player (كما هو مطلوب رسميًا)
            // ---------------------------------------------------------------
            await waitForConnectionReady(connection, READY_TIMEOUT_MS);
            step(3, 'Connection Ready');

            // ---------------------------------------------------------------
            //  STEP 6: createAudioResource (بعد Ready)
            // ---------------------------------------------------------------
            const resource = createAudioResource(fs.createReadStream(ttsFilePath), {
                inputType: StreamType.Arbitrary,
                inlineVolume: true,
            });
            if (resource.volume) resource.volume.setVolume(1.0);
            step(6, 'AudioResource created');

            if (resource.playStream) {
                resource.playStream.on('error', (err) => {
                    console.error(
                        `🚨 [DIAG] resource.playStream error at ${lastStep}:`,
                        err
                    );
                    console.error('🚨 [DIAG] stack:', err && err.stack);
                });
            }

            // ---------------------------------------------------------------
            //  STEP 7: createAudioPlayer جديد (بعد Ready)
            // ---------------------------------------------------------------
            const player = createAudioPlayer({
                behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
            });
            step(7, 'Player created');

            player.on('error', (err) => {
                console.error(`🚨 [DIAG] player error at ${lastStep}:`, err);
                console.error('🚨 [DIAG] stack:', err && err.stack);
                if (err && err.resource) {
                    console.error('🚨 [DIAG] resource metadata:', err.resource.metadata);
                }
            });
            player.on('stateChange', (oldS, newS) => {
                console.log(
                    `🎵 STEP 10: Player state ${oldS.status} -> ${newS.status}`
                );
            });

            // ---------------------------------------------------------------
            //  STEP 8: connection.subscribe(player)
            // ---------------------------------------------------------------
            const subscription = connection.subscribe(player);
            if (!subscription) {
                throw new Error(
                    'connection.subscribe أرجع undefined — تعذّر ربط المشغّل بالاتصال.'
                );
            }
            step(8, 'connection.subscribe OK');

            // ---------------------------------------------------------------
            //  STEP 9: player.play(resource)
            // ---------------------------------------------------------------
            player.play(resource);
            step(9, 'player.play called');

            // ---------------------------------------------------------------
            //  STEP 11: انتظار Playing (نرمي السبب الحقيقي عند الفشل)
            // ---------------------------------------------------------------
            try {
                await entersState(player, AudioPlayerStatus.Playing, PLAYING_TIMEOUT_MS);
                step(11, 'Player Playing');
            } catch (playErr) {
                console.error(
                    '🚨 [DIAG] لم يصل Player إلى Playing. الحالة الحالية:',
                    player.state.status
                );
                console.error('🚨 [DIAG] السبب الحقيقي:', playErr);
                console.error('🚨 [DIAG] stack كامل:', playErr && playErr.stack);
                throw playErr; // لا نخفي الخطأ
            }

            // ---------------------------------------------------------------
            //  STEP 12: انتظار Idle (انتهاء التشغيل)
            // ---------------------------------------------------------------
            await entersState(player, AudioPlayerStatus.Idle, IDLE_TIMEOUT_MS);
            step(12, 'Player Idle');

            // مهلة قصيرة قبل المغادرة
            await sleep(1000);
            step(13, 'Leaving (finalizing)');
        } catch (error) {
            // لا نخفي الخطأ: نطبع السبب الحقيقي كاملًا مع الـ Stack والـ STEP السابق.
            console.error(`🚨 [VoiceTTS] فشل عند: ${lastStep}`);
            console.error('🚨 [VoiceTTS] اسم الخطأ:', error && error.name);
            console.error('🚨 [VoiceTTS] رسالة الخطأ:', error && error.message);
            console.error('🚨 [VoiceTTS] stack كامل:', error && error.stack);
            if (error && error.cause) {
                console.error('🚨 [VoiceTTS] السبب (cause):', error.cause);
            }
        } finally {
            // المغادرة وتنظيف الملف المؤقت
            try {
                const conn = guildId ? getVoiceConnection(guildId) : connection;
                if (conn && conn.state.status !== VoiceConnectionStatus.Destroyed) {
                    conn.destroy();
                    console.log('👋 [VoiceTTS] Leaving');
                }
            } catch (err) {
                console.error('⚠️ [VoiceTTS] خطأ أثناء المغادرة:', err);
            }

            if (ttsFilePath) {
                fs.promises.unlink(ttsFilePath).catch(() => {});
            }

            if (guildId) activeGuilds.delete(guildId);
        }
    },
};
