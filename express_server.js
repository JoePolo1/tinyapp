const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const cookieParser = require('cookie-parser');


//sets the view engine and allows express and cookieParser to be used
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

//Testing a DRYer user lookup search function
const userLookup = function(users, email) {
  for (const userId in users) {
    const user = users[userId]
    if (user.email === email) {
      return user;
    }
  }
}


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


//Root dir. Just says hello.
app.get("/", (req, res) => {
  res.send("Hello!!!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//renders the main URL page, with the (object) database of existing shortened and full length URLS
app.get("/urls", (req, res) => {
  const templatevars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };
  res.render("urls_index", templatevars);
});


//This page is the end point that gets the registration page. For now, it redirects to itself as a response.
app.get("/register",  (req, res)  =>  {
  const templateVars = {user: users[req.cookies.user_id]};
  res.render("register", templateVars);
});

//This is the end point for the LOGIN page
app.get("/login",  (req, res)  =>  {
  const templateVars = {user: users[req.cookies.user_id]};
  res.render("login", templateVars);
});

//renders the new page, responsible for a new entry. Needs to be above urls/:id
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

//creates a subpage for the shortened URL ID key offered in the URL itself
app.get("/urls/:id", (req, res) => {
  // console.log(req.params);
  const templateVars = {
    user: users[req.cookies.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  //const longURL = ...
  const templateVars = {
    user: users[req.cookies.user_id],
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

  //Returns a 400 error if a password and email are not both provided
  if (!password || !email)  {
    return res.status(400).send('An email and password are both required for registration.')
  }

  // Declares an empty userFound variable and passes in users
  let existingUser = userLookup(users, email);
  // If the above argument is truthy, directs customer to login or use a different email
  if (existingUser) {
    return res.status(400).send('This email is already registered. Please login or use a different email for registration')
  }

  // //compare above against pre-existing user data to see if there is already an existing account
  // const existingUser = userParser(email);
  // if (existingUser) {
  //   //** COMPLETE LATER: responds with an error that email is already in use */
  // }

  // Creates a new user in the users object
  const newUser = {
    id: generateRandomId(),
    email: email,
    password: password
  }

  //Assigns the above generated random ID as the main user ID
  users[newUser.id] = newUser;

  console.log(users);
  res.cookie("user_id", newUser.id);
  res.redirect("/urls");
});

// This handles post requests for Logins
app.post("/login", (req, res) =>  {

})

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
  res.clearCookie("user_id");
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