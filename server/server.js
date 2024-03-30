const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;
const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");

const cors = require("cors");
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());

const bcrypt = require("bcrypt");
const saltRounds = 10;

const { User, Show, Review, sequelize } = require("./models");

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
        });
        res.send({ message: "User registered successfully!" });
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
          res.send({ message: "Login successful!" });
        } else {
          res.status(401).send({ message: "Incorrect username or password" });
        }
      } catch (error) {
        res.status(500).send({ message: "Error logging in" });
      }
    }
  }

  printUsers();
  // truncateUsers();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// testing database connection
async function printUsers() {
  try {
    const users = await User.findAll();
    console.log(users.map((user) => user.dataValues));
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

// testing database connection
async function truncateUsers() {
  try {
    await User.destroy({ where: {}, truncate: true });
    console.log("Users table has been truncated");
  } catch (error) {
    console.error("Error truncating users table:", error);
  }
}
