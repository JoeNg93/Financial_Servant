const fs = require('fs');
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const path = require('path');

let moneySpentList = [];

const addNewSpending = (spending) => {
  moneySpentList.push(spending);
  fs.writeFile('./money_spent.json', JSON.stringify(moneySpentList));
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

app.get('/', (req, res) => {
  fs.readFile('./money_spent.json', 'utf-8', (err, data) => {
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

app.listen(app.get('port'), () => {
  console.log('Listening on port', app.get('port'));
});
