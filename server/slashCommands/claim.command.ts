import { type CommandInteraction, SlashCommandBuilder, MessageFlags } from 'discord.js'
import { eq } from 'drizzle-orm'
import { Account } from '../models/mongo'
import { auth } from '../models/postgres'
import type { Command } from '#shared/command'

const command = new SlashCommandBuilder()
  .setName('claim')
  .setDescription('List your linked accounts.')
  .addStringOption(option => option.setName('my_du_account').setDescription('Your MyDU account name').setRequired(true))

const action = async (interaction: CommandInteraction) => {
  // check if the user has already linked the max amount of accounts
  const accounts = await Account.find({ provider_id: interaction.user.id })
  if (accounts.length >= Number.parseInt(process.env.MAX_ACCOUNTS as string)) {
    await interaction.reply({ content: 'You have already linked the maximum amount of accounts.', flags: MessageFlags.Ephemeral })
    return
  }
  // check if the acount is already linked
  const mydu_account_name = interaction.options.getString('my_du_account')
  if (!mydu_account_name) {
    await interaction.reply({ content: 'Please provide a MyDU account name.', flags: MessageFlags.Ephemeral })
    return
  }
  // ignore not claimable accounts
  const not_claimable_list = process.env.NOT_CLAIMABLE_ACCOUNTS?.split(',') ?? []
  if (not_claimable_list.includes(mydu_account_name)) {
    await interaction.reply({ content: 'This account is not claimable.', flags: MessageFlags.Ephemeral })
    return
  }
  const a = await Account.findOne({ du_account_name: mydu_account_name })
  if (a) {
    await interaction.reply({ content: 'This account is already linked to a Discord account.', flags: MessageFlags.Ephemeral })
    return
  }
  // search for the du account in the database
  const db = await getPgClient()
  const du_account = await db.query.auth.findFirst({
    where: eq(auth.user_name, mydu_account_name),
  })
  if (!du_account) {
    await interaction.reply({ content: 'This account does not exist.', flags: MessageFlags.Ephemeral })
    return
  }
  // link the account
  await new Account({
    provider: 'discord',
    provider_id: interaction.user.id,
    du_account_name: du_account.user_name,
    du_account_id: du_account.id,
  }).save()
  await interaction.reply({ content: 'Account linked successfully.', flags: MessageFlags.Ephemeral })
}

const claim = {
  command,
  action,
} as Command

export { claim }
