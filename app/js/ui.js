/**
 * Copyright Avaya Inc.
 * All rights reserved. Usage of this source is bound to the terms described in
 * the file Avaya SDK EULA.pdf, included in this SDK.
 * Avaya – Confidential & Proprietary. Use pursuant to your signed agreement or Avaya Policy.
 */
/**
 * ui class, manages UI interactions for the Oceana reference client application
 * @class
 */
(function (window, $) {


    // add subscribers to listen for UI interactions
    $.subscribe('ui.toast', function (event, data) {
        ui.showSnackbar(data.message, data.timeout);
    });

    $.subscribe('ui.client.state', function (event, data) {
        ui.updateConnectionState(data.state);
    });

    $.subscribe('ui.interaction.error', function (event, data) {
        $.publish('ui.toast', data);
        $.publish('ui.video.close');
        $.publish('ui.voice.close');
        $.publish('timer.stop', []);
    });

    var ui = {
        /**
         * attach necessary event handlers to the UI
         */
        setupVoice: function () {
            webRTCSetup.setupVoiceCaller(_enableUI);
        },
        /**
         * attach necessary event handlers to the UI
         */
        setupVideo: function () {
            ui.interactionEventHandlers();
            ui.setClientVersion();

            webRTCSetup.setupVideoCaller(_enableUI);

            var resolution = localStorage.getItem('oceana.videoResolution');

            if (!resolution) {
                resolution = OceanaCustomerWebVoiceVideo.Services.Devices.CameraResolution.RESOLUTION_1280x720;
            }

            var spinner = $('#videoResolutionSpinner')[0];
            if (spinner) {
                for (let item in OceanaCustomerWebVoiceVideo.Services.Devices.CameraResolution) {
                    var option = document.createElement("option");
                    option.value = item;
                    var itemValue = OceanaCustomerWebVoiceVideo.Services.Devices.CameraResolution[item];
                    option.text = itemValue;
                    if (itemValue === resolution) {
                        option.selected = true;
                    }
                    spinner.add(option);
                }
            } else {
                console.log("No resolution spinner control found on page");
            }

            ui.setClientVersion();
        },
        /**
         * attach necessary event handlers to the settings UI
         */
        setupSettings: function () {
            ui.setClientVersion();
            ui.settingsEventHandlers();
        },
        /**
         * set the reference client version
         */
        setClientVersion: function () {
            $('#clientVersion').text(messageConfig.ClientVersion + messageConfig.version);
        },
        /**
         * toggle call button visibility
         */
        toogleCallButtons: function (show) {
            if (show) {
                $('#clickToCall').show();
                $('#videoResolution').show();
            } else {
                $('#clickToCall').hide();
                $('#videoResolution').hide();
            }
        },
        /**
         * attach menu event handlers to top nav-bar
         */
        interactionEventHandlers: function () {
            $('#modalPlatformChooser').on('click', function () {
                var modal = document.getElementById("modalPlatformChooser");
                modal.style.display = "none";
            });


            $('#settings_menu_item').on('click', function (event) {
                var modal = document.getElementById("modalPlatformChooser");
                modal.style.display = "block";
                var platform = localStorage.getItem('client.platform');
                if (platform === OceanaCustomerWebVoiceVideo.Services.Work.PlatformType.OCEANA) {
                    $("INPUT[name=radioPlatform]").val(['1']);

                } else {
                    $("INPUT[name=radioPlatform]").val(['2']);
                }
                //utils.openSettings();
            });
            $('#optionOceana').on('click', function () {
                localStorage.setItem('client.platform', OceanaCustomerWebVoiceVideo.Services.Work.PlatformType.OCEANA);
                utils.openSettings();
            });
            $('#optionElite').on('click', function () {
                localStorage.setItem('client.platform', OceanaCustomerWebVoiceVideo.Services.Work.PlatformType.ELITE);
                utils.openSettingsElite();
            });

            $('#voiceClickToCall').on('click', function (event) {
                console.info('Reference Client: attempting to make Web Voice call');
                ui.showSnackbar(messageConfig.WebVoiceClickToCall, 1000);
                var x = $(document).width() / 2;
                var y = $(document).height() / 4;
                voiceUi.openWindow(x, y);
                VOICE.start(utils.getSettings().retrieveConfig(), utils.getSettings().retrieveWorkRequest(), utils.getSettings().retrieveOptionalParams());

            });
            $('#videoClickToCall').on('click', function (event) {
                var resolution = OceanaCustomerWebVoiceVideo.Services.Devices.CameraResolution.RESOLUTION_1280x720;

                var spinner = $('#videoResolutionSpinner')[0];
                if (spinner) {
                    resolution = OceanaCustomerWebVoiceVideo.Services.Devices.CameraResolution[spinner.value];
                }

                var device = {
                    cameraCaptureResolution: resolution,
                    localView: 'videoOutbound',
                    remoteView: 'videoInbound'
                };

                console.info('Reference Client: attempting to make Video call');
                ui.showSnackbar(messageConfig.VideoClickToCall, 1000);
                var x = $(document).width() / 2;
                var y = $(document).height() / 4;
                videoUi.openWindow(x, y);
                VIDEO.start(device, utils.getSettings().retrieveConfig(), utils.getSettings().retrieveWorkRequest(), utils.getSettings().retrieveOptionalParams());

            });

            $('#videoResolutionSpinner').on('change', function (event) {
                var resolution = OceanaCustomerWebVoiceVideo.Services.Devices.CameraResolution[$('#videoResolutionSpinner')[0].value];
                localStorage.setItem('oceana.videoResolution', resolution);
            });



        },
        /**
         * attach settings screen event handlers
         */
        settingsEventHandlers: function () {
            $('#settingsCancelBtn').on('click', function () {
                utils.getSettings().cancel();

            });
            $('#settingsSaveBtn').on('click', function () {
                utils.getSettings().save();
            });
        },
        /**
         * shows a material design lite snackbar
         * @param {string} toast - the message to display
         * @param {number} timeout - how long to display the toast
         * @param {string} action - Optional: text to display as action button
         * @param {function} handler - Optional: the function to execute when the action button is clicked
         */
        showSnackbar: function (toast, timeout, action, handler) {
            var snackbarContainer = document.querySelector('.mdl-js-snackbar');
            var data = {
                message: toast,
                timeout: timeout,
                actionHandler: handler,
                actionText: action
            };
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
        },
        /**
         * display the client state in the application header
         * @param {String} state - client state to display
         */
        updateConnectionState: function (state) {
            $('.client-state').text(state);
        }
    };

    function _enableUI() {
        var platform = localStorage.getItem('client.platform');
        if (platform === null) {
            platform = OceanaCustomerWebVoiceVideo.Services.Work.PlatformType.OCEANA;
            //Set default platform type
            localStorage.setItem('client.platform', OceanaCustomerWebVoiceVideo.Services.Work.PlatformType.OCEANA);
        }
        //If Platform type is Oceana, check Oceana settings, else check Elite settings
        if (platform === OceanaCustomerWebVoiceVideo.Services.Work.PlatformType.OCEANA && _checkSettings() ||
            platform === OceanaCustomerWebVoiceVideo.Services.Work.PlatformType.ELITE && _checkSettingsElite()) {
            ui.toogleCallButtons(true);

        } else {
            ui.updateConnectionState(messageConfig.InvalidConfiguration);
        }
        var platform = localStorage.getItem('client.platform');
        if (platform === OceanaCustomerWebVoiceVideo.Services.Work.PlatformType.OCEANA) {
            document.getElementById("reference_client_title").innerHTML = "Oceana&trade; WebRTC<br />Reference Client";
        } else {
            document.getElementById("reference_client_title").innerHTML = "Elite&trade; WebRTC<br />Reference Client";
        }


    };

    function _checkSettings() {
        console.info('Reference Client: Checking configuration');

        if (!utils.getSettings()) {
            return false;
        }

        var config = utils.getSettings().retrieveConfig();
        var workRequest = utils.getSettings().retrieveWorkRequest();
        var tokenConfig = utils.getSettings().retrieveTokenServiceConfig();

        if (!(config) || !(workRequest) || !(tokenConfig)) {
            console.warn('Reference Client: Invalid configuration');
            return false;
        }

        if (!(config.webGatewayConfiguration) || !(config.webGatewayConfiguration.webGatewayAddress)) {
            console.warn('Reference Client: Invalid web gateway configuration');
            return false;
        }

        if (!(config.configuration) || !(config.configuration.restUrl)) {
            console.warn('Reference Client: Invalid AMC configurations');
            return false;
        }
        if ((!(workRequest.attributes) || workRequest.attributes.length == 0) && !(workRequest.nativeResourceId)) {
            console.warn('Reference Client: Invalid routing configuration');
            return false;
        }

        if ((!tokenConfig.tokenServiceAddress) || !(tokenConfig.urlPath)) {
            console.warn('Reference Client: Invalid token service configuration');
            return false;
        }

        return true;
    };
    function _checkSettingsElite() {
        console.info('Reference Client: Checking configuration');

        if (!utils.getSettings()) {
            return false;
        }

        var config = utils.getSettings().retrieveConfig();
        var workRequest = utils.getSettings().retrieveWorkRequest();
        var tokenConfig = utils.getSettings().retrieveTokenServiceConfig();

        if (!(config) || !(workRequest) || !(tokenConfig)) {
            console.warn('Reference Client: Invalid configuration');
            return false;
        }

        if (!(config.webGatewayConfiguration) || !(config.webGatewayConfiguration.webGatewayAddress)) {
            console.warn('Reference Client: Invalid web gateway configuration');
            return false;
        }

        if ((!tokenConfig.tokenServiceAddress) || !(tokenConfig.urlPath)) {
            console.warn('Reference Client: Invalid token service configuration');
            return false;
        }

        return true;
    }

    ui.MaterialUtils = class {

        static activateExpandableFAB() {
            const a = $('.mdl-button--fab-expandable');
            a.on('click', function () {
                $(this).toggleClass('is-active')
            })
        }
    };

    $(document).ready(() => {
        ui.MaterialUtils.activateExpandableFAB();
        document.title = messageConfig.AvayaWebRTCConnectSDKSample;
        $(".client-state").text(messageConfig.Ready);
        $("#settings_menu_item").text(messageConfig.Settings);       
        $(".resolution-field").text(messageConfig.AvailableVideoResolution);
        $("#idPlatformChoose").text(messageConfig.ChoosePlatform);
        $("#idOceanaRadio").text(messageConfig.Oceana);
        $("#idEliteRadio").text(messageConfig.Elite);
        $("#idCallStatistics").text(messageConfig.CallStatistics);
        $("#audioStatsTab").text(messageConfig.AudioStatistics);
        $("#videoStatsTab").text(messageConfig.VideoStatistics);
        $("#idPacketsSentReceivedKey").text(messageConfig.PacketsSentReceived);
        $("#idBytesSentReceivedKey").text(messageConfig.BytesSentReceived);
        $("#idLossLocalRemoteKey").text(messageConfig.PacketsLostTotal);
        $("#idJitterLocalRemoteKey").text(messageConfig.JitterRemote);
        $("#idHeaderReceive").text(messageConfig.Receive);
        $("#idBytesReceive").text(messageConfig.Bytes);
        $("#idPacketsReceive").text(messageConfig.Packets);
        $("#idPacketsLostReceiveKey").text(messageConfig.PacketsLost);
        $("#idHeaderSend").text(messageConfig.Send);
        $("#idBytesSend").text(messageConfig.Bytes);
        $("#idPacketsSend").text(messageConfig.Packets);
        $("#idFabAudio").text(messageConfig.StartAudio);
        $("#idFabVideo").text(messageConfig.StartVideo);
    });

    window.ui = ui;



}(window, jQuery));
