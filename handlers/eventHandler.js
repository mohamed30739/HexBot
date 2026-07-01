const fs = require('fs');
const path = require('path');

/**
 * تحميل جميع الأحداث من مجلد events وتسجيلها على client
 * كل ملف يجب أن يصدر كائن { name, once?, execute }
 */
module.exports.loadEvents = async (client) => {
    const eventsPath = path.join(__dirname, '..', 'events');
    if (!fs.existsSync(eventsPath)) {
        console.warn('⚠️ لا توجد أحداث لتسجيلها.');
        return;
    }

    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        try {
            const event = require(`../events/${file}`);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
            console.log(`✅ حدث محمَّل: ${event.name}`);
        } catch (err) {
            console.error(`❌ فشل تحميل الحدث من ${file}:`, err);
        }
    }
};
