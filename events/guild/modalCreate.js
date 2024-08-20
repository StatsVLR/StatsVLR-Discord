const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const { api_url, embedColor } = require('../../config.json');

module.exports = {
    async execute(interaction) {
        if (interaction.customId === 'playerModal') {
            const playerId = interaction.fields.getTextInputValue('playerid');
            await interaction.deferReply({ ephemeral: true });

            try {
                const response = await axios.get(`${api_url}/api/v1/players/${playerId}`);
                const playerData = response.data.data;

                if (Array.isArray(playerData) && playerData.length > 0) {
                    const embed = new EmbedBuilder()
                        .setTitle('Player Information')
                        .setColor(embedColor)
                        .setTimestamp();

                    playerData.forEach(player => {
                        embed.addFields(
                            {
                                name: player.name,
                                value: `**Country:** ${player.country}\n**Team Tag:** ${player.teamTag}\n[Profile URL](${player.url})`,
                                inline: false
                            }
                        );
                    });

                    await interaction.editReply({ embeds: [embed] });
                } else {
                    await interaction.editReply({ content: 'No player data found.', ephemeral: true });
                }
            } catch (error) {
                console.error('Error fetching player data:', error);
                await interaction.editReply({ content: 'There was an error fetching player information.', ephemeral: true });
            }
        } else if (interaction.customId === 'teamModal') {
            const teamId = interaction.fields.getTextInputValue('teamid');
            await interaction.deferReply({ ephemeral: true });

            try {
                const response = await axios.get(`${api_url}/api/v1/teams/${teamId}`);
                const teamData = response.data.data;

                if (teamData) {
                    const embed = new EmbedBuilder()
                        .setTitle('Team Information')
                        .setDescription(`**Name:** ${teamData.info.name}\n**Tag:** ${teamData.info.tag}`)
                        .setThumbnail(teamData.info.logo || 'https://via.placeholder.com/150')
                        .setColor(embedColor)
                        .setTimestamp();

                    await interaction.editReply({ embeds: [embed] });
                } else {
                    await interaction.editReply({ content: 'No team data found.', ephemeral: true });
                }
            } catch (error) {
                console.error('Error fetching team data:', error);
                await interaction.editReply({ content: 'There was an error fetching team information.', ephemeral: true });
            }
        }
    },
};
