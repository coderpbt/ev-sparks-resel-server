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


//veryfy jwt 

function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(402).send({message : 'unauthorization User'})
  }
  
  const token = authHeader.split(' ')[1]

  jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
    if (err) {
      return res.status(403).send({message : 'forbidden Access'})
    }
    req.decoded = decoded
    next()
  })

}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wwzdrm6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    const evSparksProductsCollection = client.db("evSparksDB").collection("categoris");
    const evSparksProductsWiseCollection = client.db("evSparksDB").collection("productswise");
    const evSparksBookingCollection = client.db("evSparksDB").collection("bookings");
    const evSparksUserCollection = client.db("evSparksDB").collection("users");
    const productsCollection = client.db("evSparksDB").collection("products");

    //verify admin
    const verifyAdmin = async ( req, res, next) => {
      const decodedEmil = req.decoded.email;
      const query = {email : decodedEmil}

      const user = await evSparksUserCollection.findOne(query);

      if (user?.role !== 'admin') {
        return res.status(403).send({message : 'forbidden Access'})
      }
      next()

    }
    
    //server to ui datss
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
     app.get('/productswise/all', async (req, res) => {
      const query = {}
      const cursor = evSparksProductsWiseCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })

    //server to ui data
    app.get('/productswise/recent', async (req, res) => {
      const query = {}
      const cursor = evSparksProductsWiseCollection
      .find(query)
      .sort({_id : -1})
      .limit(6)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/productswise/popular', async (req, res) => {
      const query = {}
      const cursor = evSparksProductsWiseCollection
      .find(query)
      .sort({viewCount : -1})
      .limit(6)
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
      app.delete('/productswise/:id', async(req,res) => {
      const id = req.params.id
      const query =  { _id : ObjectId(id)}
      const doctors = await evSparksProductsWiseCollection.deleteOne(query)
      res.send(doctors)
    })

    // product Update
    app.put('/productswise/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updatedProduct = req.body;
      
      // Remove email from update to prevent it from being changed
      delete updatedProduct.email;
      
      const updateDoc = {
        $set: updatedProduct
      };
      
      const result = await evSparksProductsWiseCollection.updateOne(filter, updateDoc);
      res.send(result);
    });





    //product booking ui to db
    app.post('/bookings', async(req, res) => {
      const booking = req.body;
      const result = await evSparksBookingCollection.insertOne(booking)
      res.send(result)
    })

    //email deya single user ar data bair kora
      app.get('/bookings', verifyJWT, async(req,res) => {
      const email = req.query.email;

      const decodedEmil = req.decoded.email

      if (email !== decodedEmil) {
        return res.status(403).send({message : 'forbidden Access'})
      }

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

    app.delete('/users/:id', async(req,res) => {
        const id = req.params.id
        const query =  { _id : ObjectId(id)}
        const userRes = await evSparksUserCollection.deleteOne(query)
        res.send(userRes)
    })



      //admin ki na check
        app.get('/users/admin/:email', async (req, res) => {
          const email = req.params.email;
          const query = { email }
          const user = await evSparksUserCollection.findOne(query);
          res.send({ isAdmin: user?.role === 'admin' });
      })
    
      //update role
      app.put('/users/admin/:id', verifyJWT, verifyAdmin, async(req,res) =>{
        
        const id = req.params.id;
        const filter = { _id : ObjectId(id)}
        const options = { upsert : true}
        const updateDoc = {
          $set : {
            role : 'admin' || 'buyer' || 'seller',
          }
        }
        const result = await evSparksUserCollection.updateOne(filter, updateDoc, options)
        res.send(result)
      })



    //jwt token api 
    app.get('/jwt', async(req, res) => {
      const email = req.query.email;
      const query = {email : email}
      const user = await evSparksUserCollection.findOne(query)
      if (user) {
        const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn : '6h'})
        return res.send({accessToken : token })
      }
      res.status(403).send({accessToken : ''})
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