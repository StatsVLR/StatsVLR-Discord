const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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

            const chunkSize = 10;
            const resultChunks = [];
            for (let i = 0; i < results.length; i += chunkSize) {
                resultChunks.push(results.slice(i, i + chunkSize));
            }

            for (const chunk of resultChunks) {
                const embeds = chunk.map(result => {
                    const embed = new EmbedBuilder()
                        .setTitle(`Event: ${result.event}`)
                        .setDescription(`Tournament: ${result.tournament}`)
                        .setColor(embedColor)
                        .setThumbnail(result.img)
                        .setTimestamp();

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
                });

                await interaction.followUp({ embeds });
            }

            await interaction.editReply({ content: 'Results fetched and sent.' });
        } catch (error) {
            console.error('Error fetching results:', error);
            await interaction.editReply({
                content: 'There was an error fetching results. Please try again later.',
            });
        }
    },
};
