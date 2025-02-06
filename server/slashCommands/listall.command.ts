import { setTimeout } from 'node:timers/promises'
import { type CommandInteraction, SlashCommandBuilder, PermissionsBitField, MessageFlags } from 'discord.js'
import { Account } from '../models/mongo'
import type { Command } from '#shared/command'

interface LinkedAccounts {
  provider_id: string
  du_account_names: string[]
}

const command = new SlashCommandBuilder()
  .setName('listall')
  .setDescription('List all linked accounts.')

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
  const accounts = await Account.find({ })
  if (accounts.length === 0) {
    await interaction.reply({ content: 'Not any account linked yet.', flags: MessageFlags.Ephemeral })
    return
  }
  // group accounts in to LinkedAccount based on provider_id
  const linkedAccounts: { [key: string]: LinkedAccounts } = {}
  accounts.forEach((a) => {
    if (!linkedAccounts[a.provider_id]) {
      linkedAccounts[a.provider_id] = {
        provider_id: a.provider_id,
        du_account_names: [],
      }
    }
    linkedAccounts[a.provider_id].du_account_names.push(a.du_account_name)
  })

  // build the message with one line by provider id
  const messageLines = Object.values(linkedAccounts).map((a) => {
    const accountNames = a.du_account_names.join(', ')
    return `<@${a.provider_id}>: ${accountNames}`
  })
  // each message must be 2000 characters or fewer in discord
  const MAX_MESSAGE_LENGTH = 2000
  const messageSections = []
  let currentSection = ''
  messageLines.forEach((line) => {
    if (currentSection.length + line.length + 1 > MAX_MESSAGE_LENGTH) {
      messageSections.push(currentSection)
      currentSection = ''
    }
    currentSection += line + '\n'
  })
  if (currentSection.length > 0) {
    messageSections.push(currentSection)
  }

  // send each section every 0.1s to avoid beeing blocked by Discord
  let first: boolean = true
  for (const section of messageSections) {
    if (first) {
      await interaction.reply({ content: section, flags: MessageFlags.Ephemeral })
      first = false
    }
    else {
      await interaction.followUp({ content: section, flags: MessageFlags.Ephemeral })
    }
    await setTimeout(100)
  }
}

const listall = {
  command,
  action,
} as Command

export { listall }
