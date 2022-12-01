const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const cookieParser = require('cookie-parser');


//sets the view engine and allows express and cookieParser to be used
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


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


const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "playerOne"
  },
  "9sm5xK": {
    longURL:  "http://www.google.com",
    userId: "playerTwo"
  },
};

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


//Root dir. Just says hello.
app.get("/", (req, res) => {
  res.send("Hello!!!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//renders the main URL page, with the (object) database of existing shortened and full length URLS
app.get("/urls", (req, res) => {
  if (!req.cookies.user_id)  {
    return res.status(401).send("Not Authorized to view this page. Please go back and Login or Register to view.");
  }
  //NEW TEST
  const urls = urlsForUser(req.cookies.user_id);
  const templateVars = { 
    user: users[req.cookies.user_id],
    urls
  };
  res.render("urls_index", templateVars);
});

//This page is the end point that gets the registration page. For now, it redirects to itself as a response.
app.get("/register",  (req, res)  =>  {
  const templateVars = {user: users[req.cookies.user_id]};
  if(req.cookies.user_id)  {
    res.redirect("/urls");
  }
  res.render("register", templateVars);
});

//This is the end point for the LOGIN page. If the user is already logged in, this redirects to the URL page.
app.get("/login",  (req, res)  =>  {
  const templateVars = {user: users[req.cookies.user_id]};
  if(req.cookies.user_id)  {
    return res.redirect("/urls");
  }
  res.render("login", templateVars);
});

//renders the new page, responsible for a new entry. Redirects to login if user is not logged in.
app.get("/urls/new", (req, res) => {
  if(!req.cookies.user_id)  {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

//creates a subpage for the shortened URL ID key offered in the URL itself
app.get("/urls/:id", (req, res) => {
  console.log(`Req.params are: ${req.params.id}`);
  if (!req.cookies.user_id) {
    return res.status(401).send("401 Not Authorized.");
  }
  if (urlDatabase[req.params.id].userId !== req.cookies.user_id)  {
    return res.status(401).send("Error 401: Not Authorized to view this tinyURL.");
  }
  // if (req.cookies.user_id !== req.params.id)  {
  //   return res.status(401).send("Error 401: Not Authorized to view this tinyURL.");
  // }
  const templateVars = {
    user: users[req.cookies.user_id],
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
  const email = req.body.email;
  const password = req.body.password;
  
  // Similar to registration, if nothing was entered into email or password, return an error to fill out both fields
  if (!email || !password)  {
    return res.status(400).send('An email and password are both required for login. Please try again.')
  }

    // Declares an empty userFound variable and passes in email from the login post request
    // We can re-use the user lookup function here to determine first if the user exists
    let existingUser = userLookup(users, email);
    // If the above argument is not truthy meaning the email does not exist in the DB, a 403 error is returned
    if (!existingUser) {
      return res.status(403).send('403 Forbidden.')
    }
    // Similarly we can check if the passwords match with a correct email, if not, a 403 is returned
    if (existingUser.password !== password) {
      return res.status(403).send('403 Forbidden.')
    }
    // Once those checks are complete, we can provide the cookie for the user id and redirect to our URLs page
    res.cookie('user_id', existingUser.id);
    res.redirect('urls');
})

// This generates the short URL using the function, and redirects to the short URL specific page after. Redirects to login if not logged in. 
app.post("/urls", (req, res) => {
  if(!req.cookies.user_id)  {
    return res.redirect("/login");
  }
  let shortUrl = generateRandomString();
  let longUrl = req.body.longURL;
  urlDatabase[shortUrl] = { 
    longURL: longUrl,
    userId: req.cookies.user_id
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortUrl}`); 
});

// This is responsible for deleting the selected URL key value pair
app.post("/urls/:id/delete", (req, res) => {
  console.log(urlDatabase[req.params.id]);
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

//This is the post request submitted via the edit button which redirects to the specific page of the selected shortened URL
app.post("/urls/:id/update", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls`);
});

//Cookie parsing at User Login
app.post("/urls/login", (req, res) => {
  res.cookie("user_id", req.body.user_id);
  res.redirect(`/urls`);
});

// Logout functionality which clears cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/login`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Sends a message to the console advising which port is being listened in on
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});