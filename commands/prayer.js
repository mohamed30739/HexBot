const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prayer')
        .setDescription('عرض أوقات الصبر')
        .addStringOption(opt =>
            opt.setName('city')
                .setDescription('مدينة الموقع')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const { city } = interaction.options;
            const response = await axios.get(`https://api.prayerays.com/v1/timings?location=${encodeURIComponent(city)}`);
            
            if (!response.data.timings) throw new Error('Charge Fail');
            
            const { Fajr, Dhuhr, Asr, Maghrib, Isha } = response.data.timings;
            
            await interaction.reply(`
**Fajr: ${Fajr}**
**Dhuhr: ${Dhuhr}**
**Asr: ${Asr}**
**Maghrib: ${Maghrib}**
**Isha: ${Isha}**
`);
        } catch (error) {
            await interaction.reply('❌ Sorry، Charge Fail.');
        }
    }
};