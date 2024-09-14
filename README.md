# MyDU Discord Account Claim

It's a simple discord bot that permit players to claim their account on the MyDU server.
By claiming the account, they are linking their discord account to their MyDU account. You can then decide how many accounts a player can claim and block login for unclaimed accounts.

# Setup on your MyDU server

### Adding the docker container to the existing stack 

Create a Discord app from the Discord developer portal and get the client ID and the bot token: https://discord.com/developers/applications

Add the container to the Docker stack:

In `docker-compose.yml` add the following container and replace `<Discord_Client_ID>` and `<Discord_Bot_Token>` with the values you got from the Discord developer portal. You can also remplace `<Max_Accounts>` with the maximum number of accounts a player can claim.

You can optionally add a list of accounts, comma separated, that can't be claimed by the players. This is useful to prevent the claim of the admin account for example. If you don't want to block any account, you can remove the `NOT_CLAIMABLE_ACCOUNTS` line. These accounts will always be able to login, even if they are not claimed.

```yml
    mydu-discord-account-claim:
      hostname: mydu-discord-account-claim
      image: jericho1060/mydu-discord-account-claim:latest
      restart: always
      environment:
        - DISCORD_CLIENT_ID=<Discord_Client_ID>
        - DISCORD_BOT_TOKEN=<Discord_Bot_Token>
        - MAX_ACCOUNTS=<Max_Accounts>
        - NOT_CLAIMABLE_ACCOUNTS=admin
      networks:
        vpcbr:
          ipv4_address: 10.5.0.21
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

### Bot commands

The bot has 2 commands:
- `/list` to list the claimed accounts
- `/claim` to claim an account
- `/ping` to check if the bot is alive

### Work in progress

- [ ] Add a command to unclaim an account with an option to enable it only for admins
- [ ] Add a simple web interface to manage the claimed accounts and for admins
- [ ] Add an option to verify if the discord account is still present in the server

### Support or donation

if you like it, [<img src="https://github.com/Jericho1060/DU-Industry-HUD/blob/main/ressources/images/ko-fi.png?raw=true" width="150">](https://ko-fi.com/jericho1060)