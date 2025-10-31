const express = require('express');
const expressLayouts = require("express-ejs-layouts");
const app = express();

app.set('view engine', 'ejs'); 

app.use(express.static('public')); 

app.set("views", "views");

app.use(expressLayouts);
app.set("layout", "layouts/main"); // layout file name only


app.get('/', (req, res) => {
  res.render('homepage', { title: "Homepage" } );
});
 
app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style.css'));
});


app.get('/child', (req, res) => {
    res.render('layouts/child', { title: "Child Page" } );
}); 
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  }
  );
