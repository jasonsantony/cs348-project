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

  const t = await sequelize.transaction();

  try {
    const user = await User.findOne(
      { where: { username: username } },
      { transaction: t }
    );

    if (type === "register") {
      if (user) {
        await t.rollback();
        res.status(400).send({ message: "Username already exists" });
      } else {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await User.create(
          {
            username: username,
            password: hashedPassword,
            is_admin: 0,
            bio: "",
          },
          { transaction: t }
        );
        await t.commit();
        res.send({
          message: "User registered successfully!",
          username: newUser.username,
        });
      }
    } else if (type === "login") {
      if (!user) {
        await t.rollback();
        res.status(401).send({ message: "Incorrect username or password" });
      } else {
        if (await bcrypt.compare(password, user.password)) {
          await t.commit();
          res.send({ message: "Login successful!", username: user.username });
        } else {
          await t.rollback();
          res.status(401).send({ message: "Incorrect username or password" });
        }
      }
    }
  } catch (error) {
    await t.rollback();
    res.status(500).send({ message: "Error logging in" });
  }
});

app.delete("/api/delete-account/:username", async (req, res) => {
  const username = req.params.username;

  const t = await sequelize.transaction();

  try {
    const user = await User.findOne(
      { where: { username: username } },
      { transaction: t }
    );

    if (!user) {
      await t.rollback();
      res.status(404).send({ message: "User not found" });
    } else {
      await User.destroy({ where: { username: username } }, { transaction: t });
      await t.commit();
      res.status(200).send({ message: "User deleted successfully" });
    }
  } catch (error) {
    await t.rollback();
    res.status(500).send({ message: "Error deleting user" });
  }
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

  const t = await sequelize.transaction();

  try {
    const user = await User.findOne(
      { where: { username: username } },
      { transaction: t }
    );

    if (!user) {
      await t.rollback();
      res.status(404).send({ message: "User not found" });
    } else {
      user.bio = bio;
      await user.save({ transaction: t });
      await t.commit();
      res.send({ message: "Bio updated successfully" });
    }
  } catch (error) {
    await t.rollback();
    console.error("Error updating bio:", error);
    res.status(500).send({ message: "Error updating bio" });
  }
});

app.get("/api/user-list", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["username", "bio"],
    });
    const result = users.map((user) => {
      const bioMatch = user.bio.match(/<.*?>(.*?)<\/.*?>/);
      const bio = bioMatch ? bioMatch[1] : "";
      const trimmedBio = bio.length > 100 ? `${bio.substring(0, 100)}...` : bio;
      return {
        username: user.username,
        bio: trimmedBio,
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).send({ message: "Server error" });
  }
});

app.get("/api/user/:username/reviews", (req, res) => {
  User.findOne({ where: { username: req.params.username } })
    .then((user) => {
      if (!user) return res.status(404).send({ message: "User not found" });

      return Review.findAll({ where: { user_id: user.user_id } });
    })
    .then((reviews) => {
      res.send(reviews);
    })
    .catch((error) => {
      console.error("Error fetching reviews:", error);
      res.status(500).send({ message: "Server error" });
    });
});

app.post("/api/user/:username/create-review", async (req, res) => {
  const username = req.params.username;
  const {
    review_id,
    show_title,
    show_director,
    show_release_year,
    rating_value,
    review_text,
    timestamp,
  } = req.body;

  const t = await sequelize.transaction();

  try {
    const user = await User.findOne(
      { where: { username: username } },
      { transaction: t }
    );
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    await Review.create(
      {
        show_title: show_title,
        show_director: show_director,
        show_release_year: show_release_year,
        rating_value: rating_value,
        review_text: review_text,
        timestamp: timestamp,
        user_id: user.user_id,
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({ message: "Review created successfully" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "Server error", error: error.toString() });
  }
});

app.delete("/api/review/:review_id/delete-review", async (req, res) => {
  const review_id = req.params.review_id;

  const t = await sequelize.transaction();

  try {
    const result = await Review.destroy(
      {
        where: {
          review_id: review_id,
        },
      },
      { transaction: t }
    );

    if (result === 0) {
      await t.rollback();
      res.status(404).send({ message: "Review not found" });
    } else {
      await t.commit();
      res.status(200).send({ message: "Review deleted successfully" });
    }
  } catch (error) {
    await t.rollback();
    res.status(500).send({ error: "Delete operation failed" });
  }
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

// testing
async function printReviews() {
  try {
    const reviews = await Review.findAll();
    console.log(reviews.map((review) => review.dataValues));
  } catch (error) {
    console.error("Error fetching reviews:", error);
  }
}
