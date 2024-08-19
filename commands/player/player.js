const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { api_url, embedColor } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infoplayer')
        .setDescription('Fetches detailed information about a specific Valorant player.')
        .addStringOption(option =>
            option.setName('playerid')
                .setDescription('The ID of the player to fetch information about.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const playerId = interaction.options.getString('playerid');
        await interaction.deferReply();

        try {
            const response = await axios.get(`${api_url}/api/v1/players/${playerId}`);

            if (!response.data || !response.data.data) {
                return interaction.editReply({ content: 'Unexpected response structure from API.' });
            }

            const playerData = response.data.data;
            const embed = new EmbedBuilder()
                .setTitle(playerData.info.name)
                .setURL(playerData.info.url)
                .setThumbnail(playerData.info.img)
                .setColor(embedColor)
                .setTimestamp();

            embed.addFields(
                { name: 'Country', value: playerData.info.country, inline: true },
                { name: 'Team', value: playerData.team ? playerData.team.name : 'Not on a team', inline: true },
                { name: 'Joined', value: playerData.team ? playerData.team.joined : 'N/A', inline: true }
            );

            let socials = '';
            if (playerData.socials.twitter) {
                socials += `**Twitter:** [${playerData.socials.twitter}](${playerData.socials.twitter_url})\n`;
            }
            if (playerData.socials.twitch) {
                socials += `**Twitch:** [${playerData.socials.twitch}](${playerData.socials.twitch_url})\n`;
            }
            embed.addFields({ name: 'Socials', value: socials || 'No social links available', inline: false });

            let results = '';
            playerData.results.forEach(result => {
                let resultText = `**Event:** [${result.event.name}](${result.event.logo})\n`;
                result.teams.forEach(team => {
                    resultText += `- **${team.name}** (${team.tag}) - [Logo](${team.logo})\n`;
                });
                resultText += `- **Match:** [Link](${result.match.url})\n\n`;

                if (results.length + resultText.length > 1024) {
                    embed.addFields({ name: 'Results', value: results || 'No results available', inline: false });
                    results = '';
                }
                results += resultText;
            });
            if (results) {
                embed.addFields({ name: 'Results', value: results, inline: false });
            }

            let pastTeams = '';
            playerData.pastTeams.forEach(team => {
                let pastTeamText = `**${team.name}**\n`;
                pastTeamText += `- [Logo](${team.logo})\n`;
                pastTeamText += `- Info: ${team.info}\n\n`;

                if (pastTeams.length + pastTeamText.length > 1024) {
                    embed.addFields({ name: 'Past Teams', value: pastTeams || 'No past teams available', inline: false });
                    pastTeams = '';
                }
                pastTeams += pastTeamText;
            });
            if (pastTeams) {
                embed.addFields({ name: 'Past Teams', value: pastTeams, inline: false });
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching player data:', error);
            await interaction.editReply({
                content: 'There was an error fetching player information. Please try again later.',
            });
        }
    },
};
