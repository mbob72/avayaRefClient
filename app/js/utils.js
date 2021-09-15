/**
 * Copyright Avaya Inc.
 * All rights reserved. Usage of this source is bound to the terms described in
 * the file Avaya SDK EULA.pdf, included in this SDK.
 * Avaya – Confidential & Proprietary. Use pursuant to your signed agreement or Avaya Policy.
 */
/**
 * Utils class, contains helper/utility functions for the reference client
 * @class
 */
var utils = {
    /**
     * check if the client is using HTTPS
     * @returns {boolean} isSecure - true if using HTTPS false otherwise redirects to HTTPS resource location
     */
    isSecure: function () {
        if (window.location.protocol != "https:") {
            window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
        } else {
            return true;
        }
    },
    /**
     * set the default AMC port to 443 for convenience
     * @returns {string}
     */
    getDefaultPort: function () {
        return '443';
    },
    getDefaultAAWGPort: function () {
        return '443';
    },

    openHome: function () {
        utils.redirect('index.html');
    },
    openSettings: function () {
        utils.redirect('settings.html');
    },
    openSettingsElite: function () {
        utils.redirect('settings_elite.html');
    },
    getSettings: function () {
        var platform = localStorage.getItem('client.platform') || OceanaCustomerWebVoiceVideo.Services.Work.PlatformType.OCEANA;
        if (platform === OceanaCustomerWebVoiceVideo.Services.Work.PlatformType.OCEANA) {
            return settings;
        } else {
            return settingsElite;
        }
    },
    /**
     * redirects to the url provided
     * @param {string} url - the url to navigate to
     */
    redirect: function (url) {
        if (url) {
            window.location.replace(url);
        }
    },
    checkIfBrowserIsSupport: function () {

        var supportedBrowsers = ["Chrome", "Firefox", "edge"];
        var thisBrowserName = getBrowserInfo().name.trim();
        var thisBrowserVersion = getBrowserInfo().version.trim();
        var supported = supportedBrowsers.indexOf(thisBrowserName);

        if (supported !== -1) {
            return true;
        } else {
            if (checkIfSafari())
                return true;
            return true;
        }

        function getBrowserInfo(userAgent) {

            userAgent = (typeof userAgent === "undefined" || typeof userAgent !== "boolean") ? navigator.userAgent : userAgent;

            // http://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
            var ua = userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+(?:\.\d+)*)/i) || [];

            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+(?:\.\d+)*)/g.exec(ua) || [];
                return { name: 'IE ', version: (tem[1] || '') };
            }

            if (M[1] === 'Chrome') {
                tem = ua.match(/\b(OPR|Edge)\/(\d+(?:\.\d+)*)/);
                if (tem != null) {
                    return {
                        name: tem[1].replace("OPR", "opera").toLowerCase(),
                        version: tem[2]
                    };
                }
            }

            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+(?:\.\d+)*)/i)) != null) {
                M.splice(1, 1, tem[1]);
            }

            return {
                name: M[0],
                version: M[1]
            };
        }

        function checkIfSafari() {
            var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
                navigator.userAgent &&
                navigator.userAgent.indexOf('CriOS') == -1 &&
                navigator.userAgent.indexOf('FxiOS') == -1;
            return isSafari;
        }
    },
    //Temporary function added for call statistics
    checkIfChrome: function () {

        var supportedBrowsers = ["Chrome"];
        var thisBrowserName = getBrowserInfo().name.trim();
        var thisBrowserVersion = getBrowserInfo().version.trim();
        var supported = supportedBrowsers.indexOf(thisBrowserName);

        if (supported !== -1) {
            return true;
        } else {
            return false;
        }

        function getBrowserInfo(userAgent) {

            userAgent = (typeof userAgent === "undefined" || typeof userAgent !== "boolean") ? navigator.userAgent : userAgent;

            // http://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
            var ua = userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+(?:\.\d+)*)/i) || [];

            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+(?:\.\d+)*)/g.exec(ua) || [];
                return { name: 'IE ', version: (tem[1] || '') };
            }

            if (M[1] === 'Chrome') {
                tem = ua.match(/\b(OPR|Edge)\/(\d+(?:\.\d+)*)/);
                if (tem != null) {
                    return {
                        name: tem[1].replace("OPR", "opera").toLowerCase(),
                        version: tem[2]
                    };
                }
            }

            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+(?:\.\d+)*)/i)) != null) {
                M.splice(1, 1, tem[1]);
            }

            return {
                name: M[0],
                version: M[1]
            };
        }
    }


};