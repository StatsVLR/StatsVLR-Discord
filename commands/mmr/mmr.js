const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const { api_url3, embedColor } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mmr')
        .setDescription('Fetches and displays the MMR history of a Valorant player.')
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
            option.setName('puuid')
                .setDescription('The PUUID of the player.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const region = interaction.options.getString('region');
        const puuid = interaction.options.getString('puuid');
        await interaction.deferReply();

        const normalizedRegion = ['latam', 'br'].includes(region) ? 'na' : region;

        try {
            const response = await axios.get(`https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr-history/${normalizedRegion}/${puuid}`);

            if (response.data.status !== 200) {
                return interaction.editReply({ content: 'Error fetching MMR history.', ephemeral: true });
            }

            const { name, tag, data } = response.data;

            if (data.length === 0) {
                return interaction.editReply({ content: 'No MMR history found for the provided PUUID.', ephemeral: true });
            }

            const itemsPerPage = 5;
            const totalPages = Math.ceil(data.length / itemsPerPage);

            const createEmbed = (page) => {
                const start = (page - 1) * itemsPerPage;
                const end = Math.min(start + itemsPerPage, data.length);
                const mmrHistoryOnPage = data.slice(start, end);

                const embed = new EmbedBuilder()
                    .setTitle(`MMR History for ${name}#${tag}`)
                    .setColor(embedColor)
                    .setDescription(mmrHistoryOnPage.map((entry, index) => 
                        `${start + index + 1}. **Date:** ${new Date(entry.date_raw * 1000).toLocaleString()}\n` +
                        `**Map:** ${entry.map.name}\n` +
                        `**Match ID:** ${entry.match_id}\n` +
                        `**Current Tier:** ${entry.currenttier_patched}\n` +
                        `**MMR Change:** ${entry.mmr_change_to_last_game}\n` +
                        `**Elo:** ${entry.elo}\n` +
                        `**Ranking in Tier:** ${entry.ranking_in_tier}\n` +
                        `**Image:** [View Image](${entry.images.small})\n` +
                        `\n`
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
            console.error('Error fetching MMR history:', error);
            await interaction.editReply({
                content: 'There was an error fetching MMR history. Please try again later.',
                ephemeral: true
            });
        }
    },
};
