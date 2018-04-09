# Guilty Spark Bot

Quick and Dirty discord bot for handling LFG requests.

Allows your users to create a game. Once a game is created users can join or leave the game. Users in a game receive a notification when another user uses the host command.

## Use

`!lfg add <game>`

Adds the game to the list of games. Also joins the user who executed it to the game. This game is now visible via the `!lfg list` command

`!lfg join <game>`

Joins the user to the indicated game. The user then is in the notification list when a game is hosted

`!lfg leave <game>`

Removes the user from the indicated game.

`!lfg list`

Displays a list of games that can be used with the `!lfg host` command.

`!lfg host <game>`

Sends a message with the list of all users joined to a game, that a user wants to play the game.

## Getting Started

Remix this glitch.

Go to discord and create a bot.

Create a bot user for that bot.

Set the bot users token in .env.

Invite that bot to your server.

Use the bot.

## Todo

Better instructions