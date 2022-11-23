const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000
require('dotenv').config();
const jwt = require('jsonwebtoken');

//middle ware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wwzdrm6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    const evSparksProductsCollection = client.db("fitzeosUserDb").collection("products");
    //server to ui data
    app.get('/products', async (req, res) => {
      const query = {}
      const cursor = evSparksProductsCollection.find(query);
      const result = await cursor.toArray()
      // const result = results
      res.send(result)
    })

  } finally {

  }
}
run().catch(err => console.log(err));










app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})