// Import the top-level function of express
const express = require('express');
const bodyParser = require('body-parser');
// Creates an Express application using the top-level function
const app = express();


let items = [];
var item="";
// Define port number as 3000
const port = 3000;

// Routes HTTP GET requests to the specified path "/" with the specified callback function
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get('/', function(req, res) {
  var today = new Date();
  var option = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  var day = today.toLocaleDateString("en-US", option);
  res.render("lists", {kindOfDay: day, newListItems: items});
});


app.post ("/", function(req,res) {
  item = req.body.itemName;
  items.push(item);
  res.redirect("/");

});
// if(currentDay === 6 || currentDay === 0){
//   res.sendFile(__dirname + "/Public/weekend.html");
// }else {
//   res.sendFile(__dirname + "/Public/weekday.html");
// }
//file 옮겨가기 function
// Make the app listen on port 3000
app.listen(port, function() {
  console.log('Server listening on http://localhost:' + port);
});
