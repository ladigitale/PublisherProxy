# PublisherProxy
Association between a Javascript Proxy and a kind of pubsub pattern

#### WARNING !!   Not used in production at the time of writing

## Installation

```shell
yarn add publisherproxy
```

## Usage

Let's say you have an object representing a state.
We are going to create a publisher associated with this state

```javascript
const Publisher = require("publisherproxy");
const state = {
    title: "News",
    items: [
        { title: "1th", text: "First news" },
        { title: "2nd", text: "Second news" }
    ]
}
const publisher = new Publisher(state);
```

The publisher is a Javascript Proxy. This means that every modification on the publisher is reflected on the state.

### Be notified of any state change.

This is used for example to trigger a save of the state for any change, or an api call if a filter has changed.

```javascript
function save(){
	//do something to save the state
}
publisher.onInternalMutation(save);
publisher.items[1].text = "Second news Modified";
```

### Dynamic filling 

Dynamically fill an object with each modification.

```javascript
const fillable = {};
publisher.startDynamicFilling(fillable);
publisher.items[1].text = "Second news Modified";
publisher.stopDynamicFilling(fillable);
publisher.items[1].text = "Second news Modified Again";
console.log(fillable);
```

The object is a real-time copy of the state.

### Template filling 

Identical to the dynamic filling. However, only existing attributes are updated.

```javascript
const fillableTemplate = { title: "A title to be replaced"};
publisher.startTemplateFilling(fillableTemplate);
state.title = "Good morning";
publisher.stopTemplateFilling(fillableTemplate);
state.title = "Oops";
console.log(fillableTemplate);
```

This is interesting to use with webComponents with getters setters for example.

### Assignment Listener

You can listen to changes of a particular property or sub-property event if a parent object was replaced.

```javascript
publisher.items[1].text.onAssign(console.log);
publisher.items[1].text = "Second news Modified";
publisher.items = [
    { title: "Ah Ah", text: "Welcome" },
    { title: "Hello", text: "World" }
];
```



## Examples

Please look at the examples for a more in depth view.
