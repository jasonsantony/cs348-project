# Schema

- Users(user_id: INT PRIMARY KEY, username: VARCHAR(255), password: VARCHAR(255), is_admin:INT, bio: TEXT);

- Shows(show_id: INT PRIMARY KEY, title: VARCHAR(255), director: VARCHAR(255), release_month: INT, release_year: INT, runtime: INT, num_episodes: INT, premise: TEXT, num_ratings: INT, avg_rating: REAL);

- Reviews(review_id: INT PRIMARY KEY, user_id: INT FOREIGN KEY REFERENCES Users(user_id) ON DELETE CASCADE, show_id: INT FOREIGN KEY REFERENCES Shows(show_id) ON DELETE CASCADE, rating_value: INT BETWEEN 0 AND 10, review_text: TEXT, timestamp TEXT);

# Triggers

- On addition of a Review, increment `Shows(num_ratings)` and recaculate `Shows(avg_rating)`
  - If `num_ratings` increments from zero for a given Show, `Shows(avg_rating)` updates to the single `Ratings(rating_value)`
- On deletion of a Review, decrement `Shows(num_ratings)` and recaculate `Shows(avg_rating)`
  - If `num_ratings` goes to zero for a given Show, `Shows(avg_rating)` set to null
