const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const { api_url, embedColor } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team')
        .setDescription('Fetches detailed information about a Valorant team.')
        .addStringOption(option =>
            option.setName('teamid')
                .setDescription('ID of the team to fetch information for.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const teamId = interaction.options.getString('teamid');

        await interaction.deferReply({ ephemeral: true });

        try {
            const response = await axios.get(`${api_url}/api/v1/teams/${teamId}`);
            const { data } = response.data;

            if (!data) {
                return interaction.editReply({
                    content: 'No data found for the specified team ID.',
                    ephemeral: true
                });
            }

            const teamInfo = data.info;
            const teamLogo = teamInfo.logo || 'https://via.placeholder.com/150';

            const embed = new EmbedBuilder()
                .setTitle(teamInfo.name)
                .setDescription(`**Tag:** ${teamInfo.tag}`)
                .setThumbnail(teamLogo)
                .setColor(embedColor)
                .setTimestamp();

            if (data.players.length > 0) {
                let playersDescription = 'Players:\n';
                data.players.forEach(player => {
                    playersDescription += `- **${player.name}** (${player.country})\n`;
                });
                embed.addFields({ name: 'Players', value: playersDescription, inline: false });
            }

            if (data.staff.length > 0) {
                let staffDescription = 'Staff:\n';
                data.staff.forEach(member => {
                    staffDescription += `- **${member.name}** (${member.country})\n`;
                });
                embed.addFields({ name: 'Staff', value: staffDescription, inline: false });
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`team_results_${teamId}`)
                        .setLabel('Results')
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });
        } catch (error) {
            console.error('Error fetching team data:', error);
            await interaction.editReply({
                content: 'There was an error fetching the team information. Please try again later.',
                ephemeral: true
            });
        }
    },
};
