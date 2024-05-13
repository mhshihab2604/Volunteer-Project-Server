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
    const submitCollection = client.db('volunteerDB').collection('submit')


    // Show the card in home page using this get operation
    app.get('/needsVolunteer', async (req, res) => {
      const { search, sort } = req.query;
      let find = {};
      const sortValue=parseInt(sort);
      if (search) {
          find.PostTitle = new RegExp(search, "i");
      }
      let cursor;
      if(sortValue){
        cursor = volunteerCollection.find(find).sort({"Deadline": sortValue})
      }
      else{
        cursor = volunteerCollection.find(find);
      }
      const result = await cursor.toArray();
      res.send(result);
    });
  
    // -------------------
    app.get("/needsVolunteer/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await volunteerCollection.findOne(query);
      res.send(result);
    });
    // -------------------


    //--------Submit Create---------
    app.get('/submit', async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
          query = { email: req.query.email }
      }
      const result = await submitCollection.find(query).toArray();
      res.send(result);
  })
    app.post("/submit/:id", async(req, res) =>{
      const submit = req.body;
      const id = req.params.id
      const limitVolunteer = parseInt(req.query.volunteer)
      console.log(submit);
      await volunteerCollection.updateOne({_id: new ObjectId(id)},{
        $set:{VolunteersNeeded: limitVolunteer-1}
      })
      const result = await submitCollection.insertOne(submit);
      res.send(result);
    })
    
    app.delete("/submit/:id/:postId", async(req, res) => {
      const {id,postId} = req.params;
      await volunteerCollection.updateOne({_id: new ObjectId(postId)},{
        $inc:{VolunteersNeeded:1}
      })
      const query = {_id: new ObjectId(id)}
      const result = await submitCollection.deleteOne(query);
      res.send(result)
    });
    // -------------------------------



    // -----Add Post Section-------
    app.get("/myPost/:email", async(req, res)=> {
        const {email} = req.params
        const cursor = volunteerCollection.find({
          OrganizerEmail:email
        })
        const result = await cursor.toArray();
        res.send(result);
    })
    app.post('/addPost', async(req, res) => {
        const newVolunteer = req.body;
        console.log(newVolunteer);
        const result = await volunteerCollection.insertOne(newVolunteer);
        res.send(result);
    });
    // -----------------------------




    // --------Update---------
    app.get("/userCollection/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await volunteerCollection.findOne(query);
      res.send(result);
    });

    app.put("/userCollection/:id", async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const updateVolunteer = req.body;
      const volunteer = {
          $set: {
            ...updateVolunteer
          }
      }
      const result = await volunteerCollection.updateOne(filter, volunteer, options);
      res.send(result);
    });
    // -----------------------




    // --------Delete---------
    app.delete("/userCollection/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await volunteerCollection.deleteOne(query);
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



