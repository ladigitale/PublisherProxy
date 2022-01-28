
function isComplex(value) { return typeof value === 'object' && value != null };
class CustomProxy {
    constructor(target, parentProxPub = null) {
        this._proxies_ = new Map();
        this._value_ = target;
        this._assignListeners_ = new Set();
        this._mutationListeners_ = new Set();
        this._fillListeners_ = new Set();
        this._templateFillListeners_ = new Set();
        this._lockInternalMutationPublishing_ = false;
        this.parent = parentProxPub;
        this.root = this;
        while (this.root.parent) {
            this.root = this.root.parent;
        }
    }
    _publishInternalMutation_(lockInternalMutationsTransmission = false) {

        this._mutationListeners_.forEach(handler => handler());

        if (lockInternalMutationsTransmission) return;
        if (this.parent) {
            this.parent._publishInternalMutation_();
        }
    }
    _publishAssignement_(lockInternalMutationsTransmission = false) {
        this._assignListeners_.forEach(handler => handler(this._value_.__value ? this._value_.__value : this._value_));
        this._publishInternalMutation_(lockInternalMutationsTransmission);
    }
    _publishDynamicFilling_(key, value) {
        this._fillListeners_.forEach(handler => handler[key] = value);
        this._publishTemplateFilling_(key, value);

    }
    _publishTemplateFilling_(key, value) {
        this._templateFillListeners_.forEach(handler => {
            if (typeof (handler[key]) != "undefined") {
                handler[key] = value;
            }
        });
    }
    onAssign(handler) {
        if (typeof handler != "function") return;
        this._assignListeners_.add(handler);
        this._publishAssignement_();
    }
    offAssign(handler) {
        this._assignListeners_.delete(handler);
    }

    onInternalMutation(handler) {
        if (typeof handler != "function") return;
        this._mutationListeners_.add(handler);
        this._publishInternalMutation_();
    }
    offInternalMutation(handler) {
        this._mutationListeners_.delete(handler);
    }
    startTemplateFilling(handler) {
        this._templateFillListeners_.add(handler);
        for (var z in this._value_) { this._publishTemplateFilling_(z, this._value_[z]); }
    }
    stopTemplateFilling(handler) {
        this._templateFillListeners_.delete(handler);
    }

    startDynamicFilling(handler) {
        this._fillListeners_.add(handler);
        for (var z in this._value_) { this._publishDynamicFilling_(z, this._value_[z]); }
    }
    stopDynamicFilling(handler) {
        this._fillListeners_.delete(handler);
    }
  set(newValue, lockInternalMutationsTransmission = false) {
        if (
          this._value_.hasOwnProperty("__value") &&
          newValue.hasOwnProperty("__value") &&
          this._value_.__value == newValue.__value
        ) {
          return;
        }
        this._value_ = newValue;
        if (this._value_.hasOwnProperty("__value"))
        {
            this._publishAssignement_(lockInternalMutationsTransmission);
            return true;
        }
        Array.from(this._proxies_.keys()).forEach((key) => {
            if (!this._value_[key]) {
                this._proxies_.delete(key);
            }
        })
        for (let key in this._value_) {
            let v = this._value_[key];
            if (!this._proxies_.has(key)) { this._proxies_.set(key, new Publisher(isComplex(v) ? v : { __value: v }, this),true); }
            this._proxies_.get(key).set(isComplex(v) ? v : { __value: v }, true);
            this._publishDynamicFilling_(key, this._value_[key]);
        }
        this._publishAssignement_();
        return true;
    }
    get() {
        if (this._value_.__value) return this._value_.__value;
        return this._value_;
    }

}

export class PublisherManager {
    static instance = null;

    constructor() {
        if (PublisherManager.instance != null) throw "Singleton / use getInstance";
        PublisherManager.instance = this;
        this.publishers = new Map();
    }
    static getInstance(channel) {
        if (PublisherManager.instance == null) return new PublisherManager();
        return PublisherManager.instance;
    }
    get(id) {
        if (!this.publishers.has(id)) this.publishers.set(id, new Publisher({}));
        return this.publishers.get(id);
    }
}

export default class Publisher extends CustomProxy {
    constructor(target, parentProxPub = null) {
        super(target, parentProxPub);
        let that = this;
        return new Proxy(
            this,
            {
                "get": function (oTarget, sKey) {
                    if ([
                        "onAssign",
                        "offAssign",
                        "startDynamicFilling",
                        "stopDynamicFilling",
                        "startTemplateFilling",
                        "stopTemplateFilling",
                        "onInternalMutation",
                        "set",
                        "get",
                        "_templateFillListeners_",
                        "_fillListeners_",
                        "_assignListeners_",
                        "_publishInternalMutation_",
                        "_mutationListeners_",
                        "_publishDynamicFilling_",
                        "_publishTemplateFilling_",
                        "_publishAssignement_", 
                        "_proxies_",
                        "parent",
                        "_value_",
                        "_lockInternalMutationPublishing_"
                    ].includes(sKey)) return that[sKey];
                    if (!that._proxies_.has(sKey)) {
                        let vValue = target[sKey];
                        that._proxies_.set(sKey, new Publisher(isComplex(vValue) ? vValue : { __value: vValue }, that));
                    }
                    return that._proxies_.get(sKey);
                },
                "set": function (oTarget, sKey, vValue) {
                    if (sKey == "_value_") {
                        oTarget._value_ = vValue;
                        return oTarget._value_;
                    }
                    const isValueComplex = isComplex(vValue);
                    if (!that._proxies_.has(sKey)) { that._proxies_.set(sKey, new Publisher(isValueComplex ? vValue : { __value: vValue }, that)); }
                    if (target[sKey] == vValue && isValueComplex) return;
                    target[sKey] = vValue;
                    that._publishDynamicFilling_(sKey, vValue);
                    that._proxies_.get(sKey).set(isComplex(vValue) ? vValue : { __value: vValue });
                    return that._proxies_.get(sKey);
                },
                "deleteProperty": function (oTarget, sKey) {
                    that._proxies_.get(sKey).set(null);
                    that._publishDynamicFilling_(sKey, null);
                    that._proxies_.delete(sKey);
                    return delete target[sKey];
                },
                "enumerate": function (oTarget, sKey) {
                    return target.keys();
                },
                "has": function (oTarget, sKey) {
                    
                    return sKey in target && sKey != "_lockInternalMutationPublishing_";
                },
                "defineProperty": function (oTarget, sKey, oDesc) {
                    if (oDesc && "value" in oDesc) { target[sKey] = oDesc.value; }
                    return target;
                },
                "getOwnPropertyDescriptor": function (oTarget, sKey) {
                    var vValue = target[sKey];
                    return {
                        enumerable: true,
                        configurable: true,
                    };
                },
                "ownKeys": function (target) {
                    if (that._value_.__value) return Object.keys(this._value_.__value);
                    return Object.keys(that._value_);
                },
            }
        );
    }

}

if (typeof module != "undefined") module.exports = { Publisher: Publisher, PublisherManager: PublisherManager };