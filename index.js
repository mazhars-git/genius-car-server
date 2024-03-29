const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


//middleware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2rf6h.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //connect to the server and database

    const serviceCollection = client.db('genius-car').collection('services');
    const bookingCollection = client.db('genius-car').collection('bookings');

    app.get('/services', async(req, res) => {
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/services/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}

        const options = {
            // Include only the `title` and `imdb` fields in the returned document
            projection: { title: 1, price: 1, service_id: 1, img: 1 },
          };

        const result = await serviceCollection.findOne(query, options);
        res.send(result);
    });

    //get bookings from database

    app.get('/bookings', async (req, res) => {
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    })

    //post booking in server

    app.post('/bookings', async (req, res) => {
        const booking = req.body;
        const result = await bookingCollection.insertOne(booking);
        res.send(result);

        // console.log(booking);
    });

    //update bookings

    app.patch('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updatedBookings = req.body;
      console.log(updatedBookings);

      const updateDoc = {
        $set: {
          status: updatedBookings.status
        },
      }
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result);

    })

    //delete items

    app.delete('/bookings/:id', async (req, res) => {
        const itemId = req.params.id;
        const query = {_id: new ObjectId(itemId)}
        const result = await bookingCollection.deleteOne(query);
        res.send(result);
        console.log(result);
    });

    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('genius car server is running');
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});


