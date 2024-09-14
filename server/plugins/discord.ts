import type { Nitro } from 'nitropack'
import { REST, Routes, Client, GatewayIntentBits, SlashCommandBuilder } from 'discord.js'
import { eq } from 'drizzle-orm'
import { Account } from '~/server/models/mongo'
import { auth } from '~/server/models/postgres/auth.model'

const permissions = 2147485696

const token = process.env.DISCORD_BOT_TOKEN ?? ''
const clientId = process.env.DISCORD_CLIENT_ID ?? ''

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  new SlashCommandBuilder()
    .setName('claim')
    .setDescription('Claim a MyDU account with your Discord account')
    .addStringOption(option => option.setName('my_du_account').setDescription('Your MyDU account name').setRequired(true)),
  new SlashCommandBuilder()
    .setName('list')
    .setDescription('List your linked accounts'),
]

export default async (_nitroApp: Nitro) => {
  const rest = new REST({ version: '10' }).setToken(token)

  try {
    console.log('Started refreshing application (/) commands.')
    await rest.put(Routes.applicationCommands(clientId), { body: commands })
    console.log('Successfully reloaded application (/) commands.')
  }
  catch (error) {
    console.error(error)
  }

  const client = new Client({ intents: [GatewayIntentBits.Guilds] })

  client.on('ready', () => {
    console.log(`Logged in as ${client?.user?.tag}!`)
    console.log(`Invite me to your server: https://discord.com/oauth2/authorize?client_id=${clientId}&scope=applications.commands%20bot&permissions=${permissions}`)
  })

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return
    if (interaction.commandName === 'ping') {
      await interaction.reply({ content: 'Pong!', ephemeral: true })
    }
    else if (interaction.commandName === 'list') {
      const accounts = await Account.find({ provider_id: interaction.user.id })
      if (accounts.length === 0) {
        await interaction.reply({ content: 'You have not linked any accounts.', ephemeral: true })
        return
      }
      const account_names = accounts.map(a => a.du_account_name).join(', ')
      await interaction.reply({ content: `Linked accounts: ${account_names}`, ephemeral: true })
    }
    else if (interaction.commandName === 'claim') {
      // check if the user has already linked the max amount of accounts
      const accounts = await Account.find({ provider_id: interaction.user.id })
      if (accounts.length >= Number.parseInt(process.env.MAX_ACCOUNTS as string)) {
        await interaction.reply({ content: 'You have already linked the maximum amount of accounts.', ephemeral: true })
        return
      }
      // check if the acount is already linked
      const mydu_account_name = interaction.options.getString('my_du_account')
      if (!mydu_account_name) {
        await interaction.reply({ content: 'Please provide a MyDU account name.', ephemeral: true })
        return
      }
      // ignore not claimable accounts
      const not_claimable_list = process.env.NOT_CLAIMABLE_ACCOUNTS?.split(',') ?? []
      if (not_claimable_list.includes(mydu_account_name)) {
        await interaction.reply({ content: 'This account is not claimable.', ephemeral: true })
        return
      }
      const a = await Account.findOne({ du_account_name: mydu_account_name })
      if (a) {
        await interaction.reply({ content: 'This account is already linked to a Discord account.', ephemeral: true })
        return
      }
      // search for the du account in the database
      const db = await getPgClient()
      const du_account = await db.query.auth.findFirst({
        where: eq(auth.user_name, mydu_account_name),
      })
      if (!du_account) {
        await interaction.reply({ content: 'This account does not exist.', ephemeral: true })
        return
      }
      // link the account
      await new Account({
        provider: 'discord',
        provider_id: interaction.user.id,
        du_account_name: du_account.user_name,
        du_account_id: du_account.id,
      }).save()
      await interaction.reply({ content: 'Account linked successfully.', ephemeral: true })
    }
  })
  await client.login(token)
}
