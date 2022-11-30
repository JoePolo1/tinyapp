const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const cookieParser = require('cookie-parser');


//sets the view engine
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//This function generates a random 6 character alphanumeric code used for the shortened URLS
const generateRandomString = function() {
  let randomChars = "";
  const alphaNum = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i <= 5; i++) {
    //62 characters in the alphanumeric possibilities including capitalized letters
    randomChars += alphaNum.charAt(Math.floor(Math.random() * 62));
  }
  return randomChars;
};


//This function generates a random 4 character alphanumeric code used for user ID's
const generateRandomId = function() {
  let randomChars = "";
  const alphaNum = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i <= 3; i++) {
    //62 characters in the alphanumeric possibilities including capitalized letters
    randomChars += alphaNum.charAt(Math.floor(Math.random() * 62));
  }
  return randomChars;
};


//User Data
const users = {
  playerOne: {
    id: "playerOne",
    email: "user1@example.com",
    password: "1234",
  },
  playerTwo: {
    id: "playerTwo",
    email: "user2@example.com",
    password: "5678",
  },
};

//our database of long and shortened URLS
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!!!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//renders the main URL page, with the (object) database of existing shortened and full length URLS
app.get("/urls", (req, res) => {
  const templatevars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templatevars);
});


//This page is the end point that gets the registration page. For now, it redirects to itself as a response.
app.get("/register",  (req, res)  =>  {
  const templateVars = {username: req.cookies["username"]};
  res.render("register", templateVars);
});


//renders the new page, responsible for a new entry. Needs to be above urls/:id
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});


//creates a subpage for the shortened URL ID key offered in the URL itself
app.get("/urls/:id", (req, res) => {
  // console.log(req.params);
  const templateVars = {
    username: req.cookies["username"],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  //const longURL = ...
  const templateVars = {
    username: req.cookies["username"],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  const longURL = templateVars.longURL;
  res.redirect(longURL);
});


// This handles the post request for a new user registration
app.post("/register", (req, res)  =>  {
  //Want to compare this against pre-existing user data to see if there is already an existing account
  const email = req.body.email;
  const password = req.body.password;

  //compare above against pre-existing user data to see if there is already an existing account
  const existingUser = userParser(email);
  if (existingUser) {
    //** COMPLETE LATER: responds with an error that email is already in use */
  }

  //if existingUser is false, continues with generating a new user ID
  const id = generateRandomId();

});


// This generates the short URL using the function, and redirects to the short URL specific page after
app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString();
  let longUrl = req.body.longURL;
  urlDatabase[shortUrl] = longUrl;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortUrl}`); // Respond with 'Ok' (we will replace this)
});




// This is responsible for deleting the selected URL key value pair
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});


//This is the post request submitted via the edit button which redirects to the specific page of the selected shortened URL
//this likely need to be edited
app.post("/urls/:id/update", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;

  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});


//Cookie parsing at Username Login
app.post("/urls/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect(`/urls`);
});


// Logout functionality which clears cookies
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect(`/urls`);
});


//initial example data
// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

//test data only
// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});