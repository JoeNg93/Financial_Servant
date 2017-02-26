const fs = require('fs');
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('client-sessions');
const crypto = require('crypto');

let moneySpentList = [];

const addNewSpending = (spending) => {
  moneySpentList.push(spending);
  fs.writeFile('./money_spent.json', JSON.stringify(moneySpentList));
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
    let categories = new Set();
    fs.readFile('./categories.json', 'utf8', (err, data) => {
      resolve(JSON.parse(data));
    });
  });
};

const getMoneySpentList = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('./money_spent.json', 'utf8', (err, data) => {
      let moneySpentList = JSON.parse(data);
      moneySpentList.forEach((eachSpending) => {
        eachSpending.date = new Date(eachSpending.date);
      });
      resolve(moneySpentList);
    });
  });
};

const getUsers = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('./user_accs.json', 'utf8', (err, users) => {
      if (err) {
        reject(new Error("Cannot read user info in db"));
      }
      resolve(JSON.parse(users));
    });
  });
};

const checkUsername = (username, users) => {
  return new Promise((resolve, reject) => {
    let user = users.find(eachUser => eachUser.username == username);
    if (user) {
      resolve(user);
    }
    reject(new Error("Wrong username"));
  });
};

const checkPassword = (userInfo, pass) => {
  return new Promise((resolve, reject) => {
    let saltHashPass = crypto.createHmac('sha256', userInfo.salt)
      .update(pass)
      .digest('hex');
    if (saltHashPass == userInfo.password) {
      resolve();
    }
    reject(new Error("Wrong password"));
  });
};

const isAuthenticated = (username, pass) => {
  return new Promise((resolve, reject) => {
    getUsers()
      .then(users => checkUsername(username, users))
      .then(userInfo => checkPassword(userInfo, pass))
      .then(resolve)
      .catch(err => reject(new Error(err.message)));
  });
};

hbs.registerHelper('getDate', (dateObject) => {
  return dateObject.toDateString();
});

app = express();

app.set('port', process.env.PORT);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Server static file
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  cookieName: 'session',
  secret: 'dsfasdf1239@%*@#*@zzcb##<>:P',
  duration: 30 * 60 * 1000, // 30 mins
  activeDuration: 5 * 30 * 1000 // get 5 mins more for each active
}));

const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    res.redirect('/');
  } else {
    next();
  }
};

app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/showSpending');
  } else {
    res.render('home.hbs');
  }
});

app.get('/addSpending', requireLogin, (req, res) => {
  getCategories().then((categories) => {
    res.render('add_spending.hbs', { categories });
  });
});

app.post('/addSpending', requireLogin, (req, res) => {
  const newSpending = {
    amount: Number(req.body.amount),
    description: req.body.description,
    category: req.body.category,
  };
  newSpending.date = req.body.date ? new Date(req.body.date) : new Date();
  addNewSpending(newSpending);
  res.redirect('/');
});

app.get('/showSpending', requireLogin, (req, res) => {
  let totalMoney = 0;
  getMoneySpentList().then((moneySpent) => {
    if (req.query.category) {
      moneySpentList = moneySpent.filter(eachSpending => eachSpending.category === req.query.category);
    } else {
      moneySpentList = moneySpent;
    }
    moneySpentList.forEach(eachSpending => totalMoney += eachSpending.amount);
    totalMoney = Math.round(totalMoney);
    getCategories().then((categoryList) => {
      res.render('show_spending.hbs', { moneySpentList, totalMoney, categoryList });
    })
  });
});

app.get('/login', (req, res) => {
  res.render('login.hbs');
});

app.post('/login', (req, res) => {
  if (req.body.username && req.body.password) {
    isAuthenticated(req.body.username, req.body.password)
      .then(() => {
        req.session.user = {
          username: req.body.username,
          password: req.body.password
        };
        res.redirect('/showSpending');
      })
      .catch((err) => {
        res.redirect('/');
      });
  }
});

app.get('/categories', (req, res) => {
  getCategories().then((categories) => {
    res.json(categories);
  });
});

app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});

app.listen(app.get('port'), () => {
  console.log('Listening on port', app.get('port'));
});
