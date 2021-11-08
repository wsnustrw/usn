(function() {
    let root = this;
    let SmartPhone = function(obj) {
        if (obj instanceof SmartPhone) return obj;
        if (!(this instanceof SmartPhone)) return new SmartPhone(obj);
        this._wrapped = obj;
    };
    SmartPhone.userAgent = null;
    SmartPhone.getUserAgent = function() {
        return this.userAgent;
    };
    SmartPhone.setUserAgent = function(userAgent) {
        this.userAgent = userAgent;
    };
    SmartPhone.isAndroid = function() {
        return this.getUserAgent().match(/Android/i);
    };
    SmartPhone.isBlackBerry = function() {
        return this.getUserAgent().match(/BlackBerry/i);
    };
    SmartPhone.isBlackBerryPlayBook = function() {
        return this.getUserAgent().match(/PlayBook/i);
    };
    SmartPhone.isBlackBerry10 = function() {
        return this.getUserAgent().match(/BB10/i);
    };
    SmartPhone.isIOS = function() {
        return this.isIPhone() || this.isIPad() || this.isIPod();
    };
    SmartPhone.isIPhone = function() {
        return this.getUserAgent().match(/iPhone/i);
    };
    SmartPhone.isIPad = function() {
        return this.getUserAgent().match(/iPad/i);
    };
    SmartPhone.isIPod = function() {
        return this.getUserAgent().match(/iPod/i);
    };
    SmartPhone.isOpera = function() {
        return this.getUserAgent().match(/Opera Mini/i);
    };
    SmartPhone.isWindows = function() {
        return this.isWindowsDesktop() || this.isWindowsMobile();
    };
    SmartPhone.isWindowsMobile = function() {
        return this.getUserAgent().match(/IEMobile/i);
    };
    SmartPhone.isWindowsDesktop = function() {
        return this.getUserAgent().match(/WPDesktop/i);
    };
    SmartPhone.isFireFox = function() {
        return this.getUserAgent().match(/Firefox/i);
    };
    SmartPhone.isNexus = function() {
        return this.getUserAgent().match(/Nexus/i);
    };
    SmartPhone.isKindleFire = function() {
        return this.getUserAgent().match(/Kindle Fire/i);
    };
    SmartPhone.isPalm = function() {
        return this.getUserAgent().match(/PalmSource|Palm/i);
    };
    SmartPhone.isAny = function() {
        let foundAny = false;
        let getAllMethods = Object.getOwnPropertyNames(SmartPhone).filter(function(property) {
            return typeof SmartPhone[property] == 'function';
        });
        for (let index in getAllMethods) {
            if (getAllMethods[index] === 'setUserAgent' || getAllMethods[index] === 'getUserAgent' || getAllMethods[index] === 'isAny' || getAllMethods[index] === 'isWindows' || getAllMethods[index] === 'isIOS') {
                continue;
            }
            if (SmartPhone[getAllMethods[index]]()) {
                foundAny = true;
                break;
            }
        }
        return foundAny;
    };
    if (typeof window === 'function' || typeof window === 'object') {
        SmartPhone.setUserAgent(navigator.userAgent);
    }
    if (typeof exports !== 'undefined') {
        let middleware = function(isMiddleware) {
            isMiddleware = isMiddleware === (void 0) ? true : isMiddleware;
            if (isMiddleware) {
                return function(req, res, next) {
                    let userAgent = req.headers['user-agent'] || '';
                    SmartPhone.setUserAgent(userAgent);
                    req.SmartPhone = SmartPhone;
                    if ('function' === typeof res.locals) {
                        res.locals({
                            SmartPhone: SmartPhone
                        });
                    } else {
                        res.locals.SmartPhone = SmartPhone;
                    }
                    next();
                };
            } else {
                return SmartPhone;
            }
        };
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = middleware;
        }
        exports = middleware;
    } else {
        root.SmartPhone = SmartPhone;
    }
}.call(this));