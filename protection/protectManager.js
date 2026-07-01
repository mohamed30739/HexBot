const db = require("../database/database");

module.exports = {

    addUser(userId) {
        return new Promise((resolve, reject) => {

            db.run(
                "INSERT OR IGNORE INTO protected_users (userId) VALUES (?)",
                [userId],
                function (err) {

                    if (err) return reject(err);

                    resolve(true);

                }
            );

        });
    },

    removeUser(userId) {
        return new Promise((resolve, reject) => {

            db.run(
                "DELETE FROM protected_users WHERE userId = ?",
                [userId],
                function (err) {

                    if (err) return reject(err);

                    resolve(true);

                }
            );

        });
    },

    isProtected(userId) {
        return new Promise((resolve, reject) => {

            db.get(
                "SELECT * FROM protected_users WHERE userId = ?",
                [userId],
                (err, row) => {

                    if (err) return reject(err);

                    resolve(!!row);

                }
            );

        });
    }

};