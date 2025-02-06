import { type CommandInteraction, SlashCommandBuilder, PermissionsBitField, MessageFlags } from 'discord.js'
import { Account } from '../models/mongo'
import type { Command } from '../../shared/command'

const command = new SlashCommandBuilder()
  .setName('unclaimfor')
  .setDescription('Released an account someone claimed before.')
  .addUserOption(option => option.setName('discord_username').setDescription('The Discord user that claimed the account').setRequired(true))
  .addStringOption(option => option.setName('my_du_account').setDescription('Your MyDU account name').setRequired(true))

const action = async (interaction: CommandInteraction) => {
  // reject if the user is not admin of the server
  const member = interaction.member
  if (!member) {
    console.error('member not found')
    return
  }
  const m_permissions = member.permissions as Readonly<PermissionsBitField>
  if (!m_permissions) {
    console.error('permissions not found')
    return
  }
  if (!m_permissions.has(PermissionsBitField.Flags.Administrator)) {
    await interaction.reply({ content: 'You must be an admin to use this command.', flags: MessageFlags.Ephemeral })
    return
  }
  // check if the user has already linked the max amount of accounts
  const discord_id = interaction.options.getUser('discord_username').id
  const mydu_account_name = interaction.options.getString('my_du_account')
  const claims = await Account.find({ provider_id: discord_id, du_account_name: mydu_account_name })
  if (claims.length === 0) {
    await interaction.reply({ content: 'Claim not found, nothing was deleted.', flags: MessageFlags.Ephemeral })
    return
  }

  await Account.deleteOne({ provider_id: discord_id, du_account_name: mydu_account_name })

  await interaction.reply({ content: 'Account successfully unclaimed.', flags: MessageFlags.Ephemeral })
}

const unclaimfor = {
  command,
  action,
} as Command

export { unclaimfor }
