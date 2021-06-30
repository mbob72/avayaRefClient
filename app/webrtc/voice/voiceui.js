/**
 * Copyright Avaya Inc.
 * All rights reserved. Usage of this source is bound to the terms described in
 * the file Avaya SDK EULA.pdf, included in this SDK.
 * Avaya – Confidential & Proprietary. Use pursuant to your signed agreement or Avaya Policy.
 */
/**
 * voiceUi object contains functions to work with the WebRTC voice interaction UI
 * @class
 */
(function (window, $) {




    var voiceUi = {
        isDtmfPadOpen: false,
        /**
         * show the voice caller and make it draggable
         * @param {number} x - the x coordinate
         * @param {number} y - the y coordinate
         */
        openWindow: function (x, y) {
            voiceUi.initInterface();
            // add subscribers to listen for UI interactions
            $.subscribe('ui.voice.buttonchange', function (event, data) {
                if (data.active) {
                    voiceUi.deactivateButton(data.buttonId);
                } else {
                    voiceUi.activateButton(data.buttonId);
                }
            });

            $.subscribe('ui.voice.callQuality', function (event, data) {
                videoUi.updateCallQuality(data);
            });

            $.subscribe('ui.voice.close', function () {
                voiceUi.closeWindow()
            });

            var modal = document.getElementById("modalStats");

            $('#close_button').on('click', function () {
                modal.style.display = "none";
                $.publish('voice.interaction.stopReadAudioDetails');
                voiceUi.clearStats();//Clear values from screenround

            });

            // add event handlers
            $('#call_statistics').on('click', function () {
                $.publish('voice.interaction.readAudioDetails');
                modal.style.display = "block";
                $('#videoStatsTab').removeClass('is-active');
                $('#tab2-panel').removeClass('is-active');
                $('#audioStatsTab').addClass('is-active');
                $('#tab1-panel').addClass('is-active');
                $('#videoStatsTab').hide();

            });



            $('#webrtc_dtmf').on('click', function () {
                console.debug('dtmf pressed');
                voiceUi.toggleDtmfPad();
            });
            $('ul.dtmf-interface li[name=dtmfKey]').on('click', function (e) {
                e.preventDefault();
                var key = $(this).attr("key");
                console.debug('sending dtmf key: ' + key);
                $.publish('voice.interaction.dtmf', [{ tone: key }]);
            });
            $('#webrtc_muteAudio').on('click', function () {
                console.debug('mute pressed');
                $.publish('voice.interaction.mute');
            });
            $('#webrtc_end').on('click', function () {
                console.debug('end pressed');
                $.publish('voice.interaction.end');
            });

            $('#webrtc_voice_holdCall').on('click', function () {
                console.debug('Hold pressed');
                $.publish('voice.interaction.holdCall');
            });



            $.subscribe('voice.interaction.event.statechange', function (event, data) {
                voiceUi.setCallStatus(data.state)
            });

            $.subscribe('voice.interaction.event.duration', function (event, data) {
                voiceUi.updateCallTimer(data.time);
            });
            $.subscribe('voice.interaction.event.audioDetails', function (event, audioDetails) {
                voiceUi.updateAudioDetails(audioDetails);
            });

            if (x < 140) {
                x = 140;
            }
            if (y < 10) {
                y = 10;
            }

            $('#webrtc_voice_container').css({ top: y + 30, left: x - 140 });
            $('#webrtc_voice_container').show();
            $("#webrtc_voice_container").draggable({
                containment: '#mainArea',
                cursor: 'move'
            });

            ui.toogleCallButtons(false);
            //Following code has been added because the MDL menu does not upgrade the Dom at runtime on Firefox and Edge to show up the drop down for Call Statistics popup
            componentHandler.upgradeDom();
        },

        /**
         * Initializes the user interface parameters
         */
        initInterface: function () {
            $("#1").text(messageConfig.One);
            $("#2").text(messageConfig.Two);
            $("#3").text(messageConfig.Three);
            $("#4").text(messageConfig.Four);
            $("#5").text(messageConfig.Five);
            $("#6").text(messageConfig.Six);
            $("#7").text(messageConfig.Seven);
            $("#8").text(messageConfig.Eight);
            $("#9").text(messageConfig.Nine);
            $("#0").text(messageConfig.Zero);
            $("#10").text(messageConfig.Star);
            $("#11").text(messageConfig.Hash);
            $("#call_statistics").text(messageConfig.CallStatistics);

        },
        /**
         * hides the voice caller
         */
        closeWindow: function () {
            // remove event handlers
            $('#webrtc_muteAudio').off();
            $('#webrtc_dtmf').off();
            $('ul.dtmf-interface li[name=dtmfKey]').off();
            $('#webrtc_end').off();
            $('#webrtc_voice_holdCall').off();


            voiceUi.resetView();

            // ensure subscribers are removed
            $.unsubscribe('voice.interaction.event');
            $.unsubscribe('ui.voice');
            ui.toogleCallButtons(true);
            $.publish('video.interaction.stopReadAudioDetails');
            var modal = document.getElementById("modalStats");
            modal.style.display = "none";

        },
        /**
         * set a button active
         * @param buttonId - the button to set active
         */
        activateButton: function (buttonId) {
            $(buttonId).addClass('webrtc-white');
            $(buttonId).removeClass('webrtc-silver');

            if (buttonId === '#webrtc_muteAudio')
                $('#mic').attr('src', 'app/images/ic_activecall_mute.png');

            else if (buttonId === '#webrtc_voice_holdCall')
                $('#hold').attr('src', 'app/images/ic_activecall_advctrl_hold.png');

        },
        /**
         * set a button de-active
         * @param buttonId - the button to deactivate
         */
        deactivateButton: function (buttonId) {
            $(buttonId).addClass('webrtc-silver');
            $(buttonId).removeClass('webrtc-white');

            if (buttonId === '#webrtc_muteAudio')
                $('#mic').attr('src', 'app/images/ic_activecall_mute_active.png');
            else if (buttonId === '#webrtc_voice_holdCall')
                $('#hold').attr('src', 'app/images/ic_activecall_advctrl_hold_active.png');

        },
        updateCallQuality: function (data) {

            if (data == OceanaCustomerWebVoiceVideo.Services.Devices.CallQuality.EXCELLENT) {
                callQualityRatingResource = 'app/images/ic_networkquality_5.png';
            } else if (data == OceanaCustomerWebVoiceVideo.Services.Devices.CallQuality.GOOD) {
                callQualityRatingResource = 'app/images/ic_networkquality_4.png';
            } else if (data == OceanaCustomerWebVoiceVideo.Services.Devices.CallQuality.FAIR) {
                callQualityRatingResource = 'app/images/ic_networkquality_3.png';
            } else if (data == OceanaCustomerWebVoiceVideo.Services.Devices.CallQuality.POOR) {
                callQualityRatingResource = 'app/images/ic_networkquality_2.png';
            } else if (data == OceanaCustomerWebVoiceVideo.Services.Devices.CallQuality.BAD) {
                callQualityRatingResource = 'app/images/ic_networkquality_1.png';
            } else {
                callQualityRatingResource = 'app/images/ic_networkquality_0.png';
            }

            $('#img_callQuality').attr('src', callQualityRatingResource);
        },
        /**
         * function to reset voice caller view
         */
        resetView: function () {
            // reset view and ensure dtmf pad is closed
            $('#webrtc_voice_container').hide();
            voiceUi.activateButton('#webrtc_muteAudio');
            $('#webrtc_status').text('');
            voiceUi.updateCallTimer('');
            voiceUi.closeDtmfPad();
            voiceUi.activateButton('#webrtc_voice_holdCall');
        },
        /**
         * updates the textual call status
         * @param status - the new state
         */
        setCallStatus: function (status) {
            $('#webrtc_status').text('' + status);
        },
        /**
         * helper function to update the call duration
         * @param time - the new duration
         */
        updateCallTimer: function (time) {
            $('#webrtc_duration').text('' + time);
        },
        /**
         * open/close the DTMF keypad
         */
        toggleDtmfPad: function () {
            if (voiceUi.isDtmfPadOpen) {
                voiceUi.closeDtmfPad();
                $('#dtmf').attr('src', 'app/images/ic_activecall_dtmf.png');
            } else {
                $('.dtmf-interface').show();
                voiceUi.isDtmfPadOpen = true;
                $('#dtmf').attr('src', 'app/images/ic_activecall_dtmf_active.png');

            }
        },
        /**
         * close the DTMF keypad
         */
        closeDtmfPad: function () {
            $('.dtmf-interface').hide();
            voiceUi.isDtmfPadOpen = false;
        },
        updateAudioDetails(audioDetails) {
            $('#idPacketsSentReceivedValue').text(voiceUi.convertUndefinedToZero(audioDetails.packetsTransmitted) + ' / ' + voiceUi.convertUndefinedToZero(audioDetails.packetsReceived));
            $('#idBytesSentReceivedValue').text('' + voiceUi.convertUndefinedToZero(audioDetails.bytesTransmitted) + ' / ' + voiceUi.convertUndefinedToZero(audioDetails.bytesReceived));
            $('#idLossLocalRemoteValue').text(voiceUi.convertUndefinedToZero(audioDetails.lossRemote));
            $('#idJitterLocalRemoteValue').text(voiceUi.convertUndefinedToZero(audioDetails.jitterRemote) + ' ' + messageConfig.ms);

        },
        convertUndefinedToZero(value) {
            if (value === undefined || value === 'undefined')
                return 0;
            return value;
        },
        clearStats() {

            $('#idPacketsSentReceivedValue').text('');
            $('#idBytesSentReceivedValue').text('');
            $('#idLossLocalRemoteValue').text('');
            $('#idJitterLocalRemoteValue').text('');

        }


    };

    window.voiceUi = voiceUi;

}(window, jQuery));