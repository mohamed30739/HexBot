const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(
    path.join(__dirname, "protection.db"),
    (err) => {
        if (err) {
            console.error("❌ Database Error:", err);
        } else {
            console.log("✅ تم الاتصال بقاعدة البيانات");

            db.run(`
                CREATE TABLE IF NOT EXISTS protected_users (
                    userId TEXT PRIMARY KEY
                )
            `);
        }
    }
);

module.exports = db;