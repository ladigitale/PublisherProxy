//if imported from npm
//const Publisher = require("publisherproxy");
const { Publisher } = require("../dist/publisher-proxy.js");

class TemplateTest {
    constructor() {
        this._title = "...";
    }
    get title() {
        return this._title;
    }
    set title(value) {
        this._title = value;
        return value;
    }
}

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
const fillableTemplate = new TemplateTest();//{ title: "A title to be replaced"};
const secondNews = [];
publisher.onInternalMutation(() => console.log("something mutated inside, maybe it's time to save"));
publisher.startDynamicFilling(fillable);
publisher.startTemplateFilling(fillableTemplate);
publisher.title = "Good morning";
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
