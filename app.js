var restify = require('restify');
var botbuilder = require('botbuilder');

// setup restify server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3987, function () {
    console.log('%s bot started at %s', server.name, server.url);
});

// create chat connector
var connector = new botbuilder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_SECRET
});

// Listening for user inputs
server.post('/api/messages', connector.listen());


var savedAddress;
// Reply by echoing
var bot = new botbuilder.UniversalBot(connector, function(session){
    savedAddress = session.message.address;
    session.send('You say : %s | [length: %s]', session.message.text, session.message.text.length);
});

bot.on('typing', function (response) {
    session.send(response);
    session.send('Tu tapes !');
});

bot.dialog('/first', function (session) {
    botbuilder.Prompts.text(session, 'Bien le bonjour !')
});

bot.on('contactRelationUpdate', function (message) {
    if (message.action === 'add') {
        var name = message.address.bot.name;
        var id = message.address.bot.id;
        var reply = new botbuilder.Message()
            .address(message.address)
            .text("Bienvenue à name : %s | id : %s", name, id);
        bot.send(reply);
    } else if(message.action === 'remove'){
        var botId = message.address.bot.id;
        var reply = new botbuilder.Message()
            .address(message.address)
            .text('L\'utilisateur : ' + botId + ' vient de nous quitter');
        bot.send(reply);
    }
});

bot.on('conversationUpdate', function (message) {
    if (message.membersAdded && message.membersAdded.length > 0) {
        var membersAdded = message.membersAdded
            .map(function (m) {
                var isSelf = m.id === message.address.bot.id;
                if (isSelf) {
                    return message.address.bot.name;
                } else {
                    return 'name : ' + m.name + ' | id : ' + m.id;
                }
            })
            .join(', ');

        bot.send(new botbuilder.Message()
            .address(message.address)
            .text('Bienvenue à ' + membersAdded));
    }

    if (message.membersRemoved && message.membersRemoved.length > 0) {
        var membersRemoved = message.membersRemoved
            .map(function (m) {
                var isSelf = m.id === message.address.bot.id;
                return (isSelf ? message.address.bot.name : m.name) || '' + ' (Id: ' + m.id + ')';
            })
            .join(', ');

        bot.send(new botbuilder.Message()
            .address(message.address)
            .text('L\'utilisateur : ' + membersRemoved + ' vient de nous quitter'));
    }
});


// bot doit capter que le user ecrit
// ajout user bot doit renvoyer les informations du user nom / id
// remove user / bot - informations
// and welcome message