const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 3000


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j9qjn8n.mongodb.net/?appName=Cluster0`;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Smart server is running');
})

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const db = client.db("paw-mart-db");
    const productsCollection = db.collection('products');
    const ordersCollection = db.collection('orders');

    app.post('/products', async (req, res) => {
        const newProduct = req.body;
        const result = await productsCollection.insertOne(newProduct);
        res.send(result);

    })

    app.get('/products', async (req, res) => {
        const email = req.query.email
        const query = {}
        if (email) {
          query.email = email
        }

        const cursor = productsCollection.find(query).sort({date: 1});
        const result = await cursor.toArray()
        res.send(result);
    })

    app.get('/recentListings', async (req, res) => {
        const cursor = productsCollection.find().sort({date: -1}).limit(6);
        const result = await cursor.toArray()
        res.send(result);
    })

    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };

      const product = await productsCollection.findOne(query);
      res.send(product);
    })

    app.patch('/products/:id', async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const result = await productsCollection.updateOne({ _id: new ObjectId(id) }, {$set: updatedProduct});

      res.send(result);
    })

    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};

      const result = await productsCollection.deleteOne(query);
      res.send(result);
    })

    app.post('/orders', async (req, res) => {
      const newOrder = req.body;
      const result = await ordersCollection.insertOne(newOrder);
      res.send(result);
    })

    app.get('/orders', async (req, res) => {
      const email = req.query.email
      const query = {};
      if (email) {
        query.email = email
      }
      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Smart server is running on port: ${port}`)
})