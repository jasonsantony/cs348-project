const express = require("express");
const app = express();
const PORT = 8080;

const cors = require("cors");
app.use(cors());

const { User, Show, Review, sequelize } = require("./models");

app.get("/api/home", (req, res) => {
  res.send({ message: "Hello World!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
