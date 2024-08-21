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
            const totalPages = matches.length;

            const createEmbed = (page) => {
                const match = matches[page - 1];
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
            console.error('Error fetching matches:', error);
            await interaction.editReply({
                content: 'There was an error fetching matches. Please try again later.',
            });
        }
    },
};
