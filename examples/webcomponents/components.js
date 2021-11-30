
//@ts-check
/*
    This example work need a proper server in order to work
*/
//const Publisher = require("publisherproxy"); // use it with yarn or NPM
import Publisher from "./publisher.js";// this is a copy of index.js

/*
    Singleton to access Publishers from any situation.
    Publishers are requested by id
*/
class Data{
    static instance = null;
    
    constructor() {
        if (Data.instance != null) throw "Singleton / use getInstance";
        Data.instance = this;
        this.publishers = new Map();
    }
    static getInstance(channel) {
        if (Data.instance == null) return new Data();
        return Data.instance;
    }
    getPublisher(id)
    {
        if (!this.publishers.has(id)) this.publishers.set(id, new Publisher({}));
        return this.publishers.get(id);
    }
}
/*
    WebComponents that fetchs data at every filter (publisher) internalMutation;
    Then it feds it into another publisher;
    Inputs and Results must be written in this component.
    see ./index.html for usage
*/
class APIFetch extends HTMLElement{
    constructor() { super();}
    connectedCallback() {
        const data = Data.getInstance();
        this.api = data.getPublisher(this.getAttribute("api-id"));
        this.src = this.getAttribute("src");
        this.filters = data.getPublisher(this.getAttribute("filters-id"));
        this.filtersData = {};
        this.filters.onInternalMutation(() => this.refreshData());
        this.filters.startDynamicFilling(this.filtersData);
    }
    async refreshData() {
        let search = new URLSearchParams();
        for (var z in this.filtersData) search.set(z, this.filtersData[z]);
        let result = await fetch(this.src+"?"+search.toString());
        let data = await result.json();
        this.api.set(data);
    }
}
customElements.define("api-fetch", APIFetch);

/*
    A utility function too get attribute values from a node or one of its ancestors.
    from parent to parent, the first node having an attibute named "attributeName" will stop search.
    Then it returns the attribute value.
*/
function getAncestorAttributeValue(node, attributeName) {
    while (!node.hasAttribute(attributeName) && node.parentElement) {
        node = node.parentElement;
    }
    return node.getAttribute(attributeName);
}


/*
    Web Component that change filter data based on its name
*/
class APIInput extends HTMLInputElement {
    connectedCallback() {
        this.addEventListener("keyup", (e)=>this.onInput())
    }
    onInput() {
        const data = Data.getInstance();
        const filters = data.getPublisher(getAncestorAttributeValue(this, "filters-id"));
        filters[this.name] = this.value;
    }
}
customElements.define("api-input", APIInput, { extends: 'input' });

/*
    Web Component that change its content data based Data fetched by the api
*/
class APIResult extends HTMLElement{
    connectedCallback() {
        this.style.display = "block";
        this.style.whiteSpace = "pre";
        const data = Data.getInstance();
        this.api = data.getPublisher(getAncestorAttributeValue(this, "api-id"));
        this.api.onAssign(() => this.innerHTML = JSON.stringify(this.api.get(), null, "    "));
    }
}
customElements.define("api-result", APIResult);