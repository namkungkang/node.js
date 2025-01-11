import express from "express"; // -> ES Module
import { MongoClient } from "mongodb";

const app = express();
const port = 3000;

const url =
  "mongodb+srv://namkung0131:gang0131@cluster0.ixluj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(url);
let db;
async function run() {
  try {
    await client.connect();
    console.log("몽고db연결");
    db = client.db("forum"); 
  } catch (err) {
    console.error(err);
  }
}

run();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/news", (req, res) => {
  res.send("news!");
});

app.get("/shop", (req, res) => {
  res.send("shop!");
});
app.get("/list", async (req, res) => {
  let result = await db.collection("post").find().toArray();
  res.send(result[0].title);
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
