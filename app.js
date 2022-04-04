// Import the top-level function of express
const express = require('express');
const bodyParser = require('body-parser');
// Creates an Express application using the top-level function
const mongoose = require('mongoose');
// Connects a mongoDB
const _ = require('lodash');
const app = express();

// Routes HTTP GET requests to the specified path "/" with the specified callback function
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("Public"));


//MongoDB Section 
mongoose.connect("mongodb+srv://admin-hykim:Test123@cluster0.s6stj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",{useNewUrlParser: true});


//DB "Itemslist" Schema (Todolist)
const Itemschema = {
  name : String
};

const Item = mongoose.model("Item", Itemschema);
//Create Model base on Schema (If you see the DB list : Items)

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "You can add new Item"
});

const item3 = new Item({
  name: "<--- Click checkbox for delete to-do list"
});

const defaultItems = [item1, item2, item3];



//New DB for New Page
const listSchema = {
  name: String,
  items: [Itemschema]
};
const List = mongoose.model("List", listSchema);




app.get('/', function(req, res) {
  
  // ------------- Date DB ------------
  // var today = new Date();
  // var option = {
  //   weekday: "long",
  //   day: "numeric",
  //   month: "long"
  // }; 
  // var day = today.toLocaleDateString("en-US", option); ---> Create Date without DBs
  

  // ------------Find Item ----------------
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
app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list
        res.render("lists", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

//----------- Hompage Post (Today to-do list) --------------
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
      });
    }
    // Add data only the case which hase same listname (DB) = listname (input).
    // So, If you road every different page, it would be use different list.

});


//----------- Delete Post --------------

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/"+listName);
      }
    });
  }

});
//CheckboxId : Item delete (Delete Method : findByAndRemove)


//----------- connect port --------------
let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
// Make the app listen on port 3000
app.listen(port, function() {
  console.log('Server listening on http://localhost:' + port);
});
