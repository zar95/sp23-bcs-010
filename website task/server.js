const express = require('express');
const app = express();
const port = 3000;
 
// app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.json());


app.get('/', (req, res) => {
  res.sendFile(__dirname+'/views/index.html', {title: 'HomePage'});
});

app.get('/api.html',(req,res)=>{
res.sendFile(__dirname+ '/views/api.html', {title:'Stories'});
});

app.get('/login-form',(req,res)=>{
  res.sendFile(__dirname+ '/views/validation.html', {title:'login-form'});
  });
  
app.get('/my-cv',(req,res)=>{
  res.sendFile(__dirname+ '/views/cv.html', {title:'My-CV'});
  });
  


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


