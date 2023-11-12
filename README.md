# MokBot
My Discord bot, written in Typescript, hosted on Cloudflare Workers, uses interactions endpoint URL

## Installation and setup
Clone the repository, run `npm install`.

### Environment variables
When developing locally, the `.dev.vars` file is used for environment variables.
`wrangler.toml` file contains the environment variables that will be used in production.

At this moment, `DISCORD_BOT_TOKEN` is only used when registering commands in the `tools/register.ts` script. It is not required in production environment, and thus should only exist in `.dev.vars` file.

## Running in development
To run the bot during development, use `npm run dev`. To update application commands, use `npm run register_dev`. Make sure the `DISCORD_DEV_SERVER_ID` environment variable exists in `.dev.vars` file.

### Making local machine accessible to Discord
If you do not have an IP address that can be directly accessed from the internet, you need to set up a gateway. Recommended setup using [ngrok](https://ngrok.com):
```bash
ngrok http 8787
```
8787 is the default port for wrangler dev environment.

### Adding web endpoint in Discord application settings
Go to https://discord.com/developers/applications, select your application, and in General Information set the "INTERACTIONS ENDPOINT URL" to your public url. If you cannot save the changes, it means Discord could not reach your endpoint.

## Deploying
To deploy the bot, make sure the `wrangler.toml` file has all of the environment variables as described [in the section above](#environment-variables).

To register all commands globally, use `npm run register`.

After deploying, copy the worker url and paste it in application settings [as described above](#adding-web-endpoint-in-discord-application-settings).

## NPM Scripts
* `npm run deploy` - Deploy the worker
* `npm run dev` - Run in development
* `npm run register` - Register bot commands globally
* `npm run register_dev` - Register bot commands in a guild specified in `DISCORD_DEV_SERVER_ID` environment variable in `.dev.vars`. Used in development to frequently update commands.
* `npm run clear_dev_commands` - Remove all bot commands in the dev guild.
* `npm run clear_commands` - Remove all global commands.
