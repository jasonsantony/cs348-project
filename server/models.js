const { Sequelize, DataTypes } = require("sequelize");

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite", // Your SQLite file path
});

// Define User model with indexes
const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    is_admin: {
      type: DataTypes.INTEGER,
    },
    bio: {
      type: DataTypes.TEXT,
    },
  },
  {
    indexes: [
      { unique: true, fields: ["username"] }, // Index for username field
    ],
  }
);

// Define Show model with indexes
const Show = sequelize.define(
  "Show",
  {
    show_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
    },
    director: {
      type: DataTypes.STRING(255),
    },
    release_month: {
      type: DataTypes.INTEGER,
    },
    release_year: {
      type: DataTypes.INTEGER,
    },
    runtime: {
      type: DataTypes.INTEGER,
    },
    num_episodes: {
      type: DataTypes.INTEGER,
    },
    premise: {
      type: DataTypes.TEXT,
    },
    num_ratings: {
      type: DataTypes.INTEGER,
    },
    avg_rating: {
      type: DataTypes.REAL,
    },
  },
  {
    indexes: [
      { fields: ["title"] }, // Index for title field
    ],
  }
);

// Define Review model with indexes
const Review = sequelize.define(
  "Review",
  {
    review_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    rating_value: {
      type: DataTypes.INTEGER,
    },
    review_text: {
      type: DataTypes.TEXT,
    },
    timestamp: {
      type: DataTypes.TEXT,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
    show_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Show,
        key: "show_id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    indexes: [
      { fields: ["user_id"] }, // Index for user_id field
      { fields: ["show_id"] }, // Index for show_id field
    ],
  }
);

// Define relationships
User.hasMany(Review, { foreignKey: "user_id" });
Review.belongsTo(User, { foreignKey: "user_id" });

Show.hasMany(Review, { foreignKey: "show_id" });
Review.belongsTo(Show, { foreignKey: "show_id" });

// Sync models with database
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Models synced with database successfully!");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

// Export models
module.exports = {
  User,
  Show,
  Review,
  sequelize,
};
