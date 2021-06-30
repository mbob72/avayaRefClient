/**
 * Copyright Avaya Inc.
 * All rights reserved. Usage of this source is bound to the terms described in
 * the file Avaya SDK EULA.pdf, included in this SDK.
 * Avaya – Confidential & Proprietary. Use pursuant to your signed agreement or Avaya Policy.
 */
/**
 * voiceControl object contains functions to work with the Web Voice interaction
 * @class
 */
(function () {
    var serviceAvailable = false;
    var active = false;
    var clientInstance;
    var work;
    var audioInteraction;

    var API = {
        start: start,
        end: end
    };

    /**
     * function to initiate a voice call
     * @public
     */
    function start(config, workRequest, optional) {
        if (active) {
            console.error("Call already active");
            $.publish('ui.toast', [{ message: messageConfig.CallAlreadyActive, timeout: 5000 }]);
            return false;
        }

        work = webRTCCore.initialiseClient(config, workRequest);
        var authTokenRequest = auth.getToken(function () {
            _createAudioInteraction(optional);

            if (audioInteraction && !active) {
                audioInteraction.start();
            } else {
                console.error('Reference Client: error starting Web Voice call');
                $.publish('ui.interaction.error', [{ message: messageConfig.ErrorStartingWebVoiceCall, timeout: 5000 }]);
            }
        });

        return true;
    }

    /**
     * function to end a active voice interaction
     * @public
     */
    function end() {
        if (serviceAvailable && audioInteraction && active) {
            audioInteraction.end();
        } else {
            console.error('Reference Client: error ending Web Voice call');
            $.publish('ui.toast', [{ message: messageConfig.ErrorEndingWebVoiceCall, timeout: 5000 }]);
            $.publish('ui.video.close');
        }
    }

    function _toggleMuteAudio() {
        console.info('Reference Client: toggling audio mute');
        audioInteraction.muteAudio(!audioInteraction.isAudioMuted());
    }
    function _toggleHoldCall() {
        console.info('Reference Client: toggling call hold');
        audioInteraction.holdCall(!audioInteraction.isCallHeld());
    }
    function _sendDTMF(event, data) {
        console.info('Reference Client: sending DTMF: ' + data.tone);
        audioInteraction.sendDTMF(data.tone);
    }

    function _end() {
        console.info('Reference Client: ending interaction');
        audioInteraction.end();
    }
    function _readAudioDetails() {
        this._timerInterval = setInterval(function () {
            _readCallDetails();
        }.bind(this), 5000);
    }

    function _readCallDetails() {

        if (audioInteraction) {
            audioInteraction.readAudioDetails(function (audioDetails) {
                console.debug("Reference Client: Retrieved audio details");
                console.info(audioDetails);


                $.publish('voice.interaction.event.audioDetails', [{
                  
                    packetsTransmitted: '' + audioDetails.packetsTransmitted,
                    packetsReceived: '' + audioDetails.packetsReceived, bytesTransmitted: '' + audioDetails.bytesTransmitted, bytesReceived: '' + audioDetails.bytesReceived,
                    lossLocal: '' + audioDetails.packetLossTotalTransmitted, lossRemote: '' + audioDetails.packetLossTotalReceived, jitterLocal: '' + '', 
                    jitterRemote: '' + audioDetails.averageJitterReceivedMillis, packetLoss: '' + audioDetails.fractionLostLocal
                   }]);
            });
        }
    }

    /**
     * Function to stop the Call statistics reading
     */
    function _stopReadAudioDetails() {
        clearInterval(this._timerInterval);
    }


    /**
     * create a voice interaction from the work object
     * @private
     */
    function _createAudioInteraction(optional) {
        if (work) {
            work.setContext(optional.context);
            work.setTopic(optional.topic);
            audioInteraction = work.createAudioInteraction(localStorage.getItem('client.platform'));

            if (audioInteraction) {
                // listen for voice interaction events from the client application
                $.subscribe('voice.interaction.mute', _toggleMuteAudio);
                $.subscribe('voice.interaction.dtmf', _sendDTMF);
                $.subscribe('voice.interaction.end', _end);
                $.subscribe('voice.interaction.readAudioDetails', _readAudioDetails);
                $.subscribe('voice.interaction.stopReadAudioDetails', _stopReadAudioDetails);
                $.subscribe('voice.interaction.holdCall', _toggleHoldCall);

                // register for voice interaction callbacks
                audioInteraction.addOnAudioInteractionInitiatingCallback(function () {
                    active = true;
                    console.info('Reference Client: INITIATING!!!');
                    var state = webRTCCore.convertInteractionState(audioInteraction.getInteractionState());
                    $.publish('voice.interaction.event.statechange', [{ state: state }]);
                });
                audioInteraction.addOnAudioInteractionRemoteAlertingCallback(function () {
                    console.info('Reference Client: REMOTE_ALERTING!!!');
                    var state = webRTCCore.convertInteractionState(audioInteraction.getInteractionState());
                    $.publish('voice.interaction.event.statechange', [{ state: state }]);
                    webRTCCore.timer.setCorrectingInterval(function () {
                        var interactionTime = audioInteraction.getInteractionTimeElapsed();
                        $.publish('voice.interaction.event.duration', [{ time: webRTCCore.timer.formatCallTime(interactionTime) }])
                    }, 500);
                });
                audioInteraction.addOnAudioInteractionCallQualityCallback(function (callQuality){
                    console.info('Reference Client: Call quality!!!!!!!!  '+callQuality);
                    $.publish('ui.voice.callQuality', [callQuality]);
                });
                audioInteraction.addOnAudioInteractionActiveCallback(function () {
                    console.info('Reference Client: ESTABLISHED!!!');
                    var state = webRTCCore.convertInteractionState(audioInteraction.getInteractionState());
                    $.publish('voice.interaction.event.statechange', [{ state: state }])
                });
                audioInteraction.addOnAudioInteractionEndedCallback(function () {
                    active = false;
                    console.info('Reference Client: INTERACTION_ENDED!!!');
                    $.publish('timer.stop', []);
                    $.publish('ui.voice.close', []);
                    var state = webRTCCore.convertInteractionState(audioInteraction.getInteractionState());
                    $.publish('voice.interaction.event.statechange', [{ state: state }]);
                   
                });
                audioInteraction.addOnAudioInteractionFailedCallback(function (data) {
                    active = false;
                    console.info('Reference Client: INTERACTION_FAILED!!!');    
                    console.error('error: ' + data.reason);
                    var state = webRTCCore.convertInteractionState(audioInteraction.getInteractionState());
                    $.publish('voice.interaction.event.statechange', [{ state: state }]);
                    $.publish('ui.interaction.error', [{ message: messageConfig.InteractionFailed + data.reason, timeout: 5000 }]);
                });
                audioInteraction.addOnAudioInteractionAudioMuteStatusChangedCallback(function (state) {
                    console.info('Reference Client: Audio Mute state change [' + state + ']');
                    $.publish('ui.voice.buttonchange', [{ buttonId: '#webrtc_muteAudio', active: state }]);
                });
                audioInteraction.addOnAudioInteractionHoldStatusChangedCallback(function (state) {
                    console.info('Reference Client: Hold state change [' + state + ']');
                    $.publish('ui.voice.buttonchange', [{ buttonId: '#webrtc_voice_holdCall', active: state }]);
                    state = webRTCCore.convertInteractionState(audioInteraction.getInteractionState());
                    $.publish('voice.interaction.event.statechange', [{ state: state }])

                });

                audioInteraction.addOnAudioInteractionServiceConnectedCallback(function () {
                    console.log('Reference Client: AUDIO SERVICE [connected]');
                    $.publish('ui.client.state', [{ state: messageConfig.Connected }]);
                    serviceAvailable = true;
                });
                audioInteraction.addOnAudioInteractionServiceConnectingCallback(function () {
                    console.log('Reference Client: AUDIO SERVICE [connecting]');
                    $.publish('ui.client.state', [{ state: messageConfig.Connecting }]);
                    serviceAvailable = false;
                });
                audioInteraction.addOnAudioInteractionServiceDisconnectedCallback(function () {
                    console.log('Reference Client: AUDIO SERVICE [disconnected]');
                    $.publish('ui.client.state', [{ state: messageConfig.Disconnected }]);
                    serviceAvailable = false;
                });
                

                var destination = optional.destinationAddress;

                if (destination) {
                    audioInteraction.setDestinationAddress(destination);
                }
                audioInteraction.setContextId(optional.context);
                audioInteraction.setPlatformType(localStorage.getItem('client.platform'));

                audioInteraction.setAuthorizationToken(localStorage.getItem('client.authToken'));
            } else {
                console.error('Reference Client: error creating interaction');
                $.publish('ui.voice.close', []);
            }

        } else {
            throw 'Reference Client: no work instance exists please create a work instance with createWork()';
        }
    }

    window.VOICE = API;

}());