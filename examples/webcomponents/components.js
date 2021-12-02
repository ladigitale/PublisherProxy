
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
        //for tests
        // this.api.set({ "event_id": 46, "multisession": false, "pass_ids": [], "title": "Louise Attaque + The Seasons", "body": "COMPLET\r\nPlacement libre debout\/assis non garanti", "start_date": "1459965600", "end_date": "0", "sale_end_date": 1459963800, "archiving_date": 1460008800, "sale_start_date": false, "has_promo": false, "illustration": "https:\/\/la-billetterie.jb.test\/sites\/default\/files\/styles\/large\/public\/meme%20fichier%20en%20JPEG.JPG?itok=AhPLLT2O", "is_pass": "0", "nominative_ticket": "1", "has_distancing": "0", "refund_allowed": "0", "season": { "season_id": "1", "season_name": "Saison 2015 - 2016" }, "range": false, "categories": [{ "category_id": "1", "category_name": "Musiques" }], "labels": [], "producers": [{ "producer_id": "1", "producer_name": "SONGO", "producer_number": "1-1048676  \/ 2-1013579 \/ 3-1013580", "producer_text": "" }], "location": { "location_id": "1", "location_name": "STEREOLUX", "location_city_name": "Nantes", "location_postal_code": "44200", "location_address": "4, Boulevard L\u00e9on Bureau" }, "room": { "room_id": "1", "room_name": "Salle Maxi", "room_display_name": "1", "room_display_city": "0", "room_placing_type_key": "libre", "room_placing_type_label": "Placement libre", "room_free_placing_add_on_key": "debout_assis_non_garanti", "room_free_placing_add_on_label": "Debout - assis non garanti" }, "tax": { "tax_id": "2", "tax_name": "r\u00e9duit", "tax_value": "0.055" }, "prices": [{ "price_id": "13", "price_amount": "31.00", "price_name": "Guichet", "price_online": "0", "price_in_situ": "1", "price_places_nb": 6, "price_available": true, "price_min_places": "1", "place_category_id": "0", "place_category_label": "", "price_help_text": null, "price_is_promo": false, "is_triggering_promo": false }, { "price_id": "12", "price_amount": "30.60", "price_name": "Pr\u00e9vente", "price_online": "1", "price_in_situ": "0", "price_places_nb": 6, "price_available": true, "price_min_places": "1", "place_category_id": "0", "place_category_label": "", "price_help_text": null, "price_is_promo": false, "is_triggering_promo": false }, { "price_id": "11", "price_amount": "26.00", "price_name": "Carte Stereolux", "price_online": "1", "price_in_situ": "0", "price_places_nb": 6, "price_available": true, "price_min_places": "1", "place_category_id": "0", "place_category_label": "", "price_help_text": null, "price_is_promo": false, "is_triggering_promo": false }], "status": "on_sale", "additional_status": { "key": "", "libelle": "", "lang": "fr" }, "remaining_places_nb": 6, "max_places_nb": 4, "synchro_site": true, "refund_link": "" });
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