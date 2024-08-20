const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    async execute(interaction) {
        try {
            if (interaction.customId === 'player') {
                const modal = new ModalBuilder()
                    .setCustomId('playerModal')
                    .setTitle('Enter Player ID');

                const playerIdInput = new TextInputBuilder()
                    .setCustomId('playerid')
                    .setLabel('Enter Player ID')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const actionRow = new ActionRowBuilder().addComponents(playerIdInput);
                modal.addComponents(actionRow);

                await interaction.showModal(modal);
            } else if (interaction.customId === 'team') {
                const modal = new ModalBuilder()
                    .setCustomId('teamModal')
                    .setTitle('Enter Team ID');

                const teamIdInput = new TextInputBuilder()
                    .setCustomId('teamid')
                    .setLabel('Enter Team ID')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const actionRow = new ActionRowBuilder().addComponents(teamIdInput);
                modal.addComponents(actionRow);

                await interaction.showModal(modal);
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            await interaction.reply({ content: 'There was an error while processing your request.', ephemeral: true });
        }
    },
};
