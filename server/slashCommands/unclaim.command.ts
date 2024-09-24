import { type CacheType, type Interaction, SlashCommandBuilder } from 'discord.js'
import { Account } from '~~/server/models/mongo'
import type { Command } from '~~/shared/command'
import { claim } from '~/server/slashCommands/claim.command'

const command = new SlashCommandBuilder()
  .setName('claim')
  .setDescription('List your linked accounts.')
  .addStringOption(option => option.setName('my_du_account').setDescription('Your MyDU account name').setRequired(true))

const action = async (interaction: Interaction<CacheType>) => {
  if (!process.env.ALLOW_UNCLAIM_FOR_ALL || process.env.ALLOW_UNCLAIM_FOR_ALL === 'false') {
    interaction.reply({ content: '/unclaim is not allowed on this server, contact an administrator to /unclaim an account.', ephemeral: true })
    return
  }
  // check if the user has already linked the max amount of accounts
  const mydu_account_name = interaction.options.getString('my_du_account')
  const claims = await Account.find({ provider_id: interaction.user.id, du_account_name: mydu_account_name })
  if (claims.length === 0) {
    interaction.reply({ content: 'Claim not found, nothing was deleted.', ephemeral: true })
    return
  }

  for (const claim of claims) {
    await claim.delete()
  }
  await interaction.reply({ content: 'Account successfully unclaimed.', ephemeral: true })
}

const claim = {
  command,
  action,
} as Command

export { claim }
