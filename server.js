const Eris = require('eris')

const bot = new Eris(process.env.DISCORD_BOT_TOKEN); // Replace DISCORD_BOT_TOKEN in .env with your bot accounts token

var low = require('lowdb')

const FileAsync = require('lowdb/adapters/FileAsync')

const adapter = new FileAsync('.data/db.json')

low(adapter).then(db => {
  db.defaults({ games: {} }).write()

  const addGame = game => {
    return new Promise((resolve, reject) => {
      if (db.has(`games.${game}`).value()) {
        return reject(`Game already exists. Use !lfg join ${game}`)
      }

      db.set(`games.${game}`, { watchers: [] }).write()

      return resolve()
    })
  }

  const addUserToGame = (game, user) => {
    return new Promise((resolve, reject) => {
      if (!db.has(`games.${game}`).value()) {
        return reject('No such game')
      }

      if (db.get(`games.${game}.watchers`).value().indexOf(user) == -1) {
        db.get(`games.${game}.watchers`).push(user).write()
      }

      return resolve()
    })
  }

  const removeUserFromGame = (game, user) => {
    return new Promise((resolve, reject) => {
      if (!db.has(`games.${game}`).value()) {
        return reject('No such game')
      }

      const index = db.get(`games.${game}.watchers`).value().indexOf(user)
      if (index !== -1) {
        db.get(`games.${game}.watchers`).splice(index).write()
      }

      return resolve()
    })
  }

  const hostGame = (game, user) => {
    return new Promise((resolve, reject) => {
      if (!db.has(`games.${game}`).value()) {
        return reject('No such game')
      }

      return resolve(db.get(`games.${game}.watchers`).value().join(','))
    })
  }

  const commands = {
    'help': (msg, bot) => {
      bot.createMessage(msg.channel.id, `
!lfg add <Game> - adds a game
!lfg host <Game> - host a game
!lfg join <Game> - get notified if someone hosts
!lfg leave <Game> - stop getting notified if someone hosts
      `)
    },
    'lfg': (msg, bot) => {
      const parts = msg.content.split(' ')
      let command = ''

      if (parts.length >= 2) {
        command = parts[1]
        if (command == 'list') {
          bot.createMessage(msg.channel.id, `Available games ${Object.keys(db.get('games').value()).join(', ')}`)
          return
        }
      }

      if (parts.length !== 3) {
        bot.createMessage(msg.channel.id, 'Invalid command use `!help lfg` for more info')
        return
      }

      const game = parts[2]

      switch (command) {
        case 'add':
          addGame(game, msg.author.mention)
            .then(_ => bot.createMessage(msg.channel.id, `${game} added`))
            .then(_ => addUserToGame(game, msg.author.mention))
            .catch(err => bot.createMessage(msg.channel.id, err))
          break
        case 'join':
          addUserToGame(game, msg.author.mention)
            .then(_ => bot.createMessage(msg.channel.id, `${game} being followed, use !lfg leave ${game} to stop`))
            .catch(err => bot.createMessage(msg.channel.id, err))
          break
        case 'leave':
          removeUserFromGame(game, msg.author.mention)
            .then(_ => bot.createMessage(msg.channel.id, `${game} left`))
            .catch(err => bot.createMessage(msg.channel.id, err))
          break
        case 'host':
          hostGame(game, msg.author.mention)
            .then(watchers => bot.createMessage(msg.channel.id, `${msg.author.mention} is hosting a game of ${game}. Notifying ${watchers}`))
            .catch(err => bot.createMessage(msg.channel.id, err))
          break

      }
    }
  }
  bot.on('ready', () => {
    console.log(`Server started at ${new Date()}`)
  })

  bot.on('messageCreate', (msg) => {
    Object.keys(commands).forEach(command => {
      if (msg.content.indexOf(`!${command}`) === 0) {
        console.log(`Running the ${command}`)
        commands[command](msg, bot)
      }
    })
  })

  bot.connect()
})
