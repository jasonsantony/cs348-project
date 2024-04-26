const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;
var cookieParser = require("cookie-parser");

const cors = require("cors");
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());

const bcrypt = require("bcrypt");
const saltRounds = 10;

const { User, Review, sequelize } = require("./models");

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  printUsers();
});

app.get("/api/home", (req, res) => {
  res.send({ message: "Hello World!" });
});

app.post("/api/auth", async (req, res) => {
  const { type, username, password } = req.body;

  const user = await User.findOne({ where: { username: username } });

  if (type === "register") {
    if (user) {
      res.status(400).send({ message: "Username already exists" });
    } else {
      try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await User.create({
          username: username,
          password: hashedPassword,
          is_admin: 0,
          bio: "",
          num_reviews: 0,
        });
        res.send({
          message: "User registered successfully!",
          username: newUser.username,
        });
      } catch (error) {
        res.status(500).send({ message: "Error registering user" });
      }
    }
  } else if (type === "login") {
    if (!user) {
      res.status(401).send({ message: "Incorrect username or password" });
    } else {
      try {
        if (await bcrypt.compare(password, user.password)) {
          res.send({ message: "Login successful!", username: user.username });
        } else {
          res.status(401).send({ message: "Incorrect username or password" });
        }
      } catch (error) {
        res.status(500).send({ message: "Error logging in" });
      }
    }
  }
  printUsers();
});

app.delete("/api/delete-account/:username", async (req, res) => {
  console.log("here");
  const username = req.params.username;

  try {
    const user = await User.findOne({ where: { username: username } });

    if (!user) {
      res.status(404).send({ message: "User not found" });
    } else {
      await User.destroy({ where: { username: username } });
      res.status(200).send({ message: "User deleted successfully" });
    }
  } catch (error) {
    res.status(500).send({ message: "Error deleting user" });
  }
  printUsers();
});

app.get("/api/user/:username/bio", async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ where: { username: username } });

  if (!user) {
    res.status(404).send({ message: "User not found" });
  } else {
    res.send({ bio: user.bio });
  }
});

app.post("/api/user/:username/bio", async (req, res) => {
  const { username } = req.params;
  const { bio } = req.body;

  try {
    const user = await User.findOne({ where: { username: username } });

    if (!user) {
      res.status(404).send({ message: "User not found" });
    } else {
      user.bio = bio;
      await user.save();
      res.send({ message: "Bio updated successfully" });
    }
  } catch (error) {
    console.error("Error updating bio:", error);
    res.status(500).send({ message: "Error updating bio" });
  }
  printUsers();
});

// testing
async function printUsers() {
  try {
    const users = await User.findAll();
    console.log(users.map((user) => user.dataValues));
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

// testing
async function truncateUsers() {
  try {
    await User.destroy({ where: {}, truncate: true });
    console.log("Users table has been truncated");
  } catch (error) {
    console.error("Error truncating users table:", error);
  }
}
