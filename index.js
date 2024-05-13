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
    const submitCollection = client.db('volunteerDB').collection('submit')

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
    app.post("/submit", async(req, res) =>{
      const submit = req.body;
      console.log(submit);
      const result = await submitCollection.insertOne(submit);
      res.send(result);
    })
    
    app.delete("/submit/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await submitCollection.deleteOne(query);
      res.send(result)
    });
    // -------------------------------



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







// [
//   {
//       "Thumbnail": "https://i.ibb.co/9n85xwG/volunteer5.jpg",
//       "PostTitle": "Volunteer Tracking",
//       "Description": "Join us for a community cleanup event to help keep our neighborhoods clean and beautiful. Volunteers will be provided with gloves, bags, and refreshments. Let's make a positive impact together!",
//       "Category": "Volunteer Management",
//       "Deadline": "2024-06-15",
//       "Location": "Community Cleanup Site",
//       "VolunteersNeeded": 30,
//       "OrganizerName": "Local Community Association",
//       "OrganizerEmail": "community@example.com",
//       "Suggestion": "",
//       "Status": "requested"
//   },
//   {
//       "Thumbnail": "https://i.ibb.co/8sM1VKg/ocg-saving-the-ocean-1j7-atc0z8-unsplash.jpg",
//       "PostTitle": "Volunteer Scheduling",
//       "Description": "We're looking for passionate individuals to volunteer as tutors for underprivileged students. Help make a difference in a child's life by providing academic support and mentorship.",
//       "Category": "Project Management",
//       "Deadline": "2024-07-01",
//       "Location": "Local School or Community Center",
//       "VolunteersNeeded": 15,
//       "OrganizerName": "Education for All Foundation",
//       "OrganizerEmail": "educationforall@example.com",
//       "Suggestion": "",
//       "Status": "requested"
//   },
//   {
//       "Thumbnail": "https://i.ibb.co/HTWfMwz/volunteer6.jpg",
//       "PostTitle": "Volunteer Database",
//       "Description": "Join our team of dedicated volunteers at the local animal shelter. Help care for and socialize with animals awaiting adoption. No experience necessary, just a love for animals!",
//       "Category": "Data Management",
//       "Deadline": "2024-06-30",
//       "Location": "Local Animal Shelter",
//       "VolunteersNeeded": 20,
//       "OrganizerName": "Paws and Claws Rescue",
//       "OrganizerEmail": "pawsandclaws@example.com",
//       "Suggestion": "",
//       "Status": "requested"
//   },
//   {
//       "Thumbnail": "https://i.ibb.co/xYbVK9y/volunter9.jpg",
//       "PostTitle": "Volunteer Recruitment",
//       "Description": "Volunteer at the local food bank to help sort and distribute food to families in need. Your assistance will directly impact those facing food insecurity in our community.",
//       "Category": "Community Service",
//       "Deadline": "2024-07-10",
//       "Location": "Local Food Bank",
//       "VolunteersNeeded": 25,
//       "OrganizerName": "Community Food Bank",
//       "OrganizerEmail": "foodbank@example.com",
//       "Suggestion": "",
//       "Status": "requested"
//   },
//   {
//       "Thumbnail": "https://i.ibb.co/sKKk6Qs/volunteer3.jpg",
//       "PostTitle": "Social Media Campaign",
//       "Description": "Join our event planning team to help organize and execute fundraising events for local charities. Gain valuable experience while making a difference in the community.",
//       "Category": "Marketing",
//       "Deadline": "2024-06-20",
//       "Location": "Charity Headquarters",
//       "VolunteersNeeded": 10,
//       "OrganizerName": "Charity Aid Foundation",
//       "OrganizerEmail": "charityaid@example.com",
//       "Suggestion": "",
//       "Status": "requested"
//   },
//   {
//       "Thumbnail": "https://i.ibb.co/DWyZxQz/volunteer7.jpg",
//       "PostTitle": "Volunteer Fundraising",
//       "Description": "We're seeking volunteers to provide transportation services for elderly and disabled individuals in our community. Help those in need get to medical appointments, grocery stores, and more.",
//       "Category": "Fundraising",
//       "Deadline": "2024-07-15",
//       "Location": "Community Center",
//       "VolunteersNeeded": 10,
//       "OrganizerName": "Community Aid Network",
//       "OrganizerEmail": "communityaid@example.com",
//       "Suggestion": "",
//       "Status": "requested"
//   },
//   {
//       "Thumbnail": "https://i.ibb.co/CHqS8c9/mimi-thian-vd-XMSi-X-n6-M-unsplash.jpg",
//       "PostTitle": "Mentorship Program Volunteers Wanted",
//       "Description": "Become a mentor and positively impact the lives of youth in our community. Share your knowledge, skills, and experiences to help guide and inspire the next generation.",
//       "Category": "Mentorship",
//       "Deadline": "2024-06-25",
//       "Location": "Local Community Center",
//       "VolunteersNeeded": 10,
//       "OrganizerName": "Youth Empowerment Program",
//       "OrganizerEmail": "youthempowerment@example.com",
//       "Suggestion": "",
//       "Status": "requested"
//   },
//   {
//       "Thumbnail": "https://i.ibb.co/fdLSSVG/needs14.jpg",
//       "PostTitle": "Environmental Cleanup Volunteers Needed",
//       "Description": "Join us in protecting the environment by participating in a local cleanup effort. Help remove litter and restore natural habitats for wildlife.",
//       "Category": "Environmental",
//       "Deadline": "2024-07-05",
//       "Location": "Local Park",
//       "VolunteersNeeded": 30,
//       "OrganizerName": "Green Earth Organization",
//       "OrganizerEmail": "greenearth@example.com",
//       "Suggestion": "",
//       "Status": "requested"
//   },
//   {
//       "Thumbnail": "https://i.ibb.co/yPyncfQ/needs12.jpg",
//       "PostTitle": "Health Fair Volunteers Wanted",
//       "Description": "Assist with organizing and running a health fair aimed at promoting wellness and providing health resources to the community. Volunteers with medical backgrounds are especially welcome.",
//       "Category": "Healthcare",
//       "Deadline": "2024-07-08",
//       "Location": "Local Community Center",
//       "VolunteersNeeded": 20,
//       "OrganizerName": "Community Health Initiative",
//       "OrganizerEmail": "healthinitiative@example.com",
//       "Suggestion": "",
//       "Status": "requested"
//   },
//   {
//       "Thumbnail": "https://i.ibb.co/2dngrxZ/needs13.jpg",
//       "PostTitle": "Elderly Care Volunteers Needed",
//       "Description": "Volunteer at a local nursing home or senior center to provide companionship and assistance to elderly residents. Your kindness and companionship will brighten their day.",
//       "Category": "Elderly Care",
//       "Deadline": "2024-06-28",
//       "Location": "Local Nursing Home",
//       "VolunteersNeeded": 15,
//       "OrganizerName": "Elderly Care Foundation",
//       "OrganizerEmail": "elderlycare@example.com",
//       "Suggestion": "",
//       "Status": "requested"
//   }
// ]