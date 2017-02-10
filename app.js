//Basic Libraries
var express = require('express')
var app = express()
var server = require('http').createServer(app);
var io = require('socket.io').listen(server)
var path = require('path')

// extra libs
var bodyParser = require('body-parser')
var multer = require('multer')
var upload = multer()
var randomID = require("random-id");
var methodOverride = require('method-override')
var _und = require('underscore')

// mongodb
var mongodb = require('mongodb')
var MongoClient = mongodb.MongoClient
var url = 'mongodb://localhost:27017/todos'

// express settings
app.use(methodOverride('_method'));
app.set('view engine', 'pug')
app.set('views', './views')
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(upload.array())

//Handle our requests to the server
app.get('/', function (req, res) {
  MongoClient.connect(url, function(err, db){
    if(err){
      console.log('unable to connect')
    }else{
      var collection = db.collection('todos')
      collection.find({
        completed: false
      }).toArray(function(err, result){
        if(err){
          console.log(err)
        }else{
          var todos = groupTodosByDate(result)
          res.render('index', {
            title: 'Todos | Qiongrong Jiang',
            todos: todos
          })
        }
        db.close()
      })
    }
  })
})

app.get('/add', function (req, res) {
	res.render(
    'add',
    {title: 'Todos | Add new todo'})
})

app.get('/completed', function (req, res) {
  MongoClient.connect(url, function(err, db){
    if(err){
      console.log('unable to connect')
    }else{
      var collection = db.collection('todos')
      collection.find({
        completed: true
      }).toArray(function(err, result){
        if(err){
          console.log(err)
        }else{
          var todos = groupTodosByDate(result)
          res.render('completed',{
            title: 'Todos | Completed todos',
            todos: todos
          })
        }
        db.close()
      })
    }
  })
})

app.get('/*', function (req, res) {
	res.render(
    'error',
    {title: 'Todos | 404'})
})

app.post('/', function(req, res){
  var currentDate = getCurrentDate()
  req.body.id = randomID(10)
  req.body.createdAt = currentDate
  req.body.completed = false
  MongoClient.connect(url, function(err, db){
    if(err){
      console.log('unable to connect')
    }else{
      var collection = db.collection('todos')
      collection.insert(req.body, function(err, result){
        if(err){
          console.log(err)
          return
        }else{
          collection.find({
            completed: false
          }).toArray(function(err, result){
            if(err){
              console.log(err)
            }else{
              var todos = groupTodosByDate(result)
              res.render('index', {
                  title: 'Todos | Qiongrong Jiang',
                  todos: todos,
                  success: true
              })
            }
            db.close()
          })
        }
      })

    }
  })
})

// socket io handlers
io.on('connection', function(socket){
  socket.on('change completed status', function(data){
    MongoClient.connect(url, function(err, db){
      if(err){
        console.log('unable to connect')
      }else{
        var collection = db.collection('todos')
        collection.update({id: data.id}, {$set: {completed: data.checked}}, function(err, updated){
          if(err){
            console.log(err)
          }else{
            console.log("updated")
          }
          db.close()
        })
      }
    })
  })

  socket.on('delete todo', function(data){
    MongoClient.connect(url, function(err, db){
      if(err){
        console.log('unable to connect')
      }else{
        var collection = db.collection('todos')
        collection.deleteOne({
          id: data.id
        }, function(err, result){
          if(err){
            console.log(err)
          }else{
            console.log('deleted')
          }
          db.close()
        })
      }
    })
  })

  socket.on('delete all completed', function(){
    MongoClient.connect(url, function(err, db){
      if(err){
        console.log('unable to connect')
      }else{
        var collection = db.collection('todos')
        collection.remove({
          completed: true
        }, function(err, result){
          if(err){
            console.log(err)
          }else{
            console.log('deleted')
          }
          db.close()
        })
      }
    })
  })
})

//Start our server
server.listen(process.env.PORT || 8081, process.env.IP || "0.0.0.0", function () {
	console.log('Example app listening on port 8081!')
})

// global functions
function groupTodosByDate(todos){
  var groupedTodos = _und.chain(todos).groupBy('createdAt').map(function(value, key){
     return {
      createdAt: key,
      content: value
    }
  }).value()
  return groupedTodos
}

function getCurrentDate(){
  var currentDate = new Date()
  return currentDate.toDateString()
}

function getYesterday(){
  var currentDate = new Date()
  currentDate.setDate(currentDate.getDate() - 1)
  return currentDate.toDateString()
}
