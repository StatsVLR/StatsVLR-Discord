const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { api_url2, embedColor, authHeader } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('account')
        .setDescription('Fetches detailed information about a Valorant account.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the Valorant account.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('tag')
                .setDescription('The tag of the Valorant account.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const name = interaction.options.getString('name');
        const tag = interaction.options.getString('tag');
        await interaction.deferReply({ ephemeral: false });

        try {
            const response = await axios.get(`${api_url2}/valorant/v1/account/${name}/${tag}`, {
                headers: {
                    'Authorization': authHeader
                }
            });

            if (!response.data || !response.data.data) {
                return interaction.editReply({ content: 'Unexpected response structure from API.', ephemeral: true });
            }

            const accountData = response.data.data;
            const embed = new EmbedBuilder()
                .setTitle(`${accountData.name}#${accountData.tag}`)
                .setURL(`https://tracker.gg/valorant/profile/riot/${name}%23${tag}/overview`)
                .setThumbnail(accountData.card.large)
                .setColor(embedColor)
                .setTimestamp();

            embed.addFields(
                { name: 'PUUID', value: accountData.puuid, inline: true },
                { name: 'Region', value: accountData.region, inline: true }
            );

            await interaction.editReply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error fetching account data:', error);
            await interaction.editReply({
                content: 'There was an error fetching account information. Please try again later.',
                ephemeral: true
            });
        }
    },
};
