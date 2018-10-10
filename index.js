
// include mongodb and socket.io modules
const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

// DB connection
mongo.connect('mongodb://127.0.0.1/chat', function(err, db){
    
    // check for error
    // if(err){
    //     throw err;
    // }

    console.log('Connected to database.');

    // socket.io connection
    client.on('connection', function(socket){
        var chat = db.collection('chats');

        // check status
        sendStatus = function(s){
            socket.emit('status', s);
        }

        // take messages from database
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
           
            // check errors
            // if(err){
            //     throw err;
            // }

            // emit message
            socket.emit('output', res);
        });

        // client inputs
        socket.on('input', function(data){
            var name = data.name;
            var message = data.message;

            // check the input
            if(name == '' || message == ''){
                // default message
                sendStatus('Enter something.');
            } else {
                // message enters to DB
                chat.insert({name: name, message: message}, function(){
                    client.emit('output', [data]);

                    // check status
                    sendStatus({
                        message: 'Message sent'
                    });
                });
            }
        });
    });
});