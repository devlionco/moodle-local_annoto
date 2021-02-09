(function() {
    /*
     * Kaltura Embed, works by first loading Kaltura script. The scripts set a global kWidget object.
     * If Annoto plugin is run before, the Kaltura script is loaded, then kWidget would not be available.
     * and the script below will poll until it is, every 100msec, giving up after 50 retries.
     */

    window.moodleAnnoto = window.moodleAnnoto || {};

    /** annotoKalturaHookSetup */
    function annotoKalturaHookSetup() {
        if (!window.kWidget) {
            return false;
        }

        var maKApp = {
            kdpMap: {},

            kWidgetReady: function(playerId) {
                if (!this.kdpMap[playerId]) {
                    var p = document.getElementById(playerId);
                    this.kdpMap[playerId] = {
                        id: playerId,
                        player: p
                    };
                    p.kBind('annotoPluginSetup', function(params) {
                        maKApp.annotoPluginSetup(playerId, params);
                    });
                }
            },

            annotoPluginSetup: function(id, params) {
                var kdpMap = this.kdpMap;
                var kdp = kdpMap[id];
                kdp.config = params.config;

                params.await = function(doneCb) {
                    kdp.doneCb = doneCb;
                };

                setTimeout(function () {
                    if (window.moodleAnnoto.setupKalturaKdpMap) {
                        window.moodleAnnoto.setupKalturaKdpMap(kdpMap);
                    }
                });
            },
        };

        window.kWidget.addReadyCallback(function(playerId) {
            maKApp.kWidgetReady(playerId);
        });
        window.moodleAnnoto.kApp = maKApp;
        return true;
    }

    var setupRetry = 0;

    /** annotoKalturaHookSetupPoll */
    function annotoKalturaHookSetupPoll() {
        if (!window.moodleAnnoto.kApp && setupRetry < 50 && !annotoKalturaHookSetup()) {
            setupRetry++;
            setTimeout(annotoKalturaHookSetupPoll, 100);
        }
    }
    annotoKalturaHookSetupPoll();

})();
