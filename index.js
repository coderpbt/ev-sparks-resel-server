const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
require('dotenv').config();
const jwt = require('jsonwebtoken');

// const categoris = require('./data/categories.json')
// const courses = require('./data/coursces.json')

//middle ware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wwzdrm6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    const evSparksProductsCollection = client.db("evSparksDB").collection("categoris");
    const evSparksProductsWiseCollection = client.db("evSparksDB").collection("productswise");
    //server to ui data
    app.get('/categoris', async (req, res) => {
      const query = {}
      const cursor = evSparksProductsCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/categoris/:id', async (req, res) => {
      const id = req.params.id;
      const query = { category_id: id }
      const booking = await evSparksProductsWiseCollection.find(query).toArray()
      res.send(booking)
    })



    //server to ui data
    app.get('/productswise', async (req, res) => {
      const query = {}
      const cursor = evSparksProductsWiseCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })

    // app.get('/productswise/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { category_id: id }
    //   const booking = await evSparksProductsWiseCollection.find(query).toArray()
    //   res.send(booking)
    // })


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