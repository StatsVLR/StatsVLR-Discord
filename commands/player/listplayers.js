const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { api_url, embedColor } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listplayers')
        .setDescription('Fetches a list of Valorant players.')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number for the results.')
                .setRequired(false)
                .setMinValue(1)
        )
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Number of players to fetch per page.')
                .setRequired(false)
                .setMinValue(1)
        ),

    async execute(interaction) {
        const page = interaction.options.getInteger('page') || 1;
        const limit = interaction.options.getInteger('limit') || 10;

        await interaction.deferReply();

        try {
            const response = await axios.get(`${api_url}/api/v1/players`, {
                params: {
                    page: page,
                    limit: limit,
                },
            });

            if (!response.data || !response.data.data) {
                return interaction.editReply({
                    content: 'Unexpected response structure from API.',
                });
            }

            const { data } = response.data;

            if (data.size === 0) {
                return interaction.editReply({
                    content: 'No players found for the specified criteria.',
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('Valorant Players')
                .setColor(embedColor)
                .setTimestamp();

            let playersDescription = '';
            data.forEach(player => {
                playersDescription += `**${player.name}** (${player.country})\n`;
                playersDescription += `Team: ${player.teamTag ? player.teamTag : 'No team'}\n`;
                playersDescription += `URL: [Profile](${player.url})\n\n`;
            });

            if (playersDescription.length > 1024) {
                embed.addFields({ name: `Players - Page ${page}`, value: playersDescription.substring(0, 1024), inline: false });
                embed.setDescription('Results are too large to display in one message. Showing first part.');
            } else {
                embed.setDescription(playersDescription);
            }
            
            if (response.data.pagination && response.data.pagination.hasNextPage) {
                embed.setFooter({ text: `Page ${page} of ${response.data.pagination.totalPages}` });
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching player data:', error);
            await interaction.editReply({
                content: 'There was an error fetching player information. Please try again later.',
            });
        }
    },
};
