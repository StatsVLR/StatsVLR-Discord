const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const { api_url, embedColor } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('matches')
        .setDescription('Fetches and displays upcoming or ongoing matches.'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const response = await axios.get(`${api_url}/api/v1/matches`);
            
            if (!response.data || !response.data.data || response.data.data.length === 0) {
                return interaction.editReply({ content: 'No matches found.' });
            }

            const matches = response.data.data;
            const maxEmbedsPerPage = 10;
            const totalPages = Math.ceil(matches.length / maxEmbedsPerPage);

            const createEmbeds = (page) => {
                const embeds = [];
                const start = (page - 1) * maxEmbedsPerPage;
                const end = Math.min(start + maxEmbedsPerPage, matches.length);

                for (let i = start; i < end; i++) {
                    const match = matches[i];
                    const embed = new EmbedBuilder()
                        .setTitle(`Event: ${match.event}`)
                        .setDescription(`Tournament: ${match.tournament}`)
                        .setColor(embedColor)
                        .setThumbnail(match.img)
                        .addFields(
                            { name: 'Teams', value: match.teams.map(t => `${t.name} (${t.country}) - Score: ${t.score}`).join('\n') },
                            { name: 'Status', value: match.status },
                            { name: 'In', value: match.in }
                        )
                        .setTimestamp();

                    embeds.push(embed);
                }

                return embeds;
            };

            const embedPages = createEmbeds(1);

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
                embeds: embedPages,
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

                const newEmbeds = createEmbeds(currentPage);

                await i.update({
                    embeds: newEmbeds,
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
            console.error('Error fetching matches:', error);
            await interaction.editReply({
                content: 'There was an error fetching matches. Please try again later.',
            });
        }
    },
};
