const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const { api_url2, embedColor, authHeader } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mmrhistory')
        .setDescription('Fetches and displays the MMR history for a given player.')
        .addStringOption(option =>
            option.setName('region')
                .setDescription('The region of the player.')
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
            option.setName('name')
                .setDescription('The player\'s name.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('tag')
                .setDescription('The player\'s tag.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const region = interaction.options.getString('region');
        const name = interaction.options.getString('name');
        const tag = interaction.options.getString('tag');
        await interaction.deferReply();

        try {
            const response = await axios.get(`${api_url2}/valorant/v1/mmr-history/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, {
                headers: {
                    'Authorization': authHeader
                }
            });
            const data = response.data;

            if (!data || !data.data || data.data.length === 0) {
                return interaction.editReply({ content: 'No MMR history data found for this player.', ephemeral: true });
            }

            const mmrHistory = data.data;
            const totalPages = mmrHistory.length;

            const createEmbed = (index) => {
                const entry = mmrHistory[index];
                if (!entry) return;

                const date = new Date(entry.date_raw * 1000);
                const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

                const embed = new EmbedBuilder()
                    .setTitle(`Match ID: ${entry.match_id}`)
                    .setColor(embedColor)
                    .addFields(
                        { name: 'Current Tier', value: entry.currenttier_patched || 'N/A', inline: true },
                        { name: 'ELO', value: entry.elo?.toString() || 'N/A', inline: true },
                        { name: 'MMR Change', value: entry.mmr_change_to_last_game?.toString() || 'N/A', inline: true },
                        { name: 'Date', value: formattedDate, inline: false },
                        { name: 'Map', value: entry.map?.name || 'N/A', inline: true },
                        { name: 'Ranking in Tier', value: entry.ranking_in_tier?.toString() || 'N/A', inline: true }
                    )
                    .setThumbnail(entry.images?.small || 'https://via.placeholder.com/150')
                    .setFooter({ text: `Page ${index + 1} of ${totalPages}` })
                    .setTimestamp();

                return embed;
            };

            const embed = createEmbed(0);

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

            let currentPage = 0;

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
                                    .setDisabled(currentPage === 0),
                                new ButtonBuilder()
                                    .setCustomId('next')
                                    .setLabel('Next')
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(currentPage === totalPages - 1)
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
            console.error('Error fetching MMR history data:', error);
            await interaction.editReply({
                content: 'There was an error fetching the MMR history data. Please try again later.',
                ephemeral: true
            });
        }
    },
};
