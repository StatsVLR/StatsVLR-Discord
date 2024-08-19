const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listteams')
        .setDescription('An example command'),
    async execute(interaction) {
        await interaction.reply('This is an example command!');
    },
};
