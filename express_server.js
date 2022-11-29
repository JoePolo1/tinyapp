const express = require('express');
const app = express();
const PORT = 8080; //default port 8080

function generateRandomString() {
  let randomChars = "";
  const alphaNum = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i <= 5; i++)  {
    //62 characters in the alphanumeric possibilities including capitalized letters
    randomChars += alphaNum.charAt(Math.floor(Math.random() * 62));
  }
  return randomChars;
}

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended:true }));

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
  const templatevars = { urls: urlDatabase };
  res.render("urls_index", templatevars);
});

//renders the new page, responsible for a new entry. Needs to be above urls/:id
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//creates a subpage for the shortened URL ID key offered in the URL itself
app.get("/urls/:id", (req, res) => {
  // console.log(req.params);
  const templateVars = {
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
  res.redirect(`/urls/:${shortUrl}`); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req,res) =>  {
  //const longURL = ...
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  const longURL = templateVars.longURL;
  res.redirect(longURL);
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