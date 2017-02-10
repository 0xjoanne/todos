//mongodb loading and settings
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/todos';

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  }else {
    var collection = db.collection('todos');
    //Create some users
    var todo1 = {
      "id": "2",
      "content": "Meeting with Peter",
      "createdAt": "Fri Feb 10 2017",
      "completed": false
    };
    var todo2 = {
      "id": "3",
      "content": "Call Matthew",
      "createdAt": "Fri Feb 10 2017",
      "completed": false
    };
    var todo3 = {
      "id": "4",
      "content": "Pay my phone bill",
      "createdAt": "Thu Feb 09 2017",
      "completed": false
    };
    var todo4 = {
      "id": "5",
      "content": "Buy milk and eggs",
      "createdAt": "Thu Feb 09 2017",
      "completed": true
    };
    var todo5 = {
      "id": "6",
      "content": "Send email to Kenny",
      "createdAt": "Wed Feb 08 2017",
      "completed": true
    };
    // Insert some users
    collection.insert([todo1, todo2, todo3, todo4, todo5], function (err, result) {
      if (err) {
        console.log(err);
      }else {
        console.log('Inserted %d documents into the "todos" collection. The documents inserted with "_id" are:', result.length, result);
      }
      //Close connection
      db.close();
    });
  }
});
