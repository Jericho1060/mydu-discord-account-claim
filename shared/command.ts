import type { CacheType, Interaction, SlashCommandBuilder } from 'discord.js'

export interface Command {
  command: SlashCommandBuilder
  action: (interaction: Interaction<CacheType>) => Promise<void>
}
