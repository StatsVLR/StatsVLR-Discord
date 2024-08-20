const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Displays a panel with buttons for Player and Team'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Interactive Panel')
            .setDescription('Click a button to fetch information:')
            .setColor('#0099ff')
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('player')
                    .setLabel('Player')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('team')
                    .setLabel('Team')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true,
        });
    },
};
