class CustomProxy {
    constructor(target, parentProxPub = null) {
        this._proxies_ = new Map();
        this._value_ = target;
        this._listeners_ = new Set();
        this._listenersAll_ = new Set();
        this.parent = parentProxPub;
        this.root = this;
        while (this.root.parent) {
            this.root = this.root.parent;
        }
    }
    _publish_() {
        this._listeners_.forEach(handler => handler(this._value_.__value ? this._value_.__value : this._value_));
    }
    _publishAll_(key, value) {
        this._listenersAll_.forEach(handler => handler[key] = value);
    }
    subscribe(handler) {
        if (typeof handler != "function") return;
        this._listeners_.add(handler);
        this._publish_();
    }
    unsubscribe(handler) {
        this._listeners_.delete(handler);
    }
    subscribeAll(handler) {
        this._listenersAll_.add(handler);
        for (var z in this._value_) { this._publishAll_(z, this._value_[z]); }
    }
    unsubscribeAll(handler) {
        this._listenersAll_.delete(handler);
    }
    _set_(newValue) {
        this._value_ = newValue;
        this._publish_();
        let keys = this._proxies_.keys();
        let key = null;
        Array.from(this._proxies_.keys()).forEach((key) => {
            if (!this._value_[key]) {
                this._proxies_.delete(key);
            }
            else {
                this._proxies_.get(key)._set_(this._value_[key]);
            }
        })
    }
    get() {
        if (this._value_.__value) return this._value_.__value;
        return this._value_;
    }

}
class Publisher extends CustomProxy {
    constructor(target, parentProxPub = null) {
        super(target, parentProxPub);
        let that = this;
        function isComplex(value) { return typeof value === 'object' };
        return new Proxy(
            this,
            {
                "get": function (oTarget, sKey) {
                    if ([
                        "subscribe",
                        "unsubscribe",
                        "subscribeAll",
                        "unsubscribeAll",
                        "_set_",
                        "get",
                        "_listenersAll_",
                        "_listeners_",
                        "_publishAll_",
                        "_publish_",
                        "_proxies_",
                        "parent",
                        "_value_"
                    ].includes(sKey)) return that[sKey];
                    if (!that._proxies_.has(sKey)) {
                        let vValue = target[sKey];
                        that._proxies_.set(sKey, new Publisher(isComplex(vValue) ? vValue : { __value: vValue }));
                    }
                    return that._proxies_.get(sKey);
                },
                "set": function (oTarget, sKey, vValue) {
                    // if (["subscribe", "unsubscribe", "subscribeAll", , "unsubscribeAll", "_set_", "get"].includes(sKey)) return null;
                    if (sKey == "_value_") {
                        oTarget._value_ = vValue;
                        return oTarget._value_;
                    }
                    if (!that._proxies_.has(sKey)) { that._proxies_.set(sKey, new Publisher(isComplex(vValue) ? vValue : { __value: vValue }, that)); }
                    target[sKey] = vValue;
                    that._proxies_.get(sKey)._set_(vValue);
                    that._publishAll_(sKey, vValue);
                    return that._proxies_.get(sKey);
                },
                "deleteProperty": function (oTarget, sKey) {
                    that._proxies_.get(sKey)._set_(null);
                    that._proxies_.delete(sKey);
                    that._publishAll_(sKey, null);
                    return delete target[sKey];
                },
                "enumerate": function (oTarget, sKey) {
                    return target.keys();
                },
                "ownKeys": function (oTarget, sKey) {
                    return target.keys();
                },
                "has": function (oTarget, sKey) {
                    return sKey in target;
                },
                "defineProperty": function (oTarget, sKey, oDesc) {
                    if (oDesc && "value" in oDesc) { target[sKey] = oDesc.value; }
                    return target;
                },
                "getOwnPropertyDescriptor": function (oTarget, sKey) {
                    var vValue = target[sKey];
                    return vValue ? {
                        "value": vValue,
                        "writable": true,
                        "enumerable": true,
                        "configurable": false
                    } : undefined;
                }
            }
        );
    }

}
module.exports = Publisher;