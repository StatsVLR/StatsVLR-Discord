const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { api_url2, embedColor, authHeader } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Fetches the Valorant leaderboard for a specific region and platform.')
        .addStringOption(option =>
            option.setName('region')
                .setDescription('The region to fetch the leaderboard for.')
                .setRequired(true)
                .addChoices(
                    { name: 'EU', value: 'eu' },
                    { name: 'NA', value: 'na' },
                    { name: 'LATAM', value: 'latam' },
                    { name: 'BR', value: 'br' },
                    { name: 'AP', value: 'ap' },
                    { name: 'KR', value: 'kr' }
                )
        )
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('The platform to fetch the leaderboard for.')
                .setRequired(true)
                .addChoices(
                    { name: 'PC', value: 'pc' },
                    { name: 'Console', value: 'console' }
                )
        ),

    async execute(interaction) {
        const region = interaction.options.getString('region');
        const platform = interaction.options.getString('platform');
        await interaction.deferReply({ ephemeral: true });

        try {
            const response = await axios.get(`${api_url2}/valorant/v3/leaderboard/${region}/${platform}`, {
                headers: {
                    'Authorization': authHeader
                }
            });

            console.log('Raw response data:', response.data);

            if (!response.data || !response.data.data || !Array.isArray(response.data.data.players)) {
                console.error('Unexpected response structure from API:', response.data);
                return interaction.editReply({ content: 'Unexpected response structure from API.', ephemeral: true });
            }

            const leaderboardData = response.data.data.players;
            if (leaderboardData.length === 0) {
                console.log('No leaderboard data available for the selected region and platform.');
                return interaction.editReply({ content: 'No leaderboard data available for the selected region and platform.', ephemeral: true });
            }

            console.log('Leaderboard data:', leaderboardData);

            const embeds = leaderboardData.slice(0, 10).map(player => {
                console.log('Player data:', player);

                const thumbnailURL = isValidURL(player.card) ? player.card : 'https://example.com/default-thumbnail.png';
                
                return new EmbedBuilder()
                    .setTitle(`${player.name}${player.tag ? `#${player.tag}` : ''}`)
                    .setURL('https://playvalorant.com/')
                    .setThumbnail(thumbnailURL)
                    .setColor(embedColor)
                    .setTimestamp()
                    .addFields(
                        { name: 'PUUID', value: player.puuid, inline: true },
                        { name: 'Updated At', value: new Date(player.updated_at).toLocaleString(), inline: true }
                    );
            });

            await interaction.editReply({ embeds, ephemeral: true });
        } catch (error) {
            console.error('Error fetching leaderboard data:', error);
            await interaction.editReply({
                content: 'There was an error fetching the leaderboard data. Please try again later.',
                ephemeral: true
            });
        }
    },
};

// Utility function to check if a string is a valid URL
function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}
