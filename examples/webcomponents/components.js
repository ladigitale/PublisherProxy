
//@ts-check
/*
    This example work need a proper server in order to work
*/
//const Publisher = require("publisherproxy"); // use it with yarn or NPM
import {PublisherManager} from "./index.js";// this is a copy of index.js

/*
    Singleton to access Publishers from any situation.
    Publishers are requested by id
*/

/*
    WebComponents that fetchs data at every filter (publisher) internalMutation;
    Then it feds it into another publisher;
    Inputs and Results must be written in this component.
    see ./index.html for usage
*/
class APIFetch extends HTMLElement{
    constructor() { super();}
    connectedCallback() {
        const mng = PublisherManager.getInstance();
        this.api = mng.get(this.getAttribute("api-id"));
        this.src = this.getAttribute("src");
        this.filters = mng.get(this.getAttribute("filters-id"));
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
        const mng = PublisherManager.getInstance();
        const filters = mng.get(getAncestorAttributeValue(this, "filters-id"));
        filters[this.name] = this.value;
    }
}
customElements.define("api-input", APIInput, { extends: 'input' });

/*
    Web Component that change its content data based PublisherManager fetched by the api
*/
class APIResult extends HTMLElement{
    connectedCallback() {
        this.style.display = "block";
        this.style.whiteSpace = "pre";
        const mng = PublisherManager.getInstance();
        this.api = mng.get(getAncestorAttributeValue(this, "api-id"));
        this.api.onAssign(() => this.innerHTML = JSON.stringify(this.api.get(), null, "    "));
    }
}
customElements.define("api-result", APIResult);