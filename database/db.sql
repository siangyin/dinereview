CREATE DATABASE IF NOT EXISTS webad;

USE webad1;

CREATE TABLE
  Users (
    userId INT (5) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'user',
    createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profilePhoto TEXT
  );

  CREATE TABLE Restaurants(
    restaurantId INT(5) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    contact VARCHAR(20),
    add1 VARCHAR(100),
    add2 VARCHAR(100),
    add3 VARCHAR(100),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Singapore',
    postalCode VARCHAR(20),
    area VARCHAR(50),
    openHrs VARCHAR(255),
    type VARCHAR(255),
    cuisine VARCHAR(255),
    status VARCHAR(10) NOT NULL DEFAULT 'draft'
)

CREATE TABLE Reviews(
    reviewId INT(5) AUTO_INCREMENT PRIMARY KEY,
    restaurantId INT(5) NOT NULL,
    userId INT(5) NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    rating DECIMAL(2, 1) NOT NULL,
    status VARCHAR(10) DEFAULT 'draft',
    createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_restaurant_review FOREIGN KEY(restaurantId) REFERENCES Restaurants(restaurantId),
    CONSTRAINT FK_user_review FOREIGN KEY(userId) REFERENCES Users(userId)
);

CREATE TABLE Photos (
photoId INT(5) AUTO_INCREMENT PRIMARY KEY,
restaurantId INT(5) NOT NULL,
reviewId INT(5),
photoUrl TEXT NOT NULL,
defaultPhoto BOOLEAN DEFAULT false,
createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
addedBy INT(5),
CONSTRAINT FK_restaurant_photo FOREIGN KEY (restaurantId)
    REFERENCES Restaurants(restaurantId),
	CONSTRAINT FK_review_photo FOREIGN KEY (reviewId)
    REFERENCES Reviews(reviewId),
CONSTRAINT FK_user_photo FOREIGN KEY (addedBy)
   REFERENCES Users(userId)
);

CREATE TABLE SavedRestaurants (
    userId INT(5) NOT NULL,
    restaurantId INT(5) NOT NULL,
    addedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_fav_restaurant_user FOREIGN KEY(userId) REFERENCES Users(userId),
    CONSTRAINT FK_fav_restaurant FOREIGN KEY(restaurantId) REFERENCES Restaurants(restaurantId)
)