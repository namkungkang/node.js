const express = require("express");
const app = express();

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

const { MongoClient } = require("mongodb");

let db;
const url =
  "mongodb+srv://namkung0131:gang0131@cluster0.ixluj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
new MongoClient(url)
  .connect()
  .then((client) => {
    console.log("DB연결성공");
    db = client.db("forum");
    app.listen(8080, () => {
      console.log("http://localhost:8080 에서 실행중");
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("반갑다");
});

app.get("/news", (req, res) => {
  res.send("뉴스임");
});

app.get("/shop", (req, res) => {
  res.send("쇼핑페이지");
});

app.get("/list", async (req, res) => {
  const result = await db.collection("post").find().toArray();
  res.render("list.ejs", {posts:result});
});

app.get("/about", (req, res) => {
  res.sendFile(__dirname + "/introduce.html");
});

app.get("/time", async (req, res) => {
    const result1 = await db.collection("post").find().toArray();
    res.render("time.ejs", {data :new Date()});
  });

