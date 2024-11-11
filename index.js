const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

//app vars
const userList = [];
let idCount = 0;
const exerciseList = [];

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/users", (req, res) => {
  idCount++;
  const user = {
    username: req.body.username,
    _id: String(idCount),
  };
  userList.push(user);
  res.json(user);
});

app.get("/api/users", (req, res) => {
  res.json(userList);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const desc = req.body.description;
  const dur = Number(req.body.duration);
  let date = new Date(req.body.date).toDateString();

  //check date
  if (!req.body.date) {
    date = new Date().toDateString();
  }

  const id = req.params._id;
  const user = userList.find((user) => user._id === id);
  //add exercise to list
  exerciseList.push({
    id: id,
    description: desc,
    duration: dur,
    date: date,
  });

  let result = {
    username: user.username,
    description: desc,
    duration: dur,
    date: date,
    _id: user._id,
  };

  res.json(result);
});

app.get("/api/users/:_id/logs", (req, res) => {
  const id = req.params._id;
  const user = userList.find((user) => user._id === id);
  let exercises = exerciseList.filter((excs) => excs.id === id);
  let count = exercises.length;

  const from = new Date(req.query.from).getTime();
  const to = new Date(req.query.to).getTime();
  let limit = Number(req.query.limit);

  if (req.query.from && req.query.to) {
    exercises = exercises.filter(
      (excs) =>
        new Date(excs.date).getTime() >= from && new Date(excs.date) <= to
    );
  }

  if (limit) {
    if (limit <= count) {
      count = limit;
    }
  }
  let logList = [];

  for (let i = 0; i < count; i++) {
    const exercise = exercises[i];
    if (exercise) {
      logList.push({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date,
      });
    }
  }

  const result = {
    username: user.username,
    count: count,
    _id: user._id,
    log: logList,
  };
  res.json(result);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
