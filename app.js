//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"]; //primitive
const workItems = [];

mongoose.connect("mongodb+srv://mustofyou:qc2iqd7yNy69VFWw@cluster0.krlyp.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true
});

const itemsSchema = {
  name: String
}

const Item = mongoose.model("newItem", itemsSchema);

const item1 = new Item({
  name: "komishc"
});
const item2 = new Item({
  name: "nonoooo"
});
const item3 = new Item({
  name: "tutti"
});

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

const defaultItems = [item1, item2, item3]





app.get("/", function(req, res) {

  Item.find({}, function(err, results) {

    if (results.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully saved defaul items to DB")
        }
        res.redirect("/")
      });
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: results
      });
    };
  })
});



app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(req.body)

  const item = new Item({
    name: itemName
  })

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundItems) {
      foundItems.items.push(item);
      foundItems.save();
      res.redirect("/" + listName);

    });
  }
});

app.post("/delete", function(req, res) {
  itemId = req.body.checkbox;
  listName = req.body.listName;


  console.log(listName);
  if (listName === "Today") {
    Item.findByIdAndRemove(itemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("deleted successfully");
        res.redirect("/")
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId }}}, function(err,foundList){
      if(!err){
        res.redirect("/"+listName)
      }
    })

  }
});



app.get("/:customListName", function(req, res) {
  const routeName = _.capitalize(req.params.customListName);

  List.findOne({
    name: routeName
  }, function(err, foundDocument) {
    if (!err) {
      if (!foundDocument) {
        console.log("creating new list: " + routeName); //how to specify by whom was it created after learning authentication.
        console.log("List Doesn't exist");
        const list = new List({
          name: routeName,
          items: defaultItems
        });
        list.save()
        res.redirect("/" + routeName); //how to do waiting interface with APIs
      } else {
        console.log("List exists");
        res.render("list", {
          listTitle: foundDocument.name,
          newListItems: foundDocument.items
        });
      }
    }
  });



});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
