const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require('./helpers.js');

//sets the view engine and allows express and cookieParser to be used
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["justOneRandomString"]
}));

//User Data
const users = {};

const urlDatabase = {};

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


//This function returns an object containing the url databases assigned specifically to the user who is logged in
const urlsForUser = function(id)  {
  const urlData = {};
  for (let item in urlDatabase) {
    if (urlDatabase[item].userId === id)  {
      urlData[item] = urlDatabase[item]
    }
  }
  console.log(urlData);
  return urlData;
};


//Root dir. Redirects to login page if not logged in. Redirects to /urls if logged in. 
app.get("/", (req, res) => {
  if(req.session.user_id)  {
    return res.redirect("/urls");
  }
  res.redirect(`/login`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//renders the main URL page, with the (object) database of existing shortened and full length URLS
app.get("/urls", (req, res) => {
  if (!req.session.user_id)  {
    return res.status(401).send("Not Authorized to view this page. Please go back and Login or Register to view.");
  }
  //NEW TEST
  const urls = urlsForUser(req.session.user_id);
  const templateVars = { 
    user: users[req.session.user_id],
    urls
  };
  res.render("urls_index", templateVars);
});

//This page is the end point that gets the registration page. For now, it redirects to itself as a response.
app.get("/register",  (req, res)  =>  {
  const templateVars = {user: users[req.session.user_id]};
  if(req.session.user_id)  {
    res.redirect("/urls");
  }
  res.render("register", templateVars);
});

//This is the end point for the LOGIN page. If the user is already logged in, this redirects to the URL page.
app.get("/login",  (req, res)  =>  {
  const templateVars = {user: users[req.session.user_id]};
  if(req.session.user_id)  {
    return res.redirect("/urls");
  }
  res.render("login", templateVars);
});

//renders the new page, responsible for a new TINYURL entry. Redirects to login if user is not logged in.
app.get("/urls/new", (req, res) => {
  if(!req.session.user_id)  {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

//creates a subpage for the shortened URL ID key offered in the URL itself
app.get("/urls/:id", (req, res) => {
  console.log(`Req.params are: ${req.params.id}`);
  if (!req.session.user_id) {
    return res.status(401).send("401 Not Authorized.");
  }
  if (urlDatabase[req.params.id].userId !== req.session.user_id)  {
    return res.status(401).send("Error 401: Not Authorized to view this tinyURL.");
  }
  const templateVars = {
    user: users[req.session.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

//Redirects user to long version of shortened URL when accessed. 404 if short version does not exist. 401 if the user ID does not match the database id of the object. 
app.get("/u/:id", (req, res) => {
  if(!urlDatabase[req.params.id]) { 
    return res.status(404).send('404 Page Not Found. Shortcut does not exist. Consider making one!');
  }
  const longUrl = urlDatabase[req.params.id].longURL;      //This correctly leads to the URL needed 
  for (const urlId of Object.keys(urlDatabase)) {           //this for of loop appears to work as intended, redirecting to the long URL when clicked
    if (urlId === req.params.id) {
      return res.redirect(longUrl);
    }
  }
  // return res.status(404).send('404 Page Not Found. Shortcut does not exist. Consider making one!')
});


// This handles the post request for a new user registration
app.post("/register", (req, res)  =>  {
  //Want to compare this against pre-existing user data to see if there is already an existing account
  const email = req.body.email;
  const passwordInput = req.body.password;
  const hashedPassword = bcrypt.hashSync(passwordInput, 10);
  //Returns a 400 error if a password and email are not both provided in the registration fields
  if (!passwordInput || !email)  {
    return res.status(400).send('An email and password are both required for registration.')
  }

  // Declares an empty userFound variable and passes in users
  let existingUser = getUserByEmail(email, users);
  // If the above argument is truthy, directs customer to login or use a different email
  if (existingUser) {
    return res.status(400).send('This email is already registered. Please login or use a different email for registration')
  }

  // Creates a new user in the users object
  const newUserId = generateRandomId();
  req.session.user_id = newUserId;
  const newUser = {
    id: newUserId,       //this writes a new user object so changed the function to use req.session.user.id
    email: email,
    password: hashedPassword      //this was changed from password: password to align with hashedPassword instead
  }

  //Assigns the above generated random ID as the main user ID
  users[newUser.id] = newUser;
  res.redirect("/urls");
});

// This handles post requests for Logins
app.post("/login", (req, res) =>  {
  const email = req.body.email;
  const password = req.body.password; 
  // Similar to registration, if nothing was entered into email or password, return an error to fill out both fields
  if (!email || !password)  {
    return res.status(400).send('An email and password are both required for login. Please try again.')
  }
    // Declares an empty userFound variable and passes in email from the login post request
    // We can re-use the user lookup function here to determine first if the user exists
    let existingUser = getUserByEmail(email, users);
    // If the above argument is not truthy meaning the email does not exist in the DB, a 403 error is returned
    if (!existingUser) {
      return res.status(403).send('403 Forbidden.')
    }
    if (bcrypt.compareSync(password, (existingUser["password"])) === false) {
      return res.status(403).send('403 Forbidden.')
    }
    // Once those checks are complete, we can provide the cookie for the user id and redirect to our URLs page
    req.session.user_id = existingUser.id;
    res.redirect('urls');
})

// This generates the short URL using the function, and redirects to the short URL specific page after. Redirects to login if not logged in. 
app.post("/urls", (req, res) => {
  if(!req.session.user_id)  {
    return res.redirect("/login");
  }
  let shortUrl = generateRandomString();
  let longUrl = req.body.longURL;
  urlDatabase[shortUrl] = { 
    longURL: longUrl,
    userId: req.session.user_id
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortUrl}`); 
});

// This is responsible for deleting the selected URL key value pair
app.post("/urls/:id/delete", (req, res) => {
  if(!req.session.user_id)  {
    return res.status(401).send("Error 401: you are not authorized to edit or delete this tinyURL.")
  }
  if (urlDatabase[req.params.id].userId !== req.session.user_id)  {
    return res.status(401).send("Error 401: you are not authorized to edit or delete this tinyURL.");
  };
  console.log(urlDatabase[req.params.id]);
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

//This is the post request submitted via the edit button which redirects to the specific page of the selected shortened URL
app.post("/urls/:id/update", (req, res) => {
  // The below && conditional checks to also see if the user is logged in before delviering this msg
  if (urlDatabase[req.params.id].userId !== req.session.user_id)  {
    return res.status(401).send("Error 401: you are not authorized to edit or delete this tinyURL.");
  };
  if(!req.session.user_id)  {
    return res.status(401).send("Error 401: you are not authorized to edit or delete this tinyURL.")
  }
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls`);
});

//Cookie parsing at User Login
app.post("/urls/login", (req, res) => {
  req.session.user_id = req.body.user_id;
  res.redirect(`/urls`);
});

// Logout functionality which clears cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Sends a message to the console advising which port is being listened in on
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});