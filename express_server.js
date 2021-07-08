const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const morgan = require('morgan');
app.use(morgan('dev'));

// from Stack Overflow https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

// from Lecture: HTTP Cookies & User Authentication - W03D3 by Andy Lindsay
const findUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }

  return null;
};

const filterData = (userID) => {
  const filteredData = {};

  for (const shortURL in urlDatabase) {
    const url = urlDatabase[shortURL];
    if (url.userID === userID) {
      filteredData[shortURL] = {
        longURL: url.longURL
      };
    }
  }

  if (Object.keys(filteredData).length === 0) {
    return null;
  }

  return filteredData;
};

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aaaaa"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aaaaa"
  }
};

const users = {
  "aaaaa": {
    id: "aaaaa",
    email: "a@a.com",
    password: "1234"
  },
  "bbbbb": {
    id: "bbbbb",
    email: "b@b.com",
    password: "1234"
  }
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const urls = {};
  const userUrls = filterData(userID);
  
  for (const urlID in userUrls) {
    urls[urlID] = userUrls[urlID].longURL;
  }

  const templateVars = {
    urls,
    user,
    error: ""
  };

  if (!userID) {
    templateVars.error = "Uh oh... You are not logged in... Please log in or register first!";
    return res.render("urls_index", templateVars);
  }

  if (!userUrls) {
    return res.render("urls_index", templateVars);
  }

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;
  if (!userID) {
    return res.redirect("/login");
  }

  const templateVars = { user: users[req.cookies["user_id"]], };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies.user_id;
  const url = req.params.shortURL;
  const urls = {};
  const userUrls = filterData(userID);
  
  for (const urlID in userUrls) {
    urls[urlID] = userUrls[urlID].longURL;
  }

  if (!userID) {
    return res.redirect("/urls");
  }

  if (userID !== urlDatabase[url].userID) {
    const templateVars = {
      urls,
      user: users[userID],
      error: `You don't have access to the shortened URL: ${url}`
    };
    return res.render("urls_index", templateVars);
  }

  if (urlDatabase[url]) {
    const templateVars = {
      user: users[req.cookies["user_id"]],
      shortURL: url,
      longURL: urlDatabase[url].longURL
    };
    res.render("urls_show", templateVars);
  } else {
    const templateVars = {
      user: users[req.cookies["user_id"]],
      shortURL: url,
      longURL: 'ERROR! The shortened URL does not exist'
    };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.cookies.user_id;
  const url = req.params.shortURL;

  if (!userID) {
    return res.status(401).send("You are not logged in... You don't have access to the shortened URL\n");
  }

  if (userID !== urlDatabase[url].userID) {
    return res.status(401).send(`You don't have access to the shortened URL: ${url}\n`);
  }
  
  urlDatabase[url] = {
    userID,
    longURL: req.body.newUrl
  };
  res.redirect(`/urls/${url}`);
});

app.post("/urls", (req, res) => {
  const userID = req.cookies.user_id;

  if (!userID) {
    return res.redirect("/urls");
  }

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = {
    userID,
    longURL
  };

  const templateVars = {
    shortURL,
    longURL,
    user: users[userID]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    const templateVars = {
      user: users[req.cookies["user_id"]],
      shortURL: req.params.shortURL,
      longURL: 'ERROR! The shortened URL does not exist'
    };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies.user_id;
  const url = req.params.shortURL;

  if (!userID) {
    return res.status(401).send("You are not logged in to delete the URL\n");
  }

  if (userID !== urlDatabase[url].userID) {
    return res.status(401).send("Stop hacking!!! You are deleting other people's URL...\n");
  }

  delete urlDatabase[url];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = findUserByEmail(email);
  const password = req.body.password;

  if (user) {
    if (user.password === password) {
      res.cookie("user_id", user.id);
      return res.redirect("/urls");
    }
  }

  const templateVars = {
    user: users[req.cookies["user_id"]],
    error: "ERROR 403, Incorrect Email or Password"
  };

  res.render("urls_login", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    error: ""
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    const templateVars = {
      user: users[req.cookies["user_id"]],
      error: "ERROR 400, Email or Password field is empty",
    };
    res.render("urls_register", templateVars);
    return;
  }

  const user = findUserByEmail(email);
  if (user) {
    const templateVars = {
      user: users[req.cookies["user_id"]],
      error: "ERROR 400, The account already exist",
    };
    res.render("urls_register", templateVars);
    return;
  }

  users[id] = {
    id,
    email,
    password
  };
  res.cookie("user_id", id);
  console.log(users);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    error: ""
  };
  res.render("urls_login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
