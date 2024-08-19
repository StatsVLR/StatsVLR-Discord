const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { api_url, embedColor } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team')
        .setDescription('Fetches detailed information about a Valorant team.')
        .addStringOption(option =>
            option.setName('teamid')
                .setDescription('ID of the team to fetch information for.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const teamId = interaction.options.getString('teamid');

        await interaction.deferReply();

        try {
            const response = await axios.get(`${api_url}/api/v1/teams/${teamId}`);
            const { data } = response.data;

            if (!data) {
                return interaction.editReply({
                    content: 'No data found for the specified team ID.',
                });
            }

            const teamInfo = data.info;
            const teamLogo = teamInfo.logo || 'https://via.placeholder.com/150';

            const embed = new EmbedBuilder()
                .setTitle(teamInfo.name)
                .setDescription(`**Tag:** ${teamInfo.tag}`)
                .setThumbnail(teamLogo)
                .setColor(embedColor)
                .setTimestamp();

            if (data.players.length > 0) {
                let playersDescription = 'Players:\n';
                data.players.forEach(player => {
                    playersDescription += `- **${player.name}** (${player.country})\n`;
                });
                embed.addFields({ name: 'Players', value: playersDescription, inline: false });
            }

            if (data.staff.length > 0) {
                let staffDescription = 'Staff:\n';
                data.staff.forEach(member => {
                    staffDescription += `- **${member.name}** (${member.country})\n`;
                });
                embed.addFields({ name: 'Staff', value: staffDescription, inline: false });
            }

            if (data.results.length > 0) {
                let resultsChunks = [];
                let currentChunk = '';
                data.results.forEach(result => {
                    const resultDescription = `**Event:** ${result.event.name}\n${result.teams.map(team => `- **${team.name}** (${team.tag}): ${team.points} points`).join('\n')}\n\n`;
                    if (currentChunk.length + resultDescription.length > 1024) {
                        resultsChunks.push(currentChunk);
                        currentChunk = '';
                    }
                    currentChunk += resultDescription;
                });
                if (currentChunk) resultsChunks.push(currentChunk);

                resultsChunks.forEach((chunk, index) => {
                    embed.addFields({ name: `Results ${index + 1}`, value: chunk.trim(), inline: false });
                });
            }

            if (data.upcoming.length > 0) {
                let upcomingChunks = [];
                let currentChunk = '';
                data.upcoming.forEach(match => {
                    const matchDescription = `**Event:** ${match.event.name}\n${match.teams.map(team => `- **${team.name}** (${team.tag})`).join('\n')}\n\n`;
                    if (currentChunk.length + matchDescription.length > 1024) {
                        upcomingChunks.push(currentChunk);
                        currentChunk = '';
                    }
                    currentChunk += matchDescription;
                });
                if (currentChunk) upcomingChunks.push(currentChunk);

                upcomingChunks.forEach((chunk, index) => {
                    embed.addFields({ name: `Upcoming Matches ${index + 1}`, value: chunk.trim(), inline: false });
                });
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching team data:', error);
            await interaction.editReply({
                content: 'There was an error fetching the team information. Please try again later.',
            });
        }
    },
};
