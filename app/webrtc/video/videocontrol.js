/**
 * Copyright Avaya Inc.
 * All rights reserved. Usage of this source is bound to the terms described in
 * the file Avaya SDK EULA.pdf, included in this SDK.
 * Avaya – Confidential & Proprietary. Use pursuant to your signed agreement or Avaya Policy.
 */
/**
 * videoControl object contains functions to work with the webrtc video interaction
 * @class
 */
(function () {

    var serviceAvailable = false;
    var active = false;
    var clientInstance;
    var work;   
    var videoInteraction;
    var _timerInterval;
    var _config;
    var _workRequest;
    var _optional;

    var API = {
        start: start,
        end: end
    };

    /**
     * function to initiate a video call
     * @public
     * @param clientDevice
     */
    function start(clientDevice, config, workRequest, optional) {
        try {
            if (active) {
                console.error("Video call already active");
                $.publish('ui.toast', [{ message: messageConfig.VideoCallAlreadyActive, timeout: 5000 }]);
                return false;
            }
            work = webRTCCore.initialiseClient(config, workRequest);

            var authTokenRequest = auth.getToken(function () {
                _createVideoInteraction(optional);

                if (videoInteraction && !active) {
                    videoInteraction.getVideoDevice().withCameraCaptureResolution(clientDevice.cameraCaptureResolution)
                        .withLocalView(clientDevice.localView)
                        .withRemoteView(clientDevice.remoteView);

                    // TODO: temp for testing media operations before start, also test with enableVideo invoked before mute
                    // videoInteraction.muteAudio(true);
                    // videoInteraction.muteVideo(true);
                    // videoInteraction.enableVideo(false);
                    videoInteraction.start();
                } else {
                    console.error('Reference Client: error starting Video call');
                    if (!videoInteraction) {
                        console.error(" - video interaction not available");
                    }
                    $.publish('ui.toast', [{ message: messageConfig.ErrorStartingVideoCall, timeout: 5000 }]);
                    $.publish('ui.video.close');
                    return false;
                }
            });
        } catch (err) {
            console.error(err);
            $.publish('ui.interaction.error', [{ message: messageConfig.ErrorStartingVideoCall, timeout: 5000 }]);
            $.publish('ui.client.state', [{ state: messageConfig.StartupError }]);
            serviceAvailable = false;
            return false;
        }

        return true;
    }

    /**
     * function to end a active video interaction
     * @public
     */
    function end() {
        _end();
    }

    function _toggleMuteAudio() {
        console.info('Reference Client: toggling audio mute');
        videoInteraction.muteAudio(!videoInteraction.isAudioMuted());
    }
    function _toggleHoldCall() {
        console.info('Reference Client: toggling call hold');
        videoInteraction.holdCall(!videoInteraction.isCallHeld());
    }

    function _toggleMuteVideo() {
        console.info('Reference Client: toggling mute video');
        videoInteraction.muteVideo(!videoInteraction.isVideoMuted());
    }

    function _toggleEnableVideo() {
        videoInteraction.enableVideo(!videoInteraction.isVideoEnabled());
    }

    function _sendDTMF(event, data) {
        console.info('Reference Client: sending DTMF: ' + data.tone);
        videoInteraction.sendDTMF(data.tone);
    }

    function _end() {
        console.info('Reference Client: ending interaction');
        if (serviceAvailable && videoInteraction && active) {
            videoInteraction.end();
        } else {
            console.error('Reference Client: error ending Video call');
            $.publish('ui.toast', [{ message: messageConfig.ErrorEndingVideoCall, timeout: 5000 }]);
        }
    }

    function _readAudioVideoDetails() {
        this._timerInterval = setInterval(function(){
            _readCallDetails();
        }.bind(this), 5000);
    }
    function _readCallDetails() {
        if (videoInteraction) {
            videoInteraction.readAudioDetails(function (audioDetails) {
                console.debug("Reference Client: Retrieved audio details");
                console.info(audioDetails);
               
                $.publish('video.interaction.event.audioDetails', [{
                  
                    packetsTransmitted: '' + audioDetails.packetsTransmitted,
                    packetsReceived: '' + audioDetails.packetsReceived, bytesTransmitted: '' + audioDetails.bytesTransmitted, bytesReceived: '' + audioDetails.bytesReceived,
                    lossLocal: '' + audioDetails.packetLossTotalTransmitted, lossRemote: '' + audioDetails.packetLossTotalReceived, jitterLocal: '' + '',//Todo  Value not received from internal API
                    jitterRemote: '' + audioDetails.averageJitterReceivedMillis, packetLoss: '' + audioDetails.fractionLostLocal

                }]);


            });

            videoInteraction.readVideoDetails(function (videoDetails) {
                console.debug("Reference Client: Retrieved video details");
                console.info(videoDetails);
         
                $.publish('video.interaction.event.videoDetails', [{
                    
                    packetsTransmitted: '' + videoDetails.videoTransmitStatistics.packetCount,  packetsReceived: '' + videoDetails.videoReceiveStatistics.packetCount ,
                    bytesTransmitted: '' + videoDetails.videoTransmitStatistics.byteCount, bytesReceived: '' + videoDetails.videoReceiveStatistics.byteCount,
                    lossRemote: '' + videoDetails.videoReceiveStatistics.packetLossTotal, lossRemoteFraction: videoDetails.videoReceiveStatistics.packetLossFraction,
                    jitterLocal: '' + '', jitterRemote: '' + videoDetails.jitterMillisecondsReceived

                }]);
            });
        }
    }

    /**
     * Function to stop the Call statistics reading
     */
    function _stopReadAudioVideoDetails() {
        clearInterval(this._timerInterval);
    }   

    /**
     * create a video interaction from the work object
     * @private
     */
    function _createVideoInteraction(optional) {
        if (work) {
            work.setContext(optional.context);
            work.setTopic(optional.topic);
            videoInteraction = work.createVideoInteraction(localStorage.getItem('client.platform'));
            //disableVideoInLowBandwidht params - True/false , Call Quality Threshold , Time to wait for disabling video after reaching on threshold
            //videoInteraction.disableVideoInLowBandwidth(true, OceanaCustomerWebVoiceVideo.Services.Devices.CallQuality.FAIR, 10000);

            //crate api ---

            if (videoInteraction) {
                // listen for audio interaction events from the client application
                $.subscribe('video.interaction.muteAudio', _toggleMuteAudio);
                $.subscribe('video.interaction.muteVideo', _toggleMuteVideo);
                $.subscribe('video.interaction.enableVideo', _toggleEnableVideo);
                $.subscribe('video.interaction.dtmf', _sendDTMF);
                $.subscribe('video.interaction.end', _end);
                $.subscribe('video.interaction.readAudioVideoDetails', _readAudioVideoDetails);
                $.subscribe('video.interaction.stopReadAudioVideoDetails', _stopReadAudioVideoDetails);
                $.subscribe('video.interaction.holdCall', _toggleHoldCall);

                // register for audio interaction callbacks
                videoInteraction.addOnVideoInteractionInitiatingCallback(function () {
                    active = true;
                    console.info('Reference Client: INITIATING!!!');
                    var state = webRTCCore.convertInteractionState(videoInteraction.getInteractionState());
                    $.publish('video.interaction.event.statechange', [{ state: state }]);
                });
                videoInteraction.addOnVideoInteractionRemoteAlertingCallback(function () {
                    console.info('Reference Client: REMOTE_ALERTING!!!');
                    var state = webRTCCore.convertInteractionState(videoInteraction.getInteractionState());
                    $.publish('video.interaction.event.statechange', [{ state: state }]);
                    webRTCCore.timer.setCorrectingInterval(function () {
                        var interactionTime = videoInteraction.getInteractionTimeElapsed();
                        $.publish('video.interaction.event.duration', [{ time: webRTCCore.timer.formatCallTime(interactionTime) }])
                    }, 500);
                });
                videoInteraction.addOnVideoInteractionCallQualityCallback(function (callQuality){
                    console.info('Reference Client: Call quality!!!!!!!!  '+callQuality);
                    $.publish('ui.video.callQuality', [callQuality]);
                });
                videoInteraction.addOnVideoInteractionActiveCallback(function () {
                    console.info('Reference Client: ESTABLISHED!!!');
                    var state = webRTCCore.convertInteractionState(videoInteraction.getInteractionState());
                    $.publish('video.interaction.event.statechange', [{ state: state }]);
                });
                videoInteraction.addOnVideoInteractionEndedCallback(function () {
                    active = false;
                    console.info('Reference Client: INTERACTION_ENDED!!!');
                    var state = webRTCCore.convertInteractionState(videoInteraction.getInteractionState());
                    $.publish('video.interaction.event.statechange', [{ state: state }]);
                    $.publish('timer.stop', []);
                    $.publish('ui.video.close');
                });
                videoInteraction.addOnVideoInteractionFailedCallback(function (data) {
                    active = false;
                    console.info('Reference Client: INTERACTION_FAILED!!!');
                    console.error('error: ' + data.reason);
                    var state = webRTCCore.convertInteractionState(videoInteraction.getInteractionState());
                    $.publish('video.interaction.event.statechange', [{ state: state }]);
                    $.publish('ui.interaction.error', [{ message: messageConfig.InteractionFailed + data.reason, timeout: 5000 }]);
                });

                videoInteraction.addOnVideoInteractionAudioMuteStatusChangedCallback(function (state) {
                    console.info('Reference Client: audio mute state change [' + state + ']');
                    $.publish('ui.video.buttonchange', [{ buttonId: '#webrtc_video_muteAudio', active: state }]);
                });
                videoInteraction.addOnVideoInteractionVideoMuteStatusChangedCallback(function (state) {
                    console.info('Reference Client: video mute state change [' + state + ']');
                    $.publish('ui.video.buttonchange', [{ buttonId: '#webrtc_video_muteVideo', active: state }]);
                });
                videoInteraction.addOnVideoInteractionVideoEnabledStatusChangedCallback(function (state) {
                    console.info('Reference Client: video enabled state change [' + state + ']');
                    $.publish('ui.video.buttonchange', [{ buttonId: '#webrtc_video_enableVideo', active: !state }]);
                    $.publish('ui.video.update', [{ enabled: state }]);
                });
                videoInteraction.addOnVideoInteractionHoldStatusChangedCallback(function (state) {
                    console.info('Reference Client: Hold state change [' + state + ']');
                    $.publish('ui.video.buttonchange', [{ buttonId: '#webrtc_video_holdCall', active: state }]);
                    state = webRTCCore.convertInteractionState(videoInteraction.getInteractionState());
                    $.publish('video.interaction.event.statechange', [{ state: state }]);
                });
                videoInteraction.addOnVideoInteractionServiceConnectedCallback(function () {
                    console.log('Reference Client: VIDEO SERVICE [connected]');
                    $.publish('ui.client.state', [{ state: messageConfig.Connected }]);
                    // FIME: Shuffling around this code has broken this, as the calback never fires now and you can't make cals`
                    serviceAvailable = true;
                });
                videoInteraction.addOnVideoInteractionServiceConnectingCallback(function () {
                    console.log('Reference Client: VIDEO SERVICE [connecting]');
                    $.publish('ui.client.state', [{ state: messageConfig.Connecting }]);
                    serviceAvailable = false;
                });
                videoInteraction.addOnVideoInteractionServiceDisconnectedCallback(function () {
                    console.log('Reference Client: VIDEO SERVICE [disconnected]');
                    $.publish('ui.client.state', [{ state: messageConfig.Disconnected }]);
                    serviceAvailable = false;
                });              

                var destination = optional.destinationAddress;

                if (destination) {
                    videoInteraction.setDestinationAddress(destination);
                }
                videoInteraction.setContextId(optional.context);
                videoInteraction.setPlatformType(localStorage.getItem('client.platform'));

                videoInteraction.setAuthorizationToken(localStorage.getItem('client.authToken'));
            } else {
                console.error('Reference Client: error creating video interaction');
                $.publish('ui.video.close');
            }

        } else {
            throw 'Reference Client: no work instance exists please create a work instance with createWork()';
        }
    }

    window.VIDEO = API;

}());