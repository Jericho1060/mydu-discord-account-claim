import type { Nitro } from 'nitropack'
import { REST, Routes, Client, GatewayIntentBits } from 'discord.js'

import type { Command } from '~~/shared/command'

import * as CommandsImporter from '~~/server/slashCommands'

const commands = Object.values(CommandsImporter) as Command[]

const permissions = 2147485696

const token = process.env.DISCORD_BOT_TOKEN ?? ''
const clientId = process.env.DISCORD_CLIENT_ID ?? ''

export default async (_nitroApp: Nitro) => {
  const rest = new REST({ version: '10' }).setToken(token)

  try {
    console.log('Started refreshing application (/) commands.')
    const commands_to_register = commands.map(c => c.command)
    console.log('Commands to_register :')
    commands_to_register.forEach(c => console.log(` - ${c.name}`))
    await rest.put(Routes.applicationCommands(clientId), { body: commands_to_register })
    console.log('Successfully reloaded application (/) commands.')
  }
  catch (error) {
    console.error(error)
  }

  const client = new Client({ intents: [GatewayIntentBits.Guilds] })

  client.on('ready', () => {
    console.log(`Logged in as ${client?.user?.tag}!`)
    console.log(`Invite me to your server: https://discord.com/oauth2/authorize?client_id=${clientId}&scope=applications.commands%20bot&permissions=${permissions}`)
    if (process.env.DEBUGLOG) {
      console.log('DEBUG MODE ENABLED')
    }
  })

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return

    // security to lock access of the commands on a spécific server id
    if (process.env.DISCORD_SERVER_ID !== undefined && process.env.DISCORD_SERVER_ID !== interaction.guildId) {
      interaction.reply({ content: 'The use of this bot is not allowed on that server', ephemeral: true })
      return
    }

    for (const command of commands as Command[]) {
      if (command.command.name === interaction.commandName) {
        await command.action(interaction)
        return
      }
    }
  })
  await client.login(token)
}
