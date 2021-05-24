/**
 * Copyright Avaya Inc.
 * All rights reserved. Usage of this source is bound to the terms described in
 * the file Avaya SDK EULA.pdf, included in this SDK.
 * Avaya – Confidential & Proprietary. Use pursuant to your signed agreement or Avaya Policy.
 */
/**
 * settings namespace, manages client and routable attribute settings for the Oceana reference client application.
 * @namespace
 */
var settingsElite = {
  
    /**
     * loads the persisted the reference client settings from local storage 
     * into the settings form tabs
     */
    load: function () {
        this.initListeners();
        this.loadConfig();
        this.loadWorkRequest();
        console.info('Reference Client: settings have been successfully loaded');
    },
    /**
     * persist the reference client settings to local storage
     * for use by the Oceana Customer Services SDK
     */
    save: function () {
        if (this.saveConfig() && this.saveWorkRequest()) {
            console.info('Reference Client: settings have been successfully saved');

            ui.showSnackbar(messageConfig.Settings_saved, 6000, messageConfig.Home, function () {
                utils.openHome();
            });
        } else {
            console.log('Error saving settings');
        }
    },
    /**
     * Settings cancel button event handler
     * returns the customer to the initial reference client screen
     */
    cancel: function () {
        utils.openHome();
    },

    initListeners: function(){
        $('#home_menu_item').on('click', function (event) {
            utils.openHome();
        });
    },
    /**
     * load the customer config object from local storage into the config form
     */
    loadConfig: function () {
        var aawgConfigString = localStorage.getItem('elite.aawg.config');
        var customerString = localStorage.getItem('elite.customer');
        var optionalString = localStorage.getItem('elite.optional');
        var tokenConfigString = localStorage.getItem('elite.token.config');

        if (aawgConfigString) {
            var config = JSON.parse(aawgConfigString);
            $('#aawgServerTf').val(config.webGatewayAddress);

            if (config.port) {
                $('#aawgPortTf').val(config.port);
            }

            if (config.secure !== undefined) {
                $('#aawgSecureCb').prop('checked', config.secure);
            }
        } else {
            $('#aawgPortTf').val(utils.getDefaultAAWGPort());
        }
       

        if (customerString) {
            var customer = JSON.parse(customerString);
            $('#displayNameTf').val(customer.displayName);
            $('#fromTf').val(customer.fromAddress);
        } else {
            var fromAddress = Math.floor(Math.random() * 899999) + 100000;
            $('#displayNameTf').val(messageConfig.UserHyphen + fromAddress);
            $('#fromTf').val(fromAddress);
        }

        if (optionalString) {
            var optional = JSON.parse(optionalString);
            $('#destinationTf').val(optional.destinationAddress);
            $('#contextTf').val(optional.context);
            $('#topicTf').val(optional.topic);
        }

        if (tokenConfigString) {
            var tokenConfig = JSON.parse(tokenConfigString);
            $('#tokenServerTf').val(tokenConfig.tokenServiceAddress);
            $('#tokenPortTf').val(tokenConfig.port);
            if (tokenConfig.secure !== undefined) {
                $('#tokenSecureCb').prop('checked', tokenConfig.secure);
            }

            $('#tokenUrlPathTf').val(tokenConfig.urlPath);
        } else {
            // Default values
            $('#tokenPortTf').val(utils.getDefaultAAWGPort());
            $('#tokenUrlPathTf').val('token-generation-service/token/getEncryptedToken');
        }
    },
    /**
     * save the customer config object to local storage from the values in the config form
     */
    saveConfig: function () {
    
        var displayName = $('#displayNameTf').val().trim();
        var fromAddress = $('#fromTf').val().trim();
        var destinationAddress = $('#destinationTf').val().trim();
        var context = $('#contextTf').val().trim();
        var aawgServer = $('#aawgServerTf').val().trim();
        var aawgPort = $('#aawgPortTf').val().trim();
        var aawgSecure = $('#aawgSecureCb').is(":checked");
        var topic = $('#topicTf').val().trim();

        var tokenServer = $('#tokenServerTf').val().trim();
        var tokenPort = $('#tokenPortTf').val().trim();
        var tokenUrlPath = $('#tokenUrlPathTf').val().trim();
        var tokenSecure = $('#tokenSecureCb').is(":checked")

     

        var aawgConfig = {
            webGatewayAddress: aawgServer,
            port: aawgPort,
            secure: aawgSecure
        };

        var customer = {
            displayName: displayName,
            fromAddress: fromAddress,
        };

        var optional = {
            destinationAddress: destinationAddress,
            context: context,
            topic: topic
        };

        var tokenService = {
            tokenServiceAddress: tokenServer,
            port: tokenPort,
            urlPath: tokenUrlPath,
            secure: tokenSecure
        }

        localStorage.setItem('elite.aawg.config', JSON.stringify(aawgConfig));
        localStorage.setItem('elite.customer', JSON.stringify(customer));
        localStorage.setItem('elite.optional', JSON.stringify(optional));
        localStorage.setItem('elite.token.config', JSON.stringify(tokenService));
        return true;

    },
    /**
     * load the work request object from local storage
     */
    loadWorkRequest: function () {
        var workRequestString = localStorage.getItem('elite.workRequest');

        if (workRequestString) {
            var workRequest = JSON.parse(workRequestString);
            $('#priorityTf').val(workRequest.priority);
            $('#localeTf').val(workRequest.locale);
            $('#strategyTf').val(workRequest.strategy);

            $('#sourceNameTf').val(workRequest.sourceName);
            $('#nativeResourceIdTf').val(workRequest.nativeResourceId);
        }

       
    },
    /**
     * save the work request attribute object to local storage
     * @return {boolean}
     */
    saveWorkRequest: function () {
        var priority = $('#priorityTf').val().trim();
        var locale = $('#localeTf').val().trim();
        var strategy = $('#strategyTf').val().trim();
        var sourceName = $('#sourceNameTf').val().trim();
        var nativeResourceId = $('#nativeResourceIdTf').val().trim();

        var workRequest = {
            priority: priority,
            locale: locale,
            strategy: strategy,
            sourceName: sourceName,
            nativeResourceId: nativeResourceId
        };
        localStorage.setItem('elite.workRequest', JSON.stringify(workRequest));
        return true;
    },
    /**
     * retrieve the customer provided identity object from local storage
     * @return {object} customer
     */
    retrieveIdentity: function () {
        return JSON.parse(localStorage.getItem('elite.customer'));
    },
    /**
     * retrieve the optional customer provided object from local storage
     * @return {object} optional
     */
    retrieveOptionalParams: function () {
        return JSON.parse(localStorage.getItem('elite.optional'));
    },
    /**
     * retrieve the customer provided AAWG config object from local storage
     * @return {object} configuration
     */
    retrieveConfig: function () {
        var webGatewayConfig = JSON.parse(localStorage.getItem('elite.aawg.config'));

        var config = undefined;

        if (webGatewayConfig) {
            config = {
                webGatewayConfiguration: webGatewayConfig
            }
        }
        return config;
    },
    /**
     * retrieve the work request object from local storage
     * @return {object} attributes
     */
    retrieveWorkRequest: function () {
        return JSON.parse(localStorage.getItem('elite.workRequest'));
    },
    /**
     * retrieve the aawg config object from local storage
     * @return {object} configuration
     */
    retrieveAawgConfig: function () {
        return JSON.parse(localStorage.getItem('elite.aawg.config'));
    },
    /**
     * retrieve the token service config object from local storage
     * @return {object} tokenServiceConfiguration
     */
    retrieveTokenServiceConfig: function () {
        return JSON.parse(localStorage.getItem('elite.token.config'));
    },
    /**
     * clears customer settings objects from local storage
     */
    clearSettingsStore: function () {
        localStorage.removeItem('elite.aawg.config');
        localStorage.removeItem('elite.customer');
        localStorage.removeItem('elite.workRequest');
        localStorage.removeItem('elite.token.config');
    }
};
