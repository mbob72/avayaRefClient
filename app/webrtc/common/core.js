/**
 * Copyright Avaya Inc.
 * All rights reserved. Usage of this source is bound to the terms described in
 * the file Avaya SDK EULA.pdf, included in this SDK.
 * Avaya – Confidential & Proprietary. Use pursuant to your signed agreement or Avaya Policy.
 */
/**
 * Core class specific to webrtc, contains common functions audio and video for the reference client
 * @class
 */
var webRTCCore = {
    /**
     * helper function to convert enum value to display string format
     * @param state
     * @return {*}
     */
     convertInteractionState: function (state) {
        InteractionState = OceanaCustomerWebVoiceVideo.Services.Work.InteractionState;
        var keys = Object.keys(InteractionState).reduce(function (acc, key) {
            return acc[InteractionState[key]] = key, acc;
        }, {});
    
        return keys[state];
    },
    /**
     * function to create and initialise the OceanaCustomerWebVoiceVideo client instance,
     * and to create a work object from OceanaCustomerWebVoiceVideo.
     * This function also add the service map and resource map to the work object.
     * @public
     */
    initialiseClient: function(config, workRequest) {
        var clientInstance;

        if (config) {
            if (!clientInstance) {
                clientInstance = new OceanaCustomerWebVoiceVideo(config);
                console.info('Reference Client: Oceana SDK instance created');
                clientInstance.registerLogger(console);
                console.info('Reference Client: Oceana SDK logger registered');
            }
        } else {
            clientInstance = undefined;
            throw 'SDK: invalid configuration object provided';
        }

        console.debug('SDK: version - ' + clientInstance.getVersionNumber());

        if (workRequest) {
            work = clientInstance.createWork();

            work.setRoutingStrategy(workRequest.strategy);
            work.setLocale(workRequest.locale);

            if (workRequest.attributes && workRequest.attributes.length > 0) {
                // convert attributes from array into object
                var attributes = {};
                $.each(workRequest.attributes, function (index, attribute) {
                    // if attributes contains key, add value to array
                    // else add new key and value
                    if (attributes.hasOwnProperty(attribute.name)) {
                        attributes[attribute.name].push(attribute.values);
                    } else {
                        attributes[attribute.name] = [attribute.values];
                    }
                });

                // create a service if there are attributes configured in the client application
                var service = new OceanaCustomerWebVoiceVideo.Services.Work.Schema.Service();
                service.setAttributes(attributes);
                service.setPriority(workRequest.priority);

                work.setServices([service]);
            }

            if (workRequest.nativeResourceId && workRequest.sourceName) {
                // create a resource if the resource Id and source name are configured in the client application
                var resource = new OceanaCustomerWebVoiceVideo.Services.Work.Schema.Resource();
                resource.setNativeResourceId(workRequest.nativeResourceId);
                resource.setSourceName(workRequest.sourceName);

                work.setResources([resource]);
            }

            /*
                * Alternate method of creating routing attributes. 
                * The below mechanism creates a simple work request with the attributes provided
                */
            // attributes = work.getAttributes();

            // $.each(service.attributes, function (index, attribute) {
            //     var routingAttribute = attributes.createAttribute().withName(attribute.name)
            //         .withValues([attribute.values]);
            //     attributes.upsert(routingAttribute);
            // });
            return work;
        }
        else {
            throw 'SDK: invalid service or resource object provided';
        }
    },


    /**
     * Timer namespace, contains function to display and update the call timer
     * @namespace
     */
     timer: {
        /**
         * function to format time from milliseconds into minutes and seconds
         * @param {number} callTimeElapsed - the call duration in milliseconds
         */
        formatCallTime: function (callTimeElapsed) {
            var callTimeSeconds = Math.floor(callTimeElapsed / 1000);

            var seconds = callTimeSeconds % 60;
            var minutes = (callTimeSeconds - seconds) / 60;

            return webRTCCore.timer.pad(minutes) + ":" + webRTCCore.timer.pad(seconds);
        },
        /**
         * function to add leading zeros to a number
         * @param {number} number - the number add leading zeros too
         */
        pad: function (number) {
            return ('00' + number).slice(-2);
        },
        /**
         * function to replace javascript setInterval()
         * @param {function} func - the function to execute
         * @param {number} delay - the delay in milliseconds between execution of the function
         */
        setCorrectingInterval: function (func, delay) {
            if (!(this instanceof webRTCCore.timer.setCorrectingInterval)) {
                return new webRTCCore.timer.setCorrectingInterval(func, delay);
            }

            var timeout;
            var timeoutTick;
            var target = (new Date().valueOf()) + delay;
            var that = this;

            function tick() {
                if (that.stopped) return;

                target += delay;
                func();

                timeoutTick = setTimeout(tick, target - (new Date().valueOf()));
            }

            $.subscribe('timer.stop', function () {
                clearTimeout(timeout);
                clearTimeout(timeoutTick);
            });

            timeout = setTimeout(tick, delay);
        }
    }
};