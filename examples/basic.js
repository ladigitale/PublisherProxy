//if imported from npm
//const Publisher = require("publisherproxy");
const { Publisher } = require("../dist/publisher-proxy.js");

console.log(Publisher);
const state = {
    title: "News",
    items: [
        { title: "1th", text: "First news" },
        { title: "2nd", text: "Second news" }
    ]
}
const publisher = new Publisher(state);
const fillable = {};
const fillableTemplate = { title: "A title to be replaced"};
const secondNews = [];
publisher.onInternalMutation(() => console.log("something mutated inside, maybe it's time to save"));
publisher.startDynamicFilling(fillable);
publisher.startTemplateFilling(fillableTemplate);
publisher.items[1].startDynamicFilling(secondNews);
publisher.items[1].text.onAssign((value) => console.log("second news new text : " + value));
publisher.items[1].text = "Second news Modified";
publisher.items = [
    { title: "Ah Ah", text: "Welcome" },
    { title: "Hello", text: "World" }
]
console.log("state", state);
console.log("fillable", fillable);
console.log("fillableTemplate", fillableTemplate);
console.log("secondNews", secondNews);
