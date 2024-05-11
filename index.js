const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t1zteu1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const volunteerCollection = client.db('volunteerDB').collection('needsVolunteer');
    const userCollection = client.db('volunteerDB').collection('userVolunteer')

    // Show the card in home page using this get operation
    app.get('/needsVolunteer', async(req, res) =>{
        const {search} = req.query
        let find = {}
        if(search){
          find.PostTitle = new RegExp(search, "i")
        }
        const cursor = volunteerCollection.find(find);
        const result = await cursor.toArray();
        res.send(result);
    })
    // ----------------------------

    // -----Add Post Section-------
    app.get("/userCollection", async(req, res)=> {
        const cursor = userCollection.find()
        const result = await cursor.toArray();
        res.send(result);
    })
    app.post('/userCollection', async(req, res) => {
        const newVolunteer = req.body;
        console.log(newVolunteer);
        const result = await userCollection.insertOne(newVolunteer);
        res.send(result);
    });
    // -----------------------------

    // --------Update---------
    app.get("/userCollection/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.put("/userCollection/:id", async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const updateVolunteer = req.body;
      const volunteer = {
          $set: {
            postTitle: updateVolunteer.postTitle, 
            location: updateVolunteer.location,
            volunteers_needed: updateVolunteer.volunteers_needed,
            category: updateVolunteer.category ,
            deadline: updateVolunteer.deadline ,
            organizer_name: updateVolunteer.organizer_name ,
            organizer_email: updateVolunteer.organizer_email ,
            description: updateVolunteer.description ,
            thumbnail: updateVolunteer.thumbnail ,
          }
      }
      const result = await userCollection.updateOne(filter, volunteer, options);
      res.send(result);
    });
    // -----------------------

    // --------Delete---------
    app.delete("/userCollection/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await userCollection.deleteOne(query);
      res.send(result)
    });
    // -----------------------

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
    res.send('Web Server is running')
})

app.listen(port, () => {
    console.log(`Web Server is running on port: ${port}`);
})