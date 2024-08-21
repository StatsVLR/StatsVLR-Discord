const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const { api_url, embedColor } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('news')
        .setDescription('Fetches and displays the latest news articles.'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const response = await axios.get(`${api_url}/api/v1/news`);
            
            if (!response || !response.data || response.data.status !== 'OK' || !Array.isArray(response.data.data)) {
                return interaction.editReply({ content: 'No news articles found.' });
            }

            const newsSegments = response.data.data;
            const totalPages = newsSegments.length;

            if (totalPages === 0) {
                return interaction.editReply({ content: 'No news articles found.' });
            }

            const createEmbed = (page) => {
                const article = newsSegments[page - 1];
                const descriptionWords = article.description.split(' ');
                const title = descriptionWords.length > 4 ? 
                    `${descriptionWords.slice(0, 4).join(' ')}...` : 
                    article.description;
                
                const embed = new EmbedBuilder()
                    .setTitle(title || 'No Title')
                    .setDescription(article.description || 'No Description')
                    .setColor(embedColor)
                    .setURL(article.url_path)
                    .addFields(
                        { name: 'Author', value: article.author || 'Unknown', inline: true },
                        { name: 'Date', value: article.date || 'No Date', inline: true }
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

                if (currentPage < 1) currentPage = 1;
                if (currentPage > totalPages) currentPage = totalPages;

                const newEmbed = createEmbed(currentPage);

                try {
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
                } catch (err) {
                    console.error('Error updating message:', err);
                }
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
                }).catch(err => console.error('Error editing message on collector end:', err));
            });
        } catch (error) {
            console.error('Error fetching news:', error);
            await interaction.editReply({
                content: 'There was an error fetching news articles. Please try again later.',
            });
        }
    },
};
