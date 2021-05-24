/**
 * Copyright Avaya Inc.
 * All rights reserved. Usage of this source is bound to the terms described in
 * the file Avaya SDK EULA.pdf, included in this SDK.
 * Avaya – Confidential & Proprietary. Use pursuant to your signed agreement or Avaya Policy.
 */
/**
 * pubsub class, contains simple pubsub system based on jquery .on(), .off() and .trigger() methods
 * @class
 */
(function(window, $) {

    var o = $({});

    $.subscribe = function() {
        // Unregister first, to prevent multiple registrations of the same function
        o.off.apply(o, arguments);
        o.on.apply(o, arguments);
    };

    $.unsubscribe = function() {
        o.off.apply(o, arguments);
    };

    $.publish = function() {
        o.trigger.apply(o, arguments);
    };

}(window, jQuery));