const { Client, LocalAuth } = require('whatsapp-web.js');
const { when, info } = require('../resources/questions.js');
const qrcode = require('qrcode-terminal');
const { voice, vid_call, voice_call, call, image, when_anw, description, gak_ngerti } = require('../resources/answers.js');
const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Ready bos....');
});

client.initialize();

client.on('message', (message) => {
  console.log(message.type);
  console.log('message.type');

  if (message.type == 'chat') {
    switch (message.body != undefined) {
      case message.body === 'hello' || message.body === 'halo':
        message.reply('Hiiiii');
        break;

      case message.body.includes(when):
        message.reply(when_anw);
        break;

      case message.body.includes(info) || message.body.includes('infi'):
        message.reply(description);
        break;

      default:
        message.reply(gak_ngerti);
        break;
    }
  } else if (message.type == 'ptt') {
    message.reply(voice);
  } else if (message.type == 'call_log') {
    if (message._data.subtype == 'miss_video') {
      message.reply(vid_call);
    } else if (message._data.subtype == 'miss') {
      message.reply(voice_call);
    } else {
      message.reply(call);
    }
  } else if (message.type == 'image') {
    message.reply(image);
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
