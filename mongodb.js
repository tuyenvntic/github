//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/flight';

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);

    var collection = db.collection('test');
	var doc1 = {'hello':'doc1'};
	var doc2 = {'hello':'doc2'};
	var lotsOfDocs = [{'hello':'doc3'}, {'hello':'doc4'}];

	collection.insert(doc1);

	collection.insert(doc2, {w:1}, function(err, result) {});

	collection.insert(lotsOfDocs, {w:1}, function(err, result) {});


    //Close connection
    db.close();
  }
});