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
  activeDuration: 5 * 60 *1000
}));

app.get('/', (req, res) => {
  fs.readFile('./public/json/money_spent.json', 'utf-8', (err, data) => {
    moneySpentList = JSON.parse(data);
    moneySpentList.forEach((eachSpending) => {
      eachSpending.date = new Date(eachSpending.date);
    });
    res.render('home.hbs', {moneySpentList,});
  });
});

app.get('/addSpending', (req, res) => {
  res.render('add_spending.hbs');
});

app.post('/addSpending', (req, res) => {
  const newSpending = {
    amount: Number(req.body.amount),
    description: req.body.description,
  };
  newSpending.date = req.body.date ? new Date(req.body.date) : new Date();
  addNewSpending(newSpending);
  res.redirect('/');
});

app.listen(app.get('port'), () => {
  console.log('Listening on port', app.get('port'));
});
