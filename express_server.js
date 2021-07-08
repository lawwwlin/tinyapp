const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcrypt');

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

const morgan = require('morgan');
app.use(morgan('dev'));

// from Stack Overflow https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

const { findUserByEmail, filterData } = require("./helpers");

app.set("view engine", "ejs");

const database = {
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
    password: "$2b$10$IDTR/WU9NMAMgVCuSoR8cuiWHQeJbroxAn1jyUAIdbYZtRg6Qnbhy"
  },
  "bbbbb": {
    id: "bbbbb",
    email: "b@b.com",
    password: "$2b$10$eJ.9MxJZWL1qA.yICRIR9ePR.1ML4MpoP68izZPZ/0KQ2RQA1JFkG"
  }
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(database);
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const urls = {};
  const userUrls = filterData(userID, database);
  
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
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/login");
  }

  const templateVars = { user: users[req.session.user_id], };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const url = req.params.shortURL;
  const urls = {};
  const userUrls = filterData(userID, database);
  
  for (const urlID in userUrls) {
    urls[urlID] = userUrls[urlID].longURL;
  }

  if (!userID) {
    return res.redirect("/urls");
  }

  if (!database[url]) {
    const templateVars = {
      user: users[userID],
      shortURL: url,
      longURL: 'ERROR 404! The shortened URL does not exist'
    };
    return res.render("urls_show", templateVars);
  }

  if (userID !== database[url].userID) {
    const templateVars = {
      urls,
      user: users[userID],
      error: `ERROR 403! You don't have access to the shortened URL: ${url}`
    };
    return res.render("urls_index", templateVars);
  }

  const templateVars = {
    user: users[userID],
    shortURL: url,
    longURL: database[url].longURL
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const url = req.params.shortURL;

  if (!userID) {
    return res.status(401).send("You are not logged in... You don't have access to the shortened URL\n");
  }

  if (userID !== database[url].userID) {
    return res.status(403).send(`You don't have access to the shortened URL: ${url}\n`);
  }
  
  database[url] = {
    userID,
    longURL: req.body.newUrl
  };
  res.redirect(`/urls/${url}`);
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    return res.redirect("/urls");
  }

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  database[shortURL] = {
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
  const userID = req.session.user_id;

  if (database[userID]) {
    const longURL = database[userID].longURL;
    res.redirect(longURL);
  } else {
    const templateVars = {
      user: users[userID],
      shortURL: req.params.shortURL,
      longURL: 'ERROR 404! The shortened URL does not exist'
    };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const url = req.params.shortURL;

  if (!userID) {
    return res.status(401).send("You are not logged in to delete the URL\n");
  }

  if (userID !== database[url].userID) {
    return res.status(403).send("Stop hacking!!! You are deleting other people's URL...\n");
  }

  delete database[url];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const userID = req.session.user_id;
  const email = req.body.email;
  const user = findUserByEmail(email, users);
  const password = req.body.password;

  if (!email || !password || !user) {
    const templateVars = {
      user: users[userID],
      error: "ERROR 400, Incorrect Email or Password"
    };
  
    return res.render("urls_login", templateVars);
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (!result) {
      const templateVars = {
        user: users[userID],
        error: "ERROR 400, Incorrect Email or Password"
      };
    
      return res.render("urls_login", templateVars);
    }

    console.log("correct user login");
    req.session.user_id = user.id;
    return res.redirect("/urls");
  });
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (user) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: users[userID],
    error: ""
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const userID = req.session.user_id;
  
  if (!email || !password) {
    const templateVars = {
      user: users[userID],
      error: "ERROR 400, Email or Password field is empty",
    };
    res.render("urls_register", templateVars);
    return;
  }
  
  const user = findUserByEmail(email, users);
  if (user) {
    const templateVars = {
      user: users[userID],
      error: "ERROR 400, The account already exist",
    };
    res.render("urls_register", templateVars);
    return;
  }

  bcrypt.hash(password, 10, (err, hash) => {
    users[id] = {
      id,
      email,
      password: hash
    };
    console.log(users);
    req.session.user_id = id;
    res.redirect("/urls");
  });
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (user) {
    return res.redirect("/urls");
  }

  const templateVars = {
    error: "",
    user
  };
  res.render("urls_login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
