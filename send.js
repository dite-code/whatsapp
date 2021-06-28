var param = process.argv.slice(2);
var no = param[0]+'@s.whatsapp.net';
var konten = param[1];

var http = require('http');
var url = require('url');
var port = 8088;

const
{
   WAConnection,
   MessageType,
   Presence,
   MessageOptions,
   Mimetype,
   WALocationMessage,
   WA_MESSAGE_STUB_TYPES,
   ReconnectMode,
   ProxyAgent,
   GroupSettingChange,
   waChatKey,
   mentionedJid,
   processTime,
} = require("@adiwajshing/baileys")
const fs = require("fs")

async function connectToWhatsApp () {
    const conn = new WAConnection() 
	conn.on('credentials-updated', () => {
		const authInfo = conn.base64EncodedAuthInfo()
		//console.log(`credentials updated!`)
		fs.writeFileSync('./session.json', JSON.stringify(authInfo, null, '\t'))
	})

	fs.existsSync('./session.json') && conn.loadAuthInfo('./session.json')

	await conn.connect ()
	
	http.createServer(function (req, res) {
		res.writeHead(200, {'Content-Type': 'text/html'});
		var q = url.parse(req.url, true).query;
		var txt = q.no + '@s.whatsapp.net' + " | " + q.isi;
		let nomor = q.no + '@s.whatsapp.net';
		var isi = q.isi;
		//conn.sendMessage(nomor, isi, 'conversation')
		if (conn.sendMessage(nomor, isi, 'conversation')){
			//console.log(nomor + isi);
			res.write('Sukses');
		}
		else{
			res.write('Failed');  
		}
		return res.end();
	}).listen(port);

}
// run in main file
connectToWhatsApp ()
.catch (err => console.log("unexpected error: " + err) ) // catch any errors

