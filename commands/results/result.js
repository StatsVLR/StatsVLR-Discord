const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const { api_url, embedColor } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('results')
        .setDescription('Fetches and displays the latest game results.'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const response = await axios.get(`${api_url}/api/v1/results?page=1`);
            
            if (!response.data || !response.data.data || response.data.data.length === 0) {
                return interaction.editReply({ content: 'No results found.' });
            }

            const results = response.data.data;
            const totalPages = results.length;

            const createEmbed = (page) => {
                const result = results[page - 1];
                const embed = new EmbedBuilder()
                    .setTitle(`Event: ${result.event}`)
                    .setDescription(`Tournament: ${result.tournament}`)
                    .setColor(embedColor)
                    .setThumbnail(result.img)
                    .setTimestamp()
                    .setFooter({ text: `Page ${page} of ${totalPages}` });

                result.teams.forEach(team => {
                    embed.addFields(
                        { name: team.name, value: `Score: ${team.score}`, inline: true }
                    );
                });

                embed.addFields(
                    { name: 'Status', value: result.status, inline: true },
                    { name: 'Ago', value: result.ago, inline: true }
                );

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
            console.error('Error fetching results:', error);
            await interaction.editReply({
                content: 'There was an error fetching results. Please try again later.',
            });
        }
    },
};
