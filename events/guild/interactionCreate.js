module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        } else if (interaction.isButton()) {
            const buttonHandler = require('./buttonCreate');
            try {
                await buttonHandler.execute(interaction);
            } catch (error) {
                console.error('Error handling button interaction:', error);
                await interaction.reply({ content: 'There was an error while processing your button interaction.', ephemeral: true });
            }
        } else if (interaction.isModalSubmit()) {
            const modalHandler = require('./modalCreate');
            try {
                await modalHandler.execute(interaction);
            } catch (error) {
                console.error('Error handling modal submission:', error);
                await interaction.reply({ content: 'There was an error while processing your modal submission.', ephemeral: true });
            }
        }
    },
};
