//if imported from npm
//const Publisher = require("publisherproxy");
const Publisher = require("./index.js");
let state = {
    title: "News",
    items: [
        { title: "1th", text: "First news" },
        { title: "2nd", text: "Second news" }
    ]
}
let publisher = new Publisher(state);
let stateCopy = {};
let secondNews = [];
publisher.subscribeAll(stateCopy);
publisher.items[1].subscribeAll(secondNews);
publisher.items[1].text.subscribe((value) => console.log("second news new text : " + value));
publisher.items[1].text = "Second news Modified";
publisher.items = [
    { title: "Ah Ah", text: "Welcome" },
    { title: "Hello", text: "World" }
]
console.log("state", state);
console.log("stateCopy", stateCopy);
console.log("secondNews", secondNews);