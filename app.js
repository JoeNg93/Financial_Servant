const fs = require('fs');
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('client-sessions');

let moneySpentList = [];

const addNewSpending = (spending) => {
  moneySpentList.push(spending);
  fs.writeFile('./public/json/money_spent.json', JSON.stringify(moneySpentList));
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
    let categories = new Set();
    fs.readFile('./public/json/money_spent.json', 'utf8', (err, data) => {
      JSON.parse(data).forEach((eachSpending) => {
        categories.add(eachSpending.category);
      });
      resolve(Array.from(categories));
    });
  });
};

const getMoneySpentList = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('./public/json/money_spent.json', 'utf8', (err, data) => {
      let moneySpentList = JSON.parse(data);
      moneySpentList.forEach((eachSpending) => {
        eachSpending.date = new Date(eachSpending.date);
      });
      resolve(moneySpentList);
    });
  });
};

hbs.registerHelper('getDate', (dateObject) => {
  return dateObject.toDateString();
});

app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Server static file
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  cookieName: 'session',
  secret: 'dsfasdf1239@%*@#*@zzcb##<>:P',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 30 * 1000
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
    res.render('add_spending.hbs', {categories});
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
    res.render('show_spending.hbs', { moneySpentList, totalMoney });
  });
});

app.get('/login', (req, res) => {
  res.render('login.hbs');
});

app.post('/login', (req, res) => {
  if (req.body.username && req.body.password) {
    const user = {
      username: req.body.username,
      password: req.body.password,
    };
    fs.readFile('./user_accs.json', 'utf8', (err, data) => {
      if (err) {
        throw err;
        res.send('Error. Sorry');
      } else {
        const userInfo = JSON.parse(data);
        userInfo.forEach((eachUser) => {
          if (eachUser.username === user.username) {
            if (eachUser.password === user.password) {
              req.session.user = user;
              res.redirect('/showSpending');
            }
          } else {
            res.redirect('/');
          }
        });
      }
    });
  } else {
    res.redirect('/');
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