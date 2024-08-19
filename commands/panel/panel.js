const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Displays a panel with buttons for Player and Team'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Interactive Panel')
            .setDescription('Click one button:')
            .setColor('#0099ff')
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('player')
                    .setLabel('Player')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('team')
                    .setLabel('Team')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({
            embeds: [embed],
            components: [row],
        });

        const filter = i => i.customId === 'player' || i.customId === 'team';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'player') {
                await i.reply({ content: 'You clicked the Player button!', ephemeral: true });
            } else if (i.customId === 'team') {
                await i.reply({ content: 'You clicked the Team button!', ephemeral: true });
            }
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} interactions.`);
        });
    },
};
