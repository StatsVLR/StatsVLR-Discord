const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const { api_url, embedColor } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('events')
        .setDescription('Fetches and displays upcoming, ongoing, or completed events.')
        .addStringOption(option =>
            option.setName('status')
                .setDescription('Filter events by status')
                .addChoices(
                    { name: 'Upcoming', value: 'upcoming' },
                    { name: 'Ongoing', value: 'ongoing' },
                    { name: 'Completed', value: 'completed' },
                    { name: 'All', value: 'all' }
                )
                .setRequired(false))
        .addStringOption(option =>
            option.setName('region')
                .setDescription('Filter events by region')
                .addChoices(
                    { name: 'NA', value: 'na' },
                    { name: 'EU', value: 'eu' },
                    { name: 'BR', value: 'br' },
                    { name: 'AP', value: 'ap' },
                    { name: 'KR', value: 'kr' },
                    { name: 'CH', value: 'ch' },
                    { name: 'JP', value: 'jp' },
                    { name: 'LAN', value: 'lan' },
                    { name: 'LAS', value: 'las' },
                    { name: 'OCE', value: 'oce' },
                    { name: 'MN', value: 'mn' },
                    { name: 'GC', value: 'gc' },
                    { name: 'All', value: 'all' }
                )
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        const status = interaction.options.getString('status') || 'all';
        const region = interaction.options.getString('region') || 'all';

        try {
            const response = await axios.get(`${api_url}/api/v1/events`, {
                params: {
                    page: 1,
                    status: status,
                    region: region
                }
            });
            
            if (!response.data || !response.data.data || response.data.data.length === 0) {
                return interaction.editReply({ content: 'No events found.' });
            }

            const events = response.data.data;
            const maxEmbedsPerPage = 10;
            const totalPages = Math.ceil(events.length / maxEmbedsPerPage);

            const createEmbeds = (page) => {
                const embeds = [];
                const start = (page - 1) * maxEmbedsPerPage;
                const end = Math.min(start + maxEmbedsPerPage, events.length);

                for (let i = start; i < end; i++) {
                    const event = events[i];
                    const embed = new EmbedBuilder()
                        .setTitle(event.name)
                        .setDescription(`Status: ${event.status}\nPrize Pool: ${event.prizepool}\nDates: ${event.dates}\nCountry: ${event.country}`)
                        .setColor(embedColor)
                        .setThumbnail(event.img)
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
            console.error('Error fetching events:', error);
            await interaction.editReply({
                content: 'There was an error fetching events. Please try again later.',
            });
        }
    },
};
