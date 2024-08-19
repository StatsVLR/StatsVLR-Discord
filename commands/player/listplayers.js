const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { api_url, embedColor } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listplayers')
        .setDescription('Fetches a list of teams from a specified region.')
        .addStringOption(option =>
            option.setName('region')
                .setDescription('Specify the region (e.g., na, eu, br, etc.)')
                .setRequired(true)
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
                ))
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number (default is 1)')
                .setMinValue(1)
        )
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Number of results per page (default is 8)')
                .setMinValue(1)
                .setMaxValue(8)
        ),

    async execute(interaction) {
        const region = interaction.options.getString('region') || 'all';
        const page = interaction.options.getInteger('page') || 1;
        const limit = interaction.options.getInteger('limit') || 8;

        await interaction.deferReply();

        try {
            const response = await axios.get(`${api_url}/api/v1/teams`, {
                params: {
                    region,
                    page,
                    limit
                }
            });

            const { data, pagination } = response.data;

            if (data.length === 0) {
                return interaction.editReply({
                    content: 'No teams found for the specified region.',
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(`Teams in Region: ${region.toUpperCase()}`)
                .setColor(embedColor)
                .setFooter({ text: `Page ${pagination.page} of ${pagination.totalPages}` })
                .setTimestamp();

            data.forEach((team, index) => {
                embed.addFields(
                    { name: `Team ${index + 1}`, value: team.name, inline: true },
                    { name: 'Country', value: team.country || 'Unknown', inline: true },
                    { name: 'Stats', value: `[View](${team.url})`, inline: true }
                );
            });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching teams:', error);
            await interaction.editReply({
                content: 'There was an error fetching the teams. Please try again later.',
            });
        }
    },
};
