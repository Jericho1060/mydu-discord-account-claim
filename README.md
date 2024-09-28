# MyDU Discord Account Claim

It's a simple discord bot that permit players to claim their account on the MyDU server.
By claiming the account, they are linking their discord account to their MyDU account. You can then decide how many accounts a player can claim and block login for unclaimed accounts.

# Discord Server

You can join me on Discord for help or suggestions or requests by following that link : https://discord.gg/qkdjyqDZQZ

# Setup on your MyDU server

## Installation

### Adding the docker container to the existing stack 

Create a Discord app from the Discord developer portal and get the client ID and the bot token: https://discord.com/developers/applications

Add the container to the Docker stack:

In `docker-compose.yml` add the following container and replace `<Discord_Client_ID>` and `<Discord_Bot_Token>` with the values you got from the Discord developer portal. You can also replace `<Max_Accounts>` with the maximum number of accounts a player can claim.

Replace `Discord_Server_Id` by the ID of your discord server or the commands will be usable on another server if someone invite it somewhere else. If you don't know how to get your server ID, refer to this official article in the Discord Documentation: https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID

You can optionally add a list of accounts, comma separated, that can't be claimed by the players. This is useful to prevent the claim of the admin account for example. If you don't want to block any account, you can remove the `NOT_CLAIMABLE_ACCOUNTS` line. These accounts will always be able to login, even if they are not claimed. (from the `Users` menu of the BO not from `Players`)

```yml
    mydu-discord-account-claim:
      hostname: mydu-discord-account-claim # name used in the url to access the webhook
      image: jericho1060/mydu-discord-account-claim:latest
      restart: always # in case of a crash of the container, restart is asap
      environment:
        - DISCORD_CLIENT_ID=<Discord_Client_ID> # Discord Client ID
        - DISCORD_BOT_TOKEN=<Discord_Bot_Token> # Discord bot Secret Token
        - DISCORD_SERVER_ID=<Discord_Server_Id> # You discord server ID, set it to protect from admin commands to be used from another server
        - MAX_ACCOUNTS=<Max_Accounts> # set this value as to limit the number of MyDU account a discord account can claim 
        - ALLOW_UNCLAIM_FOR_ALL=false # must be true to allow any user to unclaim an account at any moment
        - NOT_CLAIMABLE_ACCOUNTS=admin # list of account, comma separated, than can't be claimed. You also need to add any bot from other mods here. These accounts don't need a claim to login on the MyDU Server. These names are from the "users" menu of the BO, not from the "players" menu,
      networks:
        vpcbr:
          ipv4_address: 10.5.0.21 # This address must be unique between all containers, you can change this value
```

Then, add the container to the startup script in `/scripts/up.sh` on linux or `/scripts/up.bat` on windows.
```shell
docker-compose up -d mydu-discord-account-claim
```

Then update you server with the following command:
```shell
docker-compose pull
```
And restart the My Dual Universe stack.

### Invite the bot to your server

You can check the container log to get the link to invite the bot to your server. It's displayed each time the container restarts.

If you don't know how to see the link in the log, you can generate it with that one, replacing `<Discord_Client_ID>` with the value you got from the Discord developer portal.
```
https://discord.com/oauth2/authorize?client_id=<Discord_Client_ID>&scope=applications.commands%20bot&permissions=2147485696
```

### block login for unclaimed accounts

Update the file `/config/dual.yml`, in the service `auth`, add the following line:
```yml
  auth_hook_url: "http://mydu-discord-account-claim:3000/api/linked"
```

## Updating

### Commands to use in the server directory

```shell
docker-compose pull
docker-compose down mydu-discord-account-claim
docker-compose up -d mydu-discord-account-claim
```

# Bot commands

The bot has 2 commands:
- `/list` to list your claimed accounts
- `/listall` to list all the claimed accounts (must be discord server administrator to use it)
- `/claim` to claim an account
- `/unclaim` to release an already claimed account
- `/unclaimfor` to release an already claimed account for someone else  (must be discord server administrator to use it)
- `/ping` to check if the bot is alive

# Work in progress

- [x] Add admin command to list all the claims
- [x] Add a command to unclaim for users, can be disabled
- [x] Add admin command to unclaim any account
- [ ] Add a simple web interface to manage the claimed accounts and for admins
- [ ] Add SSL certificate for web access
- [ ] Add an option to verify if the discord account is still present in the server

# Support or donation

if you like it, [<img src="https://github.com/Jericho1060/DU-Industry-HUD/blob/main/ressources/images/ko-fi.png?raw=true" width="150">](https://ko-fi.com/jericho1060)