const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const evSparksProductsCollection = client.db("evSparksDB").collection("categoris");
    const evSparksProductsWiseCollection = client.db("evSparksDB").collection("productswise");
    const evSparksBookingCollection = client.db("evSparksDB").collection("bookings");
    const evSparksUserCollection = client.db("evSparksDB").collection("users");
    const productsCollection = client.db("evSparksDB").collection("products");
    
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




    //add product a specialty 
    app.get('/productSpecialty', async(req,res) => {
      const query = {}
      const limit = 3;
      const result = await evSparksProductsCollection.find(query).project({category_id : 1 , name : 1},
        ).limit(limit).toArray()
      res.send(result)
    })

    //email deya single user ar data bair kora
    app.get('/productswise', async(req,res) => {
      const email = req.query.email;
      const query = {email : email}
      const booking = await evSparksProductsWiseCollection.find(query).toArray();
      res.send(booking)
    })

    //server to ui data
    app.get('/productswise', async (req, res) => {
      const query = {}
      const cursor = evSparksProductsWiseCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/productswise/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id : ObjectId(id) }
      const booking = await evSparksProductsWiseCollection.find(query).toArray()
      res.send(booking)
    })
    app.post('/productswise', async(req,res) => {
      const doctor = req.body;
      const result = await evSparksProductsWiseCollection.insertOne(doctor)
      res.send(result)
    })

      //delete product
      app.delete('/doctors/:id', verifyJWT, verifyAdmin, async(req,res) => {
      const id = req.params.id
      const query =  { _id : ObjectId(id)}
      const doctors = await doctorsCollection.deleteOne(query)
      res.send(doctors)
    })





    //product booking ui to db
    app.post('/bookings', async(req, res) => {
      const booking = req.body;
      const result = await evSparksBookingCollection.insertOne(booking)
      res.send(result)
    })

    //email deya single user ar data bair kora
      app.get('/bookings', async(req,res) => {
      const email = req.query.email;
      const query = {email : email}
      const booking = await evSparksBookingCollection.find(query).toArray();
      res.send(booking)
    })

    //db to ui show
    app.get('/bookings', async (req, res) => {
      const query = {}
      const cursor = evSparksBookingCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })

    // user registion save db
    app.post('/users', async(req,res) => {
      const user = req.body;
      const result = await evSparksUserCollection.insertOne(user)
      res.send(result)
    })

    //user ar information ui a show
    // app.get('/users', async(req,res) => {
    //   const accopt = req.query.accopt;
    //   const query = { accopt : accopt}
    //   const users = await evSparksUserCollection.find(query).toArray()
    //   res.send(users)
    // })

    app.get('/users', async (req, res) => {
      const query = {}
      const cursor = evSparksUserCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })




      //admin ki na check
        app.get('/users/admin/:email', async (req, res) => {
          const email = req.params.email;
          const query = { email }
          const user = await evSparksUserCollection.findOne(query);
          res.send({ isAdmin: user?.role === 'admin' });
      })
    
      //update role
      app.put('/users/admin/:id', async(req,res) =>{
        
        const id = req.params.id;
        const filter = { _id : ObjectId(id)}
        const options = { upsert : true}
        const updateDoc = {
          $set : {
            role : 'admin'
          }
        }
        const result = await evSparksUserCollection.updateOne(filter, updateDoc, options)
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
  console.log(`Ev Sparks app listening on port ${port}`)
})