var app = require('express')();
var cors = require('cors');
var http = require('http').createServer(app);
const PORT = 8080;
var io = require('socket.io')(http);
var STATIC_CHANNELS = [{
    name: 'NCE Channal',
    participants: 0,
    id: 1,
    sockets: []
}];

app.use(cors());
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     next();
// })
// let headers = {
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
//     "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, X-Requested-With, Application",
//     "content-type": "application/json",
// }
http.listen(PORT, () => {
    console.log(`ncr socket backend listening on *:${PORT}`);
});

io.on('connection', (socket) => {
    console.log('new client connected');
    socket.emit('connection', null);
    socket.on('channel-join', id => {
        console.log('channel join', id);
        STATIC_CHANNELS.forEach(c => {
            if (c.id === id) {
                if (c.sockets.indexOf(socket.id) == (-1)) {
                    c.sockets.push(socket.id);
                    c.participants++;
                    io.emit('channel', c);
                }
            } else {
                let index = c.sockets.indexOf(socket.id);
                if (index != (-1)) {
                    c.sockets.splice(index, 1);
                    c.participants--;
                    io.emit('channel', c);
                }
            }
        });

        return id;
    });
    socket.on('send-message', message => {
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        STATIC_CHANNELS.forEach(c => {
            let index = c.sockets.indexOf(socket.id);
            if (index != (-1)) {
                c.sockets.splice(index, 1);
                c.participants--;
                io.emit('channel', c);
            }
        });
    });

});


app.get('/getChannels', (req, res) => {
    res.json({
        channels: STATIC_CHANNELS
    })
});