import { type CommandInteraction, SlashCommandBuilder } from 'discord.js'
import type { Command } from '~~/shared/command'

const command = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!')

const action = async (interaction: CommandInteraction) => {
  await interaction.reply({ content: 'Pong!', ephemeral: true })
}

const ping = {
  command,
  action,
} as Command

export { ping }
