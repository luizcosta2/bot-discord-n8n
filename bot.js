require('dotenv').config();

const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const app = express();

app.get('/', (req, res) => {
  res.send('Bot Discord + n8n rodando');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor HTTP rodando na porta ${PORT}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('clientReady', () => {
  console.log(`Bot ligado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;

    if (!message.mentions.has(client.user)) return;

    const pergunta = message.content.replace(/<@!?\d+>/g, '').trim();

    if (!pergunta) {
      await message.reply('Manda uma pergunta junto com a marcação.');
      return;
    }

    await message.channel.sendTyping();

    const resposta = await axios.post(process.env.N8N_WEBHOOK_URL, {
      user_id: message.author.id,
      user: message.author.username,
      content: pergunta,
      channel_id: message.channel.id,
      message_id: message.id
    });

    const texto =
      resposta.data.reply ||
      resposta.data.output ||
      resposta.data.text ||
      'Sem resposta da IA.';

    await message.reply(texto);

  } catch (err) {
    console.error('Erro:', err.response?.data || err.message);

    try {
      await message.reply('Erro ao consultar IA.');
    } catch {}
  }
});

client.login(process.env.DISCORD_TOKEN);