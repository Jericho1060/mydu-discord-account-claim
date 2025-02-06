import { type CommandInteraction, SlashCommandBuilder, MessageFlags } from 'discord.js'
import { Account } from '~~/server/models/mongo'
import type { Command } from '#shared/command'

const command = new SlashCommandBuilder()
  .setName('unclaim')
  .setDescription('Released an account you claimed before.')
  .addStringOption(option => option.setName('my_du_account').setDescription('Your MyDU account name').setRequired(true))

const action = async (interaction: CommandInteraction) => {
  if (!process.env.ALLOW_UNCLAIM_FOR_ALL || process.env.ALLOW_UNCLAIM_FOR_ALL === 'false') {
    await interaction.reply({ content: '/unclaim is not allowed on this server, contact an administrator to /unclaim an account.', flags: MessageFlags.Ephemeral })
    return
  }
  // check if the user has already linked the max amount of accounts
  const mydu_account_name = interaction.options.getString('my_du_account')
  const claims = await Account.find({ provider_id: interaction.user.id, du_account_name: mydu_account_name })
  console.log(claims)
  if (claims.length === 0) {
    await interaction.reply({ content: 'Claim not found, nothing was deleted.', flags: MessageFlags.Ephemeral })
    return
  }

  await Account.deleteOne({ provider_id: interaction.user.id, du_account_name: mydu_account_name })

  await interaction.reply({ content: 'Account successfully unclaimed.', flags: MessageFlags.Ephemeral })
}

const unclaim = {
  command,
  action,
} as Command

export { unclaim }
