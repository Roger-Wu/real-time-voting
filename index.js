var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('views/index.html');
});

var questions = [];
var qId = 0;
var userId = 0;

io.on('connection', function(socket){
  console.log('a user connected');
  userId += 1;
  socket.emit('init', {'userId': userId, 'questions': questions});
  // socket.emit('questions', questions);

  socket.on('add question', function(msg){
    questions.push({"qId": qId, "question": String(msg), "voters": {}, "votes": 0})
    qId += 1;
    io.sockets.emit('questions', questions); // broadcast to all connected sockets
  });

  socket.on('upvote question', function(vote){
    // vote: {"userId": 123, "qId": 2}

    // check vote format is correct
    if (!vote.hasOwnProperty("userId") || !vote.hasOwnProperty("qId")) {
      console.log('wrong vote format');
      socket.emit('errmsg', 'wrong vote format');
      return;
    }
    // check if user has voted it
    else if (questions[vote.qId].voters.hasOwnProperty(vote.userId)) {
      socket.emit('errmsg', 'user has voted');
    }
    else {
      questions[vote.qId].voters[vote.userId] = true;
      questions[vote.qId].votes += 1;
      io.emit('questions', questions);
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
