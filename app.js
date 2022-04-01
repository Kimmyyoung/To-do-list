// Import the top-level function of express
const express = require('express');
const bodyParser = require('body-parser');
// Creates an Express application using the top-level function
const mongoose = require('mongoose');
// Connects a mongoDB
const _ = require('lodash');


const app = express();



let worklist = [];

var item="";

// Routes HTTP GET requests to the specified path "/" with the specified callback function
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//MongoDB Section 
mongoose.connect("mongodb+srv://admin-hykim:Test123@cluster0.s6stj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",{useNewUrlParser: true});

const Itemschema = {
  name : String
};
//DB "Itemslist" Schema (Todolist)

const Item = mongoose.model("Item", Itemschema);
//Create Model base on Schema (If you see the DB list : Items)

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "item2"
});

const item3 = new Item({
  name: "item3"
});

const defaultItems = [item1, item2, item3];




const listschema = {
  name: String,
  items: [Itemschema]
};
//New DB list Schema (for new page)
const List = mongoose.model("List", listschema);
//New model from "new DB" 



app.get('/', function(req, res) {
  
  // var today = new Date();
  // var option = {
  //   weekday: "long",
  //   day: "numeric",
  //   month: "long"
  // }; 
  // var day = today.toLocaleDateString("en-US", option); ---> Create Date without DBs
  
  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){
        Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
          }else{
            console.log("Please save defaultitems");
          }
        });
        //If DB(Item) doens't exist any data, please insert data (=insertMany)
        res.redirect("/");
      }else{
         res.render("lists", {listTitle : "Today", newListItems: foundItems});
      }//If DB(item) exist, show the data right away.

  });

  
});


//<--------------------- New Page ------------------------->
app.get("/:customeListName", function(req,res){
  //URL save the name "customelistname"

  const customelistname = _.capitalize(req.params.customeListName);

  List.findOne({name: customelistname}, function(err, foundList){
    if(!err){
      if(!foundList){}
          const list = new List({
            name : customelistname,
            items: defaultItems
          });
          list.save();
          res.redirect("/" + customelistname);
          //If the list doesn't exist, Create new list.
      }else{
        res.render("lists", {listTitle : foundList.name, newListItems: foundList.items});
        //If the list exist, show that list.
      }
    }
  )
});



// Input Data Area
app.post ("/", function(req,res) {

    const itemName = req.body.itemName;
    //input name from lists.ejs
    const listName = req.body.list;

    const item = new Item({
      name : itemName
    });


    if(listName === "Today"){
      item.save();
      res.redirect("/");
    }else{
      List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      })
    }
    // Add data only the case which hase same listname (DB) = listname (input).
    // So, If you road every different page, it would be use different list.

});


app.post("/delete", function(req,res){
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkItemId, function(err){
      if(!err){
        console.log("successfully delete!");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull : {items: {_id: checkItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
  
});
//CheckboxId : Item delete (Delete Method : findByAndRemove)


// if(currentDay === 6 || currentDay === 0){
//   res.sendFile(__dirname + "/Public/weekend.html");
// }else {
//   res.sendFile(__dirname + "/Public/weekday.html");
// }
//file 옮겨가기 function


let port = process.env.PORT;
if(port == null || port == ""){
  port = 2000;
}
// Make the app listen on port 2000
app.listen(port, function() {
  console.log('Server listening on http://localhost:' + port);
});
