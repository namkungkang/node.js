import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let db;
const url =
  "mongodb+srv://namkung0131:gang0131@cluster0.ixluj.mongodb.net/forum?retryWrites=true&w=majority&tls=true";
new MongoClient(url)
  .connect()
  .then((client) => {
    console.log("DB연결성공");
    db = client.db("forum");

    app.listen(8080, () => {
      console.log("http://localhost:8080 에서 서버 실행중");
    });
  })
  .catch((err) => {
    console.log(err);
  });

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
  res.render("list.ejs", { 글목록: result });
});

app.get("/write", (req, res) => {
  res.render("write.ejs");
});

app.post("/add", async (req, res) => {
  console.log(req.body);
  try {
    if (req.body.title == "" || req.body.content == "") {
      res.status(400).send("너 오류");
    } else {
      await db
        .collection("post")
        .insertOne({ title: req.body.title, 내용: req.body.content });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("입력 안됨");
  }
});

app.get("/detail/:id", async (req, res) => {
  try {
    let result = await db
      .collection("post")
      .findOne({ _id: new ObjectId(req.params.id) });
    console.log(req.params);
    if (result == null) {
      res.status(404).send("벗어난 url");
    }
    res.render("detail.ejs", { result: result });
  } catch (e) {
    console.log(e);
    res.status(404).send("벗어난 url");
  }
});
