const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const playerCommand = require('../../commands/player/player');
const teamCommand = require('../../commands/team/team');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }

        if (interaction.isModalSubmit()) {
            try {
                if (interaction.customId === 'playerModal') {
                    const playerId = interaction.fields.getTextInputValue('playerid');
                    interaction.options = {
                        getString: () => playerId,
                    };
                    await playerCommand.execute(interaction, true);
                }

                else if (interaction.customId === 'teamModal') {
                    const teamId = interaction.fields.getTextInputValue('teamid');
                    interaction.options = {
                        getString: () => teamId,
                    };
                    await teamCommand.execute(interaction, true);
                }
            } catch (error) {
                console.error('Error handling modal submission:', error);
                await interaction.reply({ content: 'There was an error while processing your request.', ephemeral: true });
            }
        }

        if (interaction.isButton()) {
            try {
                if (interaction.customId === 'player') {
                    const modal = new ModalBuilder()
                        .setCustomId('playerModal')
                        .setTitle('Enter Player ID');

                    const playerIdInput = new TextInputBuilder()
                        .setCustomId('playerid')
                        .setLabel("Player ID")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("Enter the player ID");

                    const actionRow = new ActionRowBuilder().addComponents(playerIdInput);
                    modal.addComponents(actionRow);

                    await interaction.showModal(modal);
                }

                if (interaction.customId === 'team') {
                    const modal = new ModalBuilder()
                        .setCustomId('teamModal')
                        .setTitle('Enter Team ID');

                    const teamIdInput = new TextInputBuilder()
                        .setCustomId('teamid')
                        .setLabel("Team ID")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("Enter the team ID");

                    const actionRow = new ActionRowBuilder().addComponents(teamIdInput);
                    modal.addComponents(actionRow);

                    await interaction.showModal(modal);
                }
            } catch (error) {
                console.error('Error handling button interaction:', error);
                await interaction.reply({ content: 'There was an error processing your interaction.', ephemeral: true });
            }
        }
    },
};
