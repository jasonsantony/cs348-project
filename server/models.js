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

// Define Review model with indexes
const Review = sequelize.define(
  "Review",
  {
    review_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    show_title: {
      type: DataTypes.STRING(255),
    },
    show_director: {
      type: DataTypes.STRING(255),
    },
    show_release_year: {
      type: DataTypes.INTEGER,
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
  },
  {
    indexes: [
      { fields: ["user_id"] }, // Index for user_id field
    ],
  }
);

// Define relationships
User.hasMany(Review, { foreignKey: "user_id" });
Review.belongsTo(User, { foreignKey: "user_id" });

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
  Review,
  sequelize,
};
