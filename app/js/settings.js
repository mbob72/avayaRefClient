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
var settings = {
    /**
     * variable to hold customer attributes
     */
    attributes: [
        { name: messageConfig.Location, values: messageConfig.Inhouse },
        { name: messageConfig.Language, values: messageConfig.English },
        { name: messageConfig.Service, values: messageConfig.Sales }
    ],
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
        var aawgConfigString = localStorage.getItem('oceana.aawg.config');
        var amcConfigString = localStorage.getItem('oceana.config');
        var customerString = localStorage.getItem('oceana.customer');
        var optionalString = localStorage.getItem('oceana.optional');
        var tokenConfigString = localStorage.getItem('oceana.token.config');

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
        if (amcConfigString) {
            var config = JSON.parse(amcConfigString);
            $('#serverTf').val(config.restUrl);

            if (config.urlPath) {
                $('#amcUrlPathTf').val(config.urlPath);
            }

            if (config.port) {
                $('#portTf').val(config.port);
            }
        } else {
            $('#portTf').val(utils.getDefaultPort());
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
        var amcServer = $('#serverTf').val().trim();
        var amcPort = $('#portTf').val().trim();
        var amcUrlPath = $('#amcUrlPathTf').val().trim();
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

        var config = {
            restUrl: amcServer,
            port: amcPort,
            secure: true,
            urlPath: amcUrlPath
        };

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

        localStorage.setItem('oceana.aawg.config', JSON.stringify(aawgConfig));
        localStorage.setItem('oceana.config', JSON.stringify(config));
        localStorage.setItem('oceana.customer', JSON.stringify(customer));
        localStorage.setItem('oceana.optional', JSON.stringify(optional));
        localStorage.setItem('oceana.token.config', JSON.stringify(tokenService));
        return true;

    },
    /**
     * load the work request object from local storage
     */
    loadWorkRequest: function () {
        var workRequestString = localStorage.getItem('oceana.workRequest');

        if (workRequestString) {
            var workRequest = JSON.parse(workRequestString);
            $('#priorityTf').val(workRequest.priority);
            $('#localeTf').val(workRequest.locale);
            $('#strategyTf').val(workRequest.strategy);
            this.attributes = workRequest.attributes;

            $('#sourceNameTf').val(workRequest.sourceName);
            $('#nativeResourceIdTf').val(workRequest.nativeResourceId);
        }

        // setup attribute grid
        $('#attributes-grid').jsGrid({
            width: '100%',
            height: '70%',

            inserting: true,
            editing: true,
            paging: true,

            confirmDeleting: false,
            updateOnResize: true,
            noDataContent: messageConfig.NoAttributesConfigured,
            data: this.attributes,

            fields: [
                { name: messageConfig.name, title: messageConfig.Name, type: 'text', width: 150, validate: 'required' },
                { name: messageConfig.values, title: messageConfig.Values, type: 'text', width: 150, validate: 'required' },
                { type: 'control' }
            ]
        });
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
            attributes: this.attributes,
            priority: priority,
            locale: locale,
            strategy: strategy,
            sourceName: sourceName,
            nativeResourceId: nativeResourceId
        };
        localStorage.setItem('oceana.workRequest', JSON.stringify(workRequest));
        return true;
    },
    /**
     * retrieve the customer provided identity object from local storage
     * @return {object} customer
     */
    retrieveIdentity: function () {
        return JSON.parse(localStorage.getItem('oceana.customer'));
    },
    /**
     * retrieve the optional customer provided object from local storage
     * @return {object} optional
     */
    retrieveOptionalParams: function () {
        return JSON.parse(localStorage.getItem('oceana.optional'));
    },
    /**
     * retrieve the customer provided amc config object from local storage
     * @return {object} configuration
     */
    retrieveConfig: function () {
        var oceanaConfig = JSON.parse(localStorage.getItem('oceana.config'));
        var webGatewayConfig = JSON.parse(localStorage.getItem('oceana.aawg.config'));

        var config = oceanaConfig;

        if (webGatewayConfig) {
            config = {
                configuration: oceanaConfig,
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
        return JSON.parse(localStorage.getItem('oceana.workRequest'));
    },
    /**
     * retrieve the aawg config object from local storage
     * @return {object} configuration
     */
    retrieveAawgConfig: function () {
        return JSON.parse(localStorage.getItem('oceana.aawg.config'));
    },
    /**
     * retrieve the token service config object from local storage
     * @return {object} tokenServiceConfiguration
     */
    retrieveTokenServiceConfig: function () {
        return JSON.parse(localStorage.getItem('oceana.token.config'));
    },
    /**
     * clears customer settings objects from local storage
     */
    clearSettingsStore: function () {
        localStorage.removeItem('oceana.aawg.config');
        localStorage.removeItem('oceana.config');
        localStorage.removeItem('oceana.customer');
        localStorage.removeItem('oceana.workRequest');
        localStorage.removeItem('oceana.token.config');
    }
};
