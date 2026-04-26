require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Bot ligado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;

    // só responde quando marcar o bot
    if (!message.mentions.has(client.user)) return;

    const pergunta = message.content.replace(/<@!?\d+>/g, '').trim();

    if (!pergunta) {
      await message.reply('Manda algo junto com a marcação.');
      return;
    }

    await message.channel.sendTyping();

    const resposta = await axios.post(process.env.N8N_WEBHOOK_URL, {
      user: message.author.username,
      content: pergunta
    });

    const texto =
      resposta.data.reply ||
      resposta.data.output ||
      'Sem resposta da IA.';

    await message.reply(texto);

  } catch (err) {
    console.error(err);
    await message.reply('Erro ao consultar IA.');
  }
});

client.login(process.env.DISCORD_TOKEN);