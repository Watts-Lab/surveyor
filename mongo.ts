var MongoClient = require('mongodb').MongoClient

//Create a MongoDB client, open a connection to DocDB; as a replica set,
//  and specify the read preference as secondary preferred

var client = MongoClient.connect(
    process.env.PROD_URI,
{
  tlsCAFile: `rds-combined-ca-bundle.pem` //Specify the DocDB; cert
}).then(
    
)
                    