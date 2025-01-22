import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcrypt";
import MongoStore from "connect-mongo";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(
  session({
    secret: "암호화에 쓸 비번",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
    store : MongoStore.create({
      mongoUrl :  "mongodb+srv://namkung0131:gang0131@cluster0.ixluj.mongodb.net/forum?retryWrites=true&w=majority&tls=true",
      dbName : "forum"

    })
  })
);

app.use(passport.session());

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

app.get("/edit/:id", async (req, res) => {
  const editer = await db
    .collection("post")
    .findOne({ _id: new ObjectId(req.params.id) });
  console.log(editer);
  res.render("edit.ejs", { editer: editer });
});

try {
  app.post("/edit", async (req, res) => {
    if (req.body.title == "" || req.body.content == "" || req.body.id == "") {
      res.status(400).send("입력해주세여");
    }
    await db
      .collection("post")
      .updateOne(
        { _id: new ObjectId(req.body.id) },
        { $set: { title: req.body.title, content: req.body.content } }
      );

    res.redirect("/list");
    console.log(req.body);
  });
} catch (e) {
  console.log(e);
  res.status(400).send("오류ㅠ");
}

app.delete("/delete", async (req, res) => {
  await db.collection("post").deleteOne({ _id: new ObjectId(req.query.docid) });
  res.send("삭제완료");
});

app.get("/list/:id", async (req, res) => {
  let result = await db
    .collection("post")
    .find()
    .skip((req.params.id - 1) * 5)
    .limit(5)
    .toArray();
  res.render("list.ejs", { 글목록: result });
});

app.get("/list/next/:id", async (req, res) => {
  let result = await db
    .collection("post")
    .find({ _id: { $gt: new ObjectId(req.params.id) } })
    .limit(5)
    .toArray();
  res.render("list.ejs", { 글목록: result });
});

passport.use(
  new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
    let result = await db
      .collection("user")
      .findOne({ username: 입력한아이디 });
    if (!result) {
      return cb(null, false, { message: "아이디 DB에 없음" });
    }
    
    if(await bcrypt.compare(입력한비번,result.password))
      {
      return cb(null, result);
    } else {
      return cb(null, false, { message: "비번불일치" });
    }
  })
);

passport.serializeUser((user, done) => {
  console.log(user);
  process.nextTick(() => {
    done(null, { id: user._id, username: user.username });
  });
});

passport.deserializeUser(async (user, done) => {
  let result = await db
    .collection("user")
    .findOne({ _id: new ObjectId(user.id) });
  delete result.password;
  process.nextTick(() => {
    return done(null, result);
  });
});

app.get("/login", (req, res) => {
  console.log(req.user);
  res.render("login.ejs");
});

app.post("/login", async (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) return res.status(500).json(error);
    if (!user) return res.status(401).json(info.message);
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.redirect("/");
    });
  })(req, res, next);
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  let hashing = await bcrypt.hash(req.body.password, 10);

  await db.collection("user").insertOne({
    username: req.body.username,
    password: hashing,
  });
  res.redirect("/");
});
