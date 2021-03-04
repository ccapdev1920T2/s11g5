const mongodb = require('mongodb');

const client = mongodb.MongoClient;
const url = "mongodb+srv://dbUser:p@ssword@cluster-1.ayffn.gcp.mongodb.net/db?retryWrites=true&w=majority";
const dbName = "database";

const options = { useUnifiedTopology: true };

const database = {
  createDatabase: function() {
      client.connect(url, options, function (err, db) {
          if(err) throw err;
          db.close();
      });
  },
  createCollection: function(collection) {
        client.connect(url, options, function(err, db) {
            if(err) throw err;
            var database = db.db(dbName);
            database.createCollection(collection, function (err, res) {
                if(err) throw err;
                db.close();
            });
        });
    },
    insertOne: function(collection, doc) {
        client.connect(url, options, function (err, db) {
            if(err) throw err;
            var database = db.db(dbName);
            database.collection(collection).insertOne(doc, function (err, res) {
                if(err) throw err;
                db.close();
            });
        });
    },
    insertOneCallback: function(collection, doc, callback) {
        client.connect(url, options, function (err, db) {
            if(err) throw err;
            var database = db.db(dbName);
            database.collection(collection).insertOne(doc, function (err, res) {
                if(err) throw err;
                db.close();
                return callback(res.ops[0]);
            });
        });
    },
    insertMany: function(collection, docs) {
        client.connect(url, options, function (err, db) {
            if(err) throw err;
            var database = db.db(dbName);
            database.collection(collection).insertMany(docs, function (err, res) {
                if(err) throw err;
                db.close();
            });
        });
    },
    findOne: function(collection, query, callback) {
        client.connect(url, options, function (err, db) {
            if(err) throw err;
            var database = db.db(dbName);
            database.collection(collection).findOne(query, function (err, result) {
                if(err) throw err;
                db.close();
                return callback(result);
            });
        });
    },
    findMany: function(collection, query, callback) {
        client.connect(url, options, function (err, db) {
            if(err) throw err;
            var database = db.db(dbName);
            var hold = null;
            database.collection(collection).find(query, {projection: hold})
            .sort(hold).toArray(function (err, result) {
                if(err) throw err;
                db.close();
                return callback(result);
            });
        });
    },
    deleteOne: function(collection, filter) {
        client.connect(url, options, function (err, db) {
            if(err) throw err;
            var database = db.db(dbName);
            database.collection(collection).deleteOne(filter, function (err, res) {
                if(err) throw err;
                db.close();
            });
        });
    },
    deleteMany: function(collection, filter) {
        client.connect(url, options, function (err, db) {
            if(err) throw err;
            var database = db.db(dbName);
            database.collection(collection).deleteMany(filter, function(err, res) {
                if(err) throw err;
                db.close();
            });
        });
    },
    dropCollection: function(collection) {
        client.connect(url, options, function (err, db) {
            if(err) throw err;
            var database = db.db(dbName);
            database.collection(collection).drop(function (err, res) {
                if(err) throw err;
                db.close();
            });
        });
    },
    findOneAndUpdate: function(collection, filter, update, callback) {
        client.connect(url, options, function (err, db) {
            if(err) throw err;
            var database = db.db(dbName);
            database.collection(collection).findOneAndUpdate(filter, update, {returnOriginal:false}, function (err, result) {
                if(err) throw err;
                db.close();
                return callback(result.value);
            });
        });
    },
    updateOne: function(collection, filter, update) {
        client.connect(url, options, function (err, db) {
            if(err) throw err;
            var database = db.db(dbName);
            database.collection(collection).updateOne(filter, update, function (err, res) {
                if(err) throw err;
                db.close();
            });
        });
    },
    updateMany: function(collection, filter, update) {
        client.connect(url, options, function (err, db) {
            if(err) throw err;
            var database = db.db(dbName);
            database.collection(collection).updateMany(filter, update, function (err, res) {
                if(err) throw err;
                db.close();
            });
        });
    }
}

module.exports = database;
