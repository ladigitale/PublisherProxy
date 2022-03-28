//if imported from npm
//const Publisher = require("publisherproxy");
const { Publisher, PublisherManager } = require("../dist/publisher-proxy.js");

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

const state = {
    title: "News",
    items: [
        { title: "1th", text: "First news" },
        { title: "2nd", text: "Second news" }
    ]
}
const publisher = PublisherManager.getInstance().get("HEY");
// publisher["title"] = "Un titre";
// console.log(publisher.get());
// publisher.set({ a: "HEY" });
// console.log(publisher.get());
// publisher["title"] = "Un deuxième titre";
// console.log(publisher.get());
let dataPath = "items.0";
let array = dataPath.split('.');

const publisher2 = PublisherManager.getInstance().get("HEY");
let pub = publisher2;
for (let key of array) pub = pub[key];
let v = new TemplateTest();
pub.startTemplateFilling(v);
const fillable = {};
const fillableTemplate = new TemplateTest();//{ title: "A title to be replaced"};
publisher.onInternalMutation(() => console.log("something mutated inside, maybe it's time to save"));
publisher.startDynamicFilling(fillable);
publisher.startTemplateFilling(fillableTemplate);
console.log(v);
publisher.title = "Good morning";
let onAssign = (value) => console.log("second news new text : " + value);
publisher.items[1].text.onAssign(onAssign);
publisher.items[1].text = "Second news Modified";
publisher.items[1].text.offAssign(onAssign);
publisher.items[1].text = "Second news Modified 2";
publisher.items = [
    { title: "Ah Ah", text: "Welcome" },
    { title: "Hello", text: "World" }
]
console.log("state", state);
console.log("fillable", fillable);
console.log("fillableTemplate", fillableTemplate);
console.log(Object.keys(publisher));