const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const cookieParser = require('cookie-parser')


//This function generates a random 6 character alphanumeric code used for the shortened URLS
const generateRandomString = function () {
  let randomChars = "";
  const alphaNum = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i <= 5; i++) {
    //62 characters in the alphanumeric possibilities including capitalized letters
    randomChars += alphaNum.charAt(Math.floor(Math.random() * 62));
  }
  return randomChars;
};

//sets the view engine
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


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
    urls: urlDatabase };
  res.render("urls_index", templatevars);
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


app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString();
  let longUrl = req.body.longURL;
  urlDatabase[shortUrl] = longUrl;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortUrl}`); // Respond with 'Ok' (we will replace this)
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


// This is responsible for deleting the selected URL key value pair
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
})


//This is the post request submitted via the edit button which redirects to the specific page of the selected shortened URL
//this likely need to be edited
app.post("/urls/:id/update", (req, res) => {
  const longURL = req.body.longURL
  const shortURL = req.params.id

  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
})


//Cookie parsing at Username Login
app.post("/urls/login", (req, res) => {
  console.log(req.body.username);
  res.cookie("username", req.body.username);
  res.redirect(`/urls`);
})


// Logout functionality which clears cookies
app.post("/urls/logout", (req, res) =>  {
  res.clearCookie("username");
  res.redirect(`/urls`);
})


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