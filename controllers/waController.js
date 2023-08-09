const { Client, LocalAuth } = require('whatsapp-web.js');
const readline = require('readline');
const axios = require('axios');
const qrcode = require('qrcode-terminal');
const client = new Client({
  authStrategy: new LocalAuth(),
});
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Ready bos....');
});

client.initialize();

const description = 'Infinity adalah sebuah event tahunan terbesar & terkeren dari UKM PROGRESS';
const tanggal = `
Pelaksanaan event ini akan dilakukan pada bulan *Oktober*, jadi segera daftar dan beli tiketnya disini yaa

https://infinityprogress.id
`;

client.on('message', (message) => {
  console.log(message.type);
  console.log('message.type');

  if (message.type == 'chat') {
    switch (message.body != undefined) {
      case message.body === 'hello':
        message.reply('Hiiiii');
        break;

      case message.body.includes('kapan'):
        message.reply(tanggal);
        break;

      case message.body.includes('infinity'):
        message.reply(description);
        break;

      default:
        message.reply('Apasii yang kamu mau tanya?, ulang dong aku gapaham');
        break;
    }
  } else if (message.type == 'ptt') {
    message.reply('Akuu males denger suara kamuuuu, suaramu kayak knalpot bocor');
  } else if (message.type == 'call_log') {
    if (message._data.subtype == 'miss_video') {
      message.reply('JANGAAN VIDEO CALL AKUUU, AKUU AKU JIJIK MASS');
    } else if (message._data.subtype == 'miss') {
      message.reply('APASIH TELPON-TELPON, MAAF ADA HATI YANG HARUS KU JAGA');
    } else {
      message.reply('GABUT BET LUU JOMBLOO');
    }
  } else if (message.type == 'image') {
    message.reply('Gamau ahh buka fotonya takut mataku ternodai');
  }
});

const api = async (req, res) => {
  let nohp = req.query.nohp || req.body.nohp;
  const pesan = req.query.pesan || req.body.pesan;

  if (!nohp || !pesan) {
    return res.status(400).json({
      status: 'failed',
      pesan: "Parameter 'nohp' dan 'pesan' harus diisi.",
    });
  }

  try {
    if (nohp.startsWith('0')) {
      nohp = '62' + nohp.slice(1) + '@c.us';
    } else if (nohp.startsWith('62')) {
      nohp = nohp + '@c.us';
    } else {
      nohp = '62' + nohp + '@c.us';
    }

    const user = await client.isRegisteredUser(nohp);
    if (user) {
      client.sendMessage(nohp, pesan);
      res.json({
        status: 'success',
        pesan,
      });
    } else {
      res.json({
        status: 'failed',
        pesan: 'Nomor tidak terdaftar',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      pesan: 'Internal Server Error',
    });
  }
};

module.exports = api;
