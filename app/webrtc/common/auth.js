/**
 * Copyright Avaya Inc.
 * All rights reserved. Usage of this source is bound to the terms described in
 * the file Avaya SDK EULA.pdf, included in this SDK.
 * Avaya – Confidential & Proprietary. Use pursuant to your signed agreement or Avaya Policy.
 */
/**
 * Auth class specific to webrtc, contains functions to get and delete a authorization token
 * @class
 */
var auth = {
    
    /**
     * function to make GET request to retrieve authorization token from sample token service hosted on the AAWG GW
     */
    getToken: function (callbackSuccessful) {
        var identity = utils.getSettings().retrieveIdentity();
        var tokenConfig = utils.getSettings().retrieveTokenServiceConfig();
        var optionalConfig = utils.getSettings().retrieveOptionalParams();


        if (tokenConfig) {
            var destinationAddress = optionalConfig.destinationAddress;

            if (tokenConfig.tokenServiceAddress && tokenConfig.port && identity.displayName && identity.fromAddress) {
                var protocol = 'https';
                if (tokenConfig.secure === false) {
                    protocol = 'http';
                }
                var url = protocol + '://' + tokenConfig.tokenServiceAddress + ':' + tokenConfig.port + '/' + tokenConfig.urlPath;

                var tokenRequest = {
                    use: "csaGuest",
                };

                if (destinationAddress) {
                    tokenRequest.calledNumber = destinationAddress;
                }

                if (identity.fromAddress) {
                    tokenRequest.callingNumber = identity.fromAddress;
                }

                if (identity.displayName) {
                    tokenRequest.displayName =identity.displayName;
                }

                tokenRequest.expiration = 120000;

                var tokenData = JSON.stringify(tokenRequest);

                console.info('Reference Client: fetching AAWG authorization token');
                $.ajax({
                    url: url,
                    type: 'POST',
                    data: tokenData,
                    processData: false,
                    contentType: 'application/json',
                    dataType: 'json',
                    timeout: 5000,
                    success: function (data) {
                        var token = data.encryptedToken;
                        console.log('Retrieved AAWG token: ' + token);
                        localStorage.setItem('client.authToken', token);
                        callbackSuccessful();
                    },
                    error: function (error) {
                        console.error('Reference Client: Error retrieving AAWG authorization token: ' + error.statusText);
                        $.publish('ui.client.state', [{state: messageConfig.AuthTokenError}]);
                        $.publish('ui.interaction.error', [{message: messageConfig.ErrorRetrievingAuthorizationToken + error.statusText, timeout: 5000}]);
                    }
                });

            } else {
                console.error('Reference Client: Invalid or missing settings provided');
                $.publish('ui.interaction.error', [{message: messageConfig.InvalidOrMissingSettings, timeout: 5000}]);
            }

        } else {
                console.error('Reference Client: Invalid or missing settings provided');
                $.publish('ui.interaction.error', [{message: messageConfig.InvalidOrMissingSettings, timeout: 5000}]);
        }

    }
};