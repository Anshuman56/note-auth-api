require("dotenv/config");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authRequired = require("./middleware/authRequired");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected");

    const noteSchema = new mongoose.Schema({
      userId: String,
      title: String,
      content: String,
      createdAt: { type: Date, default: Date.now },
    });

    const Note = new mongoose.model("Note", noteSchema);

    const userSchema = await mongoose.Schema({
      email: { type: String, require: true, uniqe: true, lowercase: true },
      passwordHash: { type: String, require: true },
      createdAt: { type: Date, default: Date.now },
    });

    const User = await mongoose.model("User", userSchema);

    app.post("/register", async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await User.find({ email: email });

        if (user.length !== 0)
          return res.status(400).json({ error: "Email Taken" });
        else {
          const hash = await bcrypt.hash(password, 10);

          await User.create({ email: email, passwordHash: hash });
          res.status(201).json({ message: "user Create" });
        }
      } catch (err) {
        console.error(err.message);
      }
    });

    app.post("/login", async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await User.find({ email: email });

        if (user.length === 0)
          return res.status(401).json({ error: "Invalid Credentials" });
        else {
          const passwordHash = user[0].passwordHash;
          const compare = await bcrypt.compare(password, passwordHash);
          if (!compare)
            return res.status(401).json({ error: "Invalid Credentials" });
          else {
            const playload = { userId: user[0]._id };
            const token = jwt.sign(playload, process.env.MY_SECRET, {
              expiresIn: "1d",
            });
            res.status(200).json({ token: token });
          }
        }
      } catch (err) {
        console.error(err.message);
      }
    });

    app.get("/notes", authRequired, async (req, res) => {
      try {
        const notes = await Note.find({ userId: req.userId });
        res.json(notes);
      } catch (err) {
        console.log(err.message);
      }
    });

    app.get("/notes/:id", authRequired, async (req, res) => {
      try {
        const id = req.params.id;
        const note = await Note.findById(id);
        if (req.userId === note.userId) res.send(note);
        else res.status(403).json({ error: "You are not authorized user" });
      } catch (err) {
        console.log(err.message);
      }
    });

    app.post("/notes", authRequired, async (req, res) => {
      try {
        await Note.create({
          userId: req.userId,
          title: req.body.note,
          content: "some new content",
        });
        res.redirect("/notes");
      } catch (err) {
        console.log(err.message);
      }
    });

    app.put("/notes/:id", authRequired, async (req, res) => {
      try {
        const id = req.params.id;
        const note = await Note.find({ _id: id, userId: req.userId });

        if (note.length !== 0) {
          await Note.findByIdAndUpdate(id, { title: req.body.note });
          const notes = await Note.find({ userId: req.userId });
          res.send(notes);
        } else res.status(403).json({ error: "You are not authorized user" });
      } catch (err) {
        console.log(err.message);
      }
    });

    app.delete("/notes/:id", authRequired, async (req, res) => {
      try {
        const id = req.params.id;
        const note = await Note.find({ _id: id, userId: req.userId });

        if (note.length !== 0) {
          await Note.findByIdAndDelete(id);
          const notes = await Note.find({ userId: req.userId });
          res.send(notes);
        } else res.status(403).json({ error: "You are not authorized user" });
      } catch (err) {
        console.log(err.message);
      }
    });
  } catch (err) {
    console.log(err.message);
  }
}
main();

app.get("/", (req, res) => {
  res.json({ message: "hello form express" });
});

// app.put("/notes/:id", (req, res) => {
//   const id = req.params.id;
//   res.send(notes.filter((item) => item.id === +id));
// });
app.listen(port, () => {
  console.log("your server run on " + port);
});
