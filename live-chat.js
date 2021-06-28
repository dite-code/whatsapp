var param = process.argv.slice(2);
var no = param[0]+'@s.whatsapp.net';
var konten = param[1];

global.nomor = '';
global.isi = '';
global.batas='';

var http = require('http');
var url = require('url');
var port = 8088;

var fs = require('fs'),
bite_size = 10000,
readbytes = 0,
file;

var execPhp = require('exec-php');
var mysql = require('mysql');
var readbytes = Number(fs.readFileSync("bataschat.txt").toString());
//console.log(readbytes);


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

const conn = new WAConnection() 
conn.on ('open', () => {
    // save credentials whenever updated
    console.log (`credentials updated!`)
    const authInfo = conn.base64EncodedAuthInfo() // get all the auth info we need to restore this session
    fs.writeFileSync('session.json', JSON.stringify(authInfo, null, '\t')) // save this info to a file
})


async function connectToWhatsApp () {
	
	fs.existsSync('./session.json') && conn.loadAuthInfo('./session.json')
	
	await conn.connect ()
	
	fs.open('/home/logservice/logs/world2.chat', 'r', function(err, fd) { file = fd; readsome(); });
	
    conn.on('chat-update', chatUpdate => {
        // `chatUpdate` is a partial object, containing the updated properties of the chat
        // received a new message
		//console.log (chatUpdate)
		
        if (chatUpdate.messages && chatUpdate.count) {
			//const mdata = chatUpdate.jid
            const data = chatUpdate.messages.all()[0]
			const content = data.message.conversation
			if (data.key.remoteJid.split('@')[1]=='s.whatsapp.net'){
				const from = data.key.remoteJid.split('@')[0]
				//console.log(from,content)
			}
			else{
				//const mdata = data.key.remoteJid
				//console.log(data)
				//console.log(from,content)
				const from = data.participant.split('@')[0]
				getrolename(from,content)
				//sendtogame(from,content)
				//console.log (from, content, mdata)
			}
		} 
		//else console.log (chatUpdate) // see updates (can be archived, pinned etc.)
	})
	
	http.createServer(function (req, res) {
		res.writeHead(200, {'Content-Type': 'text/html'});
		q = url.parse(req.url, true).query;
		nomor = q.no + '@s.whatsapp.net';
		isi = q.isi;
		res.write(sendwafromlink(q.no,q.isi));  
		return res.end();
	}).listen(port);
	
}

function getrolename(from,content){
	var sql = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "camelia",
		database: "pw"
	});
	sql.connect(function(err) {
		if (err) throw err;
		sql.query("SELECT * FROM users inner join rank on users.id=rank.userid where users.mobilenumber='"+from+"' order by rank.time desc", function (err, result, fields) {
			if (err) throw err;
			//console.log (result[0].rolename, content)
			sendtogame(result[0].rolename,content)
		});
	});
}

function sendwafromlink(no,isi){
	console.log('Send :'+ isi + 'To:'+ no );
	if (no!=null){
		conn.sendMessage(no + '@s.whatsapp.net', isi, 'conversation');
		console.log('terkirim');
		return("Sukses");
	}
	else{
		return('Failed');  
	}
}


function sendtogame(from, content){
	execPhp('/root/whatsapp/game-chat-api.php', function(error, php, outprint){
		// outprint is now `One'.
		
		php.chat(from, content, function(err, result, output, printed){
			
		});
	});
}



function sendtowa(data){
	const idchar = data[0].substring(data[0].indexOf('src=')+4).split(' ')[0];
	const chl = data[0].substring(data[0].indexOf("chl=")+4).split(' ')[0];
	const msg = new Buffer.from(data[0].substring(data[0].indexOf("msg=")+4), 'base64').toString();
	
	if (chl==1){ 
		var sql = mysql.createConnection({
			host: "localhost",
			user: "root",
			password: "camelia",
			database: "pw"
		});
		sql.connect(function(err) {
			if (err) throw err;
			sql.query("SELECT * FROM rank where roleid='"+idchar+"'", function (err, result, fields) {
				if (err) throw err;
				console.log(data[0].length, 'ID: '+result[0].rolename, 'Channel: '+chl, 'Msg: '+msg )
				const msgsend = '*'+result[0].rolename+'*: '+msg 
				conn.sendMessage('6281233113454-1616044872@g.us', msgsend, 'conversation')
			});
		});	
	}
}


function readsome() {
	var stats = fs.fstatSync(file); // yes sometimes async does not make sense!
	if(stats.size<readbytes+1) { 
		//console.log('Hehe I am much faster than your writer..! I will sleep for a while, I deserve it!'); 
		setTimeout(readsome, 500);
	} 
	else { 
		fs.read(file, new Buffer.alloc(bite_size), 0, bite_size, readbytes, processsome); 
	} 
} 

function processsome(err, bytecount, buff) {
	console.log('Read', bytecount,'and will process it now.' );
	//Here we will process our incoming data: Do whatever you need. Just be careful about not using beyond the bytecount in buff. 
	const data=buff.toString('utf-8' , 0, bytecount).split('\n'); 
	//console.log(bytecount) 
	sendtowa(data)
	//So we continue reading from where we left: 
	readbytes+=data[0].length+1; 
	fs.writeFileSync("bataschat.txt",readbytes,{encoding:'utf8',flag:'w'}) 
	fs.writeFile("bataschat.txt", readbytes.toString(), (err)=> {if (err) console.log(err);});
	//console.log(readbytes);
	//readbytes+=bytecount;
	process.nextTick(readsome);
}


// run in main file
//tesWhatsApp ()
//.catch (err => console.log("unexpected error: " + err) ) // catch any errors

connectToWhatsApp ()
.catch (err => console.log("unexpected error: " + err) ) // catch any errors
