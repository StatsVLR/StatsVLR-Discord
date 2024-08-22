const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const { api_url2, embedColor, authHeader } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Fetches and displays the Valorant leaderboard for a specific region and platform.')
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
        await interaction.deferReply();

        try {
            const response = await axios.get(`${api_url2}/valorant/v3/leaderboard/${region}/${platform}`, {
                headers: {
                    'Authorization': authHeader
                }
            });

            if (!response.data || !response.data.data || !Array.isArray(response.data.data.players)) {
                console.error('Unexpected response structure from API:', response.data);
                return interaction.editReply({ content: 'Unexpected response structure from API.', ephemeral: true });
            }

            const leaderboardData = response.data.data.players;
            if (leaderboardData.length === 0) {
                console.log('No leaderboard data available for the selected region and platform.');
                return interaction.editReply({ content: 'No leaderboard data available for the selected region and platform.', ephemeral: true });
            }

            const itemsPerPage = 5;
            const totalPages = Math.ceil(leaderboardData.length / itemsPerPage);

            const createEmbed = (page) => {
                const start = (page - 1) * itemsPerPage;
                const end = Math.min(start + itemsPerPage, leaderboardData.length);
                const playersOnPage = leaderboardData.slice(start, end);

                const embed = new EmbedBuilder()
                    .setTitle(`Valorant Leaderboard - ${region.toUpperCase()} (${platform.toUpperCase()})`)
                    .setColor(embedColor)
                    .setDescription(playersOnPage.map((player, index) => 
                        `${start + index + 1}. **${player.name}${player.tag ? `#${player.tag}` : ''}**\n` +
                        `PUUID: ${player.puuid}\n` +
                        `Updated At: ${new Date(player.updated_at).toLocaleString()}\n`
                    ).join('\n'))
                    .setFooter({ text: `Page ${page} of ${totalPages}` })
                    .setTimestamp();

                return embed;
            };

            const embed = createEmbed(1);

            const components = [];
            if (totalPages > 1) {
                components.push(
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('previous')
                                .setLabel('Previous')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('Next')
                                .setStyle(ButtonStyle.Primary)
                        )
                );
            }

            const message = await interaction.editReply({
                embeds: [embed],
                components: components
            });

            const filter = i => ['previous', 'next'].includes(i.customId) && i.user.id === interaction.user.id;
            const collector = message.createMessageComponentCollector({ filter, time: 60000 });

            let currentPage = 1;

            collector.on('collect', async i => {
                if (i.customId === 'next') {
                    currentPage++;
                } else if (i.customId === 'previous') {
                    currentPage--;
                }

                const newEmbed = createEmbed(currentPage);

                await i.update({
                    embeds: [newEmbed],
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('previous')
                                    .setLabel('Previous')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(currentPage === 1),
                                new ButtonBuilder()
                                    .setCustomId('next')
                                    .setLabel('Next')
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(currentPage === totalPages)
                            )
                    ]
                });
            });

            collector.on('end', () => {
                message.edit({
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('previous')
                                    .setLabel('Previous')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(true),
                                new ButtonBuilder()
                                    .setCustomId('next')
                                    .setLabel('Next')
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(true)
                            )
                    ]
                });
            });
        } catch (error) {
            console.error('Error fetching leaderboard data:', error);
            await interaction.editReply({
                content: 'There was an error fetching the leaderboard data. Please try again later.',
                ephemeral: true
            });
        }
    },
};
