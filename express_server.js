const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser())

const morgan = require('morgan');
app.use(morgan('dev'));

// from Stack Overflow https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const url = req.params.shortURL;
  if (urlDatabase[url]) {
    const templateVars = {
      username: req.cookies["username"],
      shortURL: url,
      longURL: urlDatabase[url] };
    res.render("urls_show", templateVars);
  } else {
    const templateVars = {
      username: req.cookies["username"],
      shortURL: url,
      longURL: 'The Shotened URL Does Not Exist' };
    res.render("urls_dne", templateVars);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const url = req.params.shortURL;
  urlDatabase[url] = req.body.newUrl;
  res.redirect(`/urls/${url}`);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  const templateVars = { 
    username: req.cookies["username"],
    shortURL: shortURL,
    longURL: longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  } else {
    const templateVars = {
      username: req.cookies["username"],
      shortURL: req.params.shortURL,
      longURL: 'The Shortened URL Does Not Exist' };
    res.render("urls_dne", templateVars);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
