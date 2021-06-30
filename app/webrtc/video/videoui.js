/**
 * Copyright Avaya Inc.
 * All rights reserved. Usage of this source is bound to the terms described in
 * the file Avaya SDK EULA.pdf, included in this SDK.
 * Avaya – Confidential & Proprietary. Use pursuant to your signed agreement or Avaya Policy.
 */
/**
 * videoUi object contains functions to work with the WebRTC video interaction UI
 * @class
 */
(function (window, $) {




    var videoUi = {
        isDtmfPadOpen: false,
        /**
         * show the audio caller and make it draggable
         * @param {number} x - the x coordinate
         * @param {number} y - the y coordinate
         */
        openWindow: function (x, y) {
            videoUi.initInterface();

            // add subscribers to listen for UI interactions
            $.subscribe('ui.video.buttonchange', function (event, data) {
                if (data.active) {
                    videoUi.deactivateButton(data.buttonId);
                } else {
                    videoUi.activateButton(data.buttonId);
                }
            });

            $.subscribe('ui.video.update', function (event, data) {
                if (data.enabled) {
                    videoUi.showRemoteVideo();
                } else {
                    videoUi.hideRemoteVideo();
                }
            });

            $.subscribe('ui.video.callQuality', function (event, data) {
                videoUi.updateCallQuality(data);
            });

            $.subscribe('ui.video.close', function () {
                videoUi.closeWindow()
            });

            var modal = document.getElementById("modalStats");

            $('#close_button').on('click', function () {
                modal.style.display = "none";
                $.publish('video.interaction.stopReadAudioVideoDetails');
                videoUi.clearStats();//Clear values from screenround
            });

            // add event handlers
            $('#call_statistics_video').on('click', function () {
                $.publish('video.interaction.readAudioVideoDetails');
                modal.style.display = "block";
                $('#videoStatsTab').removeClass('is-active');
                $('#tab2-panel').removeClass('is-active');
                $('#audioStatsTab').addClass('is-active');
                $('#tab1-panel').addClass('is-active');
                $('#videoStatsTab').show();

            });

            $('#webrtc_video_dtmf').on('click', function () {
                console.debug('dtmf pressed');
                videoUi.toogleDtmfPad();
            });
            $('ul.dtmf-interface li[name=dtmfKey]').on('click', function (e) {
                e.preventDefault();
                var key = $(this).attr("key");
                console.debug('sending dtmf key: ' + key);
                $.publish('video.interaction.dtmf', [{ tone: key }]);
            });
            $('#webrtc_video_muteAudio').on('click', function () {
                console.debug('mute audio pressed');
                $.publish('video.interaction.muteAudio');
            });
            $('#webrtc_video_muteVideo').on('click', function () {
                console.debug('mute video pressed');
                $.publish('video.interaction.muteVideo');
            });
            $('#webrtc_video_enableVideo').on('click', function () {
                console.debug('enable video pressed');
                $.publish('video.interaction.enableVideo');
            });
            $('#webrtc_video_end').on('click', function () {
                console.debug('end pressed');
                $.publish('video.interaction.end');
            });

            $('#webrtc_video_holdCall').on('click', function () {
                console.debug('Hold pressed');
                $.publish('video.interaction.holdCall');
            });

            $.subscribe('video.interaction.event.statechange', function (event, data) {
                videoUi.setCallStatus(data.state)
            });

            $.subscribe('video.interaction.event.duration', function (event, data) {
                videoUi.updateCallTimer(data.time);
            });
            $.subscribe('video.interaction.event.audioDetails', function (event, audioDetails) {
                videoUi.updateAudioDetails(audioDetails);
            });
            $.subscribe('video.interaction.event.videoDetails', function (event, videoDetails) {
                videoUi.updateVideoDetails(videoDetails);
            });

            if (x < 140) {
                x = 140;
            }
            if (y < 10) {
                y = 10;
            }

            $('#webrtc_video_container').css({ top: y + 30, left: x - 140 });
            $('#webrtc_video_container').show();
            $("#webrtc_video_container").draggable({
                containment: '#mainArea',
                cursor: 'move'
            });
            window.ui.toogleCallButtons(false);
            //Following code has been added because the MDL menu does not upgrade the Dom at runtime on Firefox and Edge to show up the drop down for Call Statistics popup
            componentHandler.upgradeDom();
        },

        /**
         * Initializes the user interface parameters
         */
        initInterface: function () {
            $("#vi1").text(messageConfig.One);
            $("#vi2").text(messageConfig.Two);
            $("#vi3").text(messageConfig.Three);
            $("#vi4").text(messageConfig.Four);
            $("#vi5").text(messageConfig.Five);
            $("#vi6").text(messageConfig.Six);
            $("#vi7").text(messageConfig.Seven);
            $("#vi8").text(messageConfig.Eight);
            $("#vi9").text(messageConfig.Nine);
            $("#vi0").text(messageConfig.Zero);
            $("#vi10").text(messageConfig.Star);
            $("#vi11").text(messageConfig.Hash);
            $("#call_statistics_video").text(messageConfig.CallStatistics);

        },
        /**
         * hides the audio caller
         */
        closeWindow: function () {
            // remove event handlers
            console.debug('Close window');

            $('#webrtc_video_muteVideo').off();
            $('#webrtc_video_muteAudio').off();
            $('#webrtc_video_enableVideo').off();
            $('#webrtc_video_dtmf').off();
            $('ul.dtmf-interface li[name=dtmfKey]').off();

            $('#webrtc_video_end').off();
            $('#webrtc_video_holdCall').off();

            videoUi.resetView();

            // ensure subscribers are removed
            $.unsubscribe('video.interaction.event');
            $.unsubscribe('ui.video');
            ui.toogleCallButtons(true);
            $.publish('video.interaction.stopReadAudioVideoDetails');
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

            if (buttonId === '#webrtc_video_muteAudio')
                $('#mic_videocall').attr('src', 'app/images/ic_activecall_mute.png');

            else if (buttonId === '#webrtc_video_muteVideo')
                $('#muteUnmuteVideo').attr('src', 'app/images/ic_activecall_video_active.png');

            else if (buttonId === '#webrtc_video_enableVideo')
                $('#enableDisableVideo').attr('src', 'app/images/ic_videocall_selfview_blockcamera.png');

            else if (buttonId === '#webrtc_video_holdCall')
                $('#hold_videocall').attr('src', 'app/images/ic_activecall_advctrl_hold.png');

        },
        /**
         * set a button de-active
         * @param buttonId - the button to deactivate
         */
        deactivateButton: function (buttonId) {
            $(buttonId).addClass('webrtc-silver');
            $(buttonId).removeClass('webrtc-white');

            if (buttonId === '#webrtc_video_muteAudio')
                $('#mic_videocall').attr('src', 'app/images/ic_activecall_mute_active.png');

            else if (buttonId === '#webrtc_video_muteVideo')
                $('#muteUnmuteVideo').attr('src', 'app/images/ic_activecall_video.png');

            else if (buttonId === '#webrtc_video_enableVideo')
                $('#enableDisableVideo').attr('src', 'app/images/ic_videocall_selfview_blockcamera_active.png');

            else if (buttonId === '#webrtc_video_holdCall')
                $('#hold_videocall').attr('src', 'app/images/ic_activecall_advctrl_hold_active.png');


        },
        showRemoteVideo: function () {
            $('#videoInbound').show();
        },
        hideRemoteVideo: function () {
            $('#videoInbound').hide();
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
         * function to reset audio caller view
         */
        resetView: function () {
            // reset view and ensure dtmf pad is closed
            $('#webrtc_video_container').hide();
            videoUi.activateButton('#webrtc_video_muteAudio');
            videoUi.activateButton('#webrtc_video_muteVideo');
            videoUi.activateButton('#webrtc_video_enableVideo');
            videoUi.activateButton('#webrtc_video_holdCall');

            $('#webrtc_status').text('');
            videoUi.updateCallTimer('');
            videoUi.closeDtmfPad();

        },

        /**
         * updates the textual call status
         * @param status - the new state
         */
        setCallStatus: function (status) {
            $('#webrtc_video_status').text('' + status);
        },
        /**
         * helper function to update the call duration
         * @param time - the new duration
         */
        updateCallTimer: function (time) {
            $('#webrtc_video_duration').text('' + time);
        },
        /**
         * open/close the DTMF keypad
         */
        toogleDtmfPad: function () {
            if (videoUi.isDtmfPadOpen) {
                $('.dtmf-interface').hide();
                videoUi.closeDtmfPad();
                $('#dtmf_videocall').attr('src', 'app/images/ic_activecall_dtmf.png');
            } else {
                $('.dtmf-interface').show();
                videoUi.isDtmfPadOpen = true;
                $('#dtmf_videocall').attr('src', 'app/images/ic_activecall_dtmf_active.png');

            }
        },
        /**
         * close the DTMF keypad
         */
        closeDtmfPad: function () {
            $('.dtmf-interface').hide();
            videoUi.isDtmfPadOpen = false;
        },
        updateAudioDetails(audioDetails) {

            $('#idPacketsSentReceivedValue').text(videoUi.convertUndefinedToZero(audioDetails.packetsTransmitted) + ' / ' + videoUi.convertUndefinedToZero(audioDetails.packetsReceived));
            $('#idBytesSentReceivedValue').text('' + videoUi.convertUndefinedToZero(audioDetails.bytesTransmitted) + ' / ' + videoUi.convertUndefinedToZero(audioDetails.bytesReceived));
            $('#idLossLocalRemoteValue').text(videoUi.convertUndefinedToZero(audioDetails.lossRemote));
            $('#idJitterLocalRemoteValue').text(videoUi.convertUndefinedToZero(audioDetails.jitterRemote) + ' ' + messageConfig.ms);

        },
        updateVideoDetails(videoDetails) {

            //Receive
            $('#idBytesReceiveValue').text(videoUi.convertUndefinedToZero(videoDetails.bytesReceived));
            $('#idPacketsReceiveValue').text(videoUi.convertUndefinedToZero(videoDetails.packetsReceived));
            videoDetails.lossRemoteFraction = parseFloat(videoUi.convertUndefinedToZero(videoDetails.lossRemoteFraction)).toFixed(4);
            $('#idPacketsLostReceiveValue').text('' + videoUi.convertUndefinedToZero(videoDetails.lossRemote) + ' ' + messageConfig.packets + ', ' + videoUi.convertUndefinedToZero(videoDetails.lossRemoteFraction));

            //Send
            $('#idBytesSendValue').text(videoUi.convertUndefinedToZero(videoDetails.bytesTransmitted));
            $('#idPacketsSendValue').text(videoUi.convertUndefinedToZero(videoDetails.packetsTransmitted));

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
            //Receive
            $('#idBytesReceiveValue').text('');
            $('#idPacketsReceiveValue').text('');
            $('#idPacketsLostReceiveValue').text('');

            //Send
            $('#idBytesSendValue').text('');
            $('#idPacketsSendValue').text('');

        },


    };


    window.videoUi = videoUi;

}(window, jQuery));