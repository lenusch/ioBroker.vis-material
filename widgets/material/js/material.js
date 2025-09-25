/*
    ioBroker.vis material Widget-Set
    version: "0.1.4"
    Copyright 2018 nisiode<nisio.air@mail.com>
    forked by Pix 7/2018 (humidity, shutter)
*/
"use strict";

// add translations for edit mode
if (vis.editMode) {
    $.extend(true, systemDictionary, {
        "title":          {"en": "Title",       "de": "Titel",  "ru": "Заголовок"},
        "subtitle":       {"en": "Subtitle",      "de": "Untertitel",   "ru": "Подзаголовок"}
    });
}

// add translations for non-edit mode
$.extend(true, systemDictionary, {
    "Instance":     {"en": "Instance", "de": "Instanz", "ru": "Инстанция"},
    "open":         {"en": "open", "de": "offen", "ru": "открыто"},
    "tilted":       {"en": "tilted", "de": "gekippt", "ru": "приоткрыто"},
    "closed":       {"en": "closed", "de": "geschlossen", "ru": "закрыто"},
    "on":           {"en": "on", "de": "an", "ru": "вкл"},
    "off":          {"en": "off", "de": "aus", "ru": "выкл"}
});

vis.binds.material = {
    version: "0.2.1",
    showVersion: function () {
        if (vis.binds.material.version) {
            console.log('%c[vis-material] Loaded version: ' + vis.binds.material.version, 'color: #03A9F4; font-weight: bold;');
            vis.binds.material.version = null;
        }
    },

    // VIS-2 Basic Image Refresh Fix - für alle Image Widgets
    basicImageIntervals: {},
    
    fixBasicImageWidgets: function() {
        console.log('[vis-material] Scanning for Basic Image widgets with refresh intervals');
        
        if (!vis.views || !vis.activeView || !vis.views[vis.activeView]) {
            return;
        }
        
        const widgets = vis.views[vis.activeView].widgets;
        let fixedCount = 0;
        
        Object.keys(widgets).forEach(function(widgetId) {
            const widget = widgets[widgetId];
            
            // Prüfe ob es ein Basic Image Widget mit refreshInterval ist
            if (widget.tpl === 'tplImage' && 
                widget.data && 
                widget.data.refreshInterval && 
                widget.data.refreshInterval > 0 &&
                widget.data.src) {
                
                console.log('[vis-material] Fixing Basic Image widget:', widgetId, 
                           'src:', widget.data.src, 
                           'interval:', widget.data.refreshInterval + 'ms');
                
                // Stoppe existierendes Intervall
                if (vis.binds.material.basicImageIntervals[widgetId]) {
                    clearInterval(vis.binds.material.basicImageIntervals[widgetId]);
                }
                
                // Starte neues Intervall
                vis.binds.material.basicImageIntervals[widgetId] = setInterval(function() {
                    const $img = $('#' + widgetId + ' img');
                    
                    if ($img.length && widget.data.src) {
                        // Cache-Busting mit Timestamp
                        const separator = widget.data.src.includes('?') ? '&' : '?';
                        const newUrl = widget.data.src + separator + '_t=' + Date.now();
                        
                        $img.attr('src', newUrl);
                    }
                }, widget.data.refreshInterval);
                
                fixedCount++;
            }
        });
        
        if (fixedCount > 0) {
            console.log('%c[vis-material] Fixed ' + fixedCount + ' Basic Image widgets', 'color: #4CAF50; font-weight: bold;');
        }
    },
    
    cleanupBasicImageIntervals: function() {
        Object.keys(vis.binds.material.basicImageIntervals).forEach(function(widgetId) {
            clearInterval(vis.binds.material.basicImageIntervals[widgetId]);
            delete vis.binds.material.basicImageIntervals[widgetId];
        });
        console.log('[vis-material] Cleaned up all Basic Image intervals');
    },

	tplMdListDoor: function (widgetID, view, data) {
        const srcOpen = 'widgets/material/img/fts_door_open.png';
        const srcClosed = 'widgets/material/img/fts_door.png';
        const valOpen = _('open');
        const valClosed = _('closed');

        var $div = $('#' + widgetID);
        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.material.tplMdListDoor(widgetID, view, data);
            }, 100);
        }

        function update(state){
            var value = (state) ? valOpen : valClosed;
            var src = (state) ? srcOpen : srcClosed;
            $div.find('.md-list-value').html(value);
            $div.find('.md-list-icon').find('img').attr('src', src);
        }

        // VIS-2 Fix: OID aus Widget-Konfiguration lesen
        let oid = data.oid;
        if (!oid && vis.views && vis.activeView && vis.views[vis.activeView].widgets) {
            const widget = vis.views[vis.activeView].widgets[widgetID];
            if (widget && widget.data && widget.data.oid) {
                oid = widget.data.oid;
            }
        }

        if (oid) {
            console.log('[tplMdListDoor] Using OID:', oid);
            
            // VIS-1 API (funktioniert in VIS-2)
            vis.states.bind(oid + '.val', function (e, newVal, oldVal) {
                console.log('[tplMdListDoor] State changed from', oldVal, 'to', newVal);
                update(newVal);
            });
            
            // Set initial value
            const initialVal = vis.states[oid + '.val'];
            console.log('[tplMdListDoor] Initial value:', initialVal);
            update(initialVal);
        } else {
            console.log('[tplMdListDoor] No OID configured for widget:', widgetID);
        }
    },
	tplMdListWindow: function (widgetID, view, data) {
        const srcOpen = 'widgets/material/img/fts_window_2w_open.png';
        const srcClosed = 'widgets/material/img/fts_window_2w.png';
        const valOpen = _('open');
        const valClosed = _('closed');
        var $div = $('#' + widgetID);

        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.material.tplMdListWindow(widgetID, view, data);
            }, 100);
        }

        function update(state){
            var value = (state) ? valOpen : valClosed;
            var src = (state) ? srcOpen : srcClosed;
            $div.find('.md-list-value').html(value);
            $div.find('.md-list-icon').find('img').attr('src', src);
        }    
        
        if (data.oid) {
            // Load initial value
            vis.conn.getStates(data.oid, function (err, states) {
                if (!err && states && states[data.oid]) {
                    update(states[data.oid].val);
                }
            });

            // Subscribe to updates
            vis.conn.subscribe(data.oid, function (val) {
                update(val);
            });

            // Also try to get cached value from _data
            const cachedVal = vis.states._data && vis.states._data[data.oid + '.val'];
            if (cachedVal !== undefined) {
                update(cachedVal);
            }
        }
    },
    tplMdListTemp: function (widgetID, view, data) {
        var $div = $('#' + widgetID);

        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.material.tplMdListTemp(widgetID, view, data);
            }, 100);
        }
        
        function checkAge(lcTime) {
            // grey out the value in case the last change is more than 24h ago
            var curTime = new Date().getTime();
            var seconds = (curTime - lcTime) / 1000;
            if(seconds > 86400){ 
                $div.find('.md-list-value').css('opacity', '0.5');
            } else {
                $div.find('.md-list-value').css('opacity', '1');
            }
        }
        
        function update(state, lcTime){
            if(typeof state === 'number'){
                $div.find('.md-list-value').html(state.toFixed(1) + ' °C');
                if (lcTime !== undefined) {
                    checkAge(lcTime);
                }
            }
        }

        if (data.oid) {
            // Load initial value
            vis.conn.getStates(data.oid, function (err, states) {
                if (!err && states && states[data.oid]) {
                    update(states[data.oid].val, states[data.oid].lc);
                }
            });

            // Subscribe to updates
            vis.conn.subscribe(data.oid, function (val) {
                const lcTime = vis.states._data && vis.states._data[data.oid + '.lc'];
                update(val, lcTime);
            });

            // Also try to get cached value from _data
            const cachedVal = vis.states._data && vis.states._data[data.oid + '.val'];
            const cachedLc = vis.states._data && vis.states._data[data.oid + '.lc'];
            if (cachedVal !== undefined) {
                update(cachedVal, cachedLc);
            }
        }
    },
    tplMdListHumid: function (widgetID, view, data) {
        var $div = $('#' + widgetID);

        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.material.tplMdListHumid(widgetID, view, data);
            }, 100);
        }
        
        function checkAge(lcTime) {
            // grey out the value in case the last change is more than 24h ago
            var curTime = new Date().getTime();
            var seconds = (curTime - lcTime) / 1000;
            if(seconds > 86400){ 
                $div.find('.md-list-value').css('opacity', '0.5');
            } else {
                $div.find('.md-list-value').css('opacity', '1');
            }
        }
        
        function update(state, lcTime){
            if(typeof state === 'number'){
                $div.find('.md-list-value').html(state.toFixed(1) + ' %');
                if (lcTime !== undefined) {
                    checkAge(lcTime);
                }
            }
        }

        if (data.oid) {
            // Load initial value
            vis.conn.getStates(data.oid, function (err, states) {
                if (!err && states && states[data.oid]) {
                    update(states[data.oid].val, states[data.oid].lc);
                }
            });

            // Subscribe to updates
            vis.conn.subscribe(data.oid, function (val) {
                const lcTime = vis.states._data && vis.states._data[data.oid + '.lc'];
                update(val, lcTime);
            });

            // Also try to get cached value from _data
            const cachedVal = vis.states._data && vis.states._data[data.oid + '.val'];
            const cachedLc = vis.states._data && vis.states._data[data.oid + '.lc'];
            if (cachedVal !== undefined) {
                update(cachedVal, cachedLc);
            }
        }
    },
	tplMdListLight: function (widgetID, view, data) {
        const srcOff = 'widgets/material/img/light_light_dim_00.png';
        const srcOn = 'widgets/material/img/light_light_dim_100.png';
        var $div = $('#' + widgetID);

        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.material.tplMdListLight(widgetID, view, data);
            }, 100);
        }

        function update(state){
            var src = (state) ? srcOn : srcOff;
            var $tmp = $('#' + widgetID + '_checkbox');
            $tmp.prop('checked', state);
            $div.find('.md-list-icon').find('img').attr('src', src);
        }

        if (!vis.editMode) {
            var $this = $('#' + widgetID + '_checkbox');
            $this.change(function () {
                var $this_ = $(this);
                vis.setValue($this_.data('oid'), $this_.prop('checked'));
            });
        }
        
        if (data.oid) {
            // Load initial value
            vis.conn.getStates(data.oid, function (err, states) {
                if (!err && states && states[data.oid]) {
                    update(states[data.oid].val);
                }
            });

            // Subscribe to updates
            vis.conn.subscribe(data.oid, function (val) {
                update(val);
            });

            // Also try to get cached value from _data
            const cachedVal = vis.states._data && vis.states._data[data.oid + '.val'];
            if (cachedVal !== undefined) {
                update(cachedVal);
            }
        }
    },
	tplMdListLightDim: function (widgetID, view, data) {
        const srcOff = 'widgets/material/img/light_light_dim_00.png';
        const srcOn = 'widgets/material/img/light_light_dim_100.png';
        var $div = $('#' + widgetID);

        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.material.tplMdListLightDim(widgetID, view, data);
            }, 100);
        }

        function update(state){
            if (typeof state === 'number') {
                var src = 'widgets/material/img/light_light_dim_' + Math.ceil(state/10) + '0.png';
                $div.find('.md-list-icon').find('img').attr('src', src);
            }
        }

        /* if (!vis.editMode) {
            var $this = $('#' + widgetID + '_slider');
            $this.change(function () {
                var $this_ = $(this);
                vis.setValue($this_.data('oid'), $this_.prop('checked'));
            });
        } */
        
        if (data.oid) {
            // Load initial value
            vis.conn.getStates(data.oid, function (err, states) {
                if (!err && states && states[data.oid]) {
                    update(states[data.oid].val);
                }
            });

            // Subscribe to updates
            vis.conn.subscribe(data.oid, function (val) {
                update(val);
            });

            // Also try to get cached value from _data
            const cachedVal = vis.states._data && vis.states._data[data.oid + '.val'];
            if (cachedVal !== undefined) {
                update(cachedVal);
            }
        }
    },
	tplMdListShutter: function (widgetID, view, data) {
        const srcOff = 'widgets/material/img/fts_shutter_00.png';
        const srcOn = 'widgets/material/img/fts_shutter_100.png';
        var $div = $('#' + widgetID);

        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.material.tplMdListShutter(widgetID, view, data);
            }, 100);
        }

        function update(state){
            if (typeof state === 'number') {
                var src = 'widgets/material/img/fts_shutter_' + Math.ceil(state/10) + '0.png';
                $div.find('.md-list-icon').find('img').attr('src', src);
            }
        }

        /* if (!vis.editMode) {
            var $this = $('#' + widgetID + '_slider');
            $this.change(function () {
                var $this_ = $(this);
                vis.setValue($this_.data('oid'), $this_.prop('checked'));
            });
        } */
        
        if (data.oid) {
            // Load initial value
            vis.conn.getStates(data.oid, function (err, states) {
                if (!err && states && states[data.oid]) {
                    update(states[data.oid].val);
                }
            });

            // Subscribe to updates
            vis.conn.subscribe(data.oid, function (val) {
                update(val);
            });

            // Also try to get cached value from _data
            const cachedVal = vis.states._data && vis.states._data[data.oid + '.val'];
            if (cachedVal !== undefined) {
                update(cachedVal);
            }
        }
    }
};

vis.binds.material.showVersion();

// Automatischer Start des Basic Image Fix nach dem Laden
setTimeout(function() {
    vis.binds.material.fixBasicImageWidgets();
}, 2000);

// Fix auch bei View-Wechsel - mehrere Methoden für VIS-2
$(document).on('viewChanged', function() {
    console.log('[vis-material] viewChanged event detected');
    vis.binds.material.cleanupBasicImageIntervals();
    setTimeout(function() {
        vis.binds.material.fixBasicImageWidgets();
    }, 1000);
});

// Zusätzlich: URL Hash-Änderungen überwachen (für #cam, #cam2, etc.)
let lastHash = window.location.hash;
setInterval(function() {
    if (window.location.hash !== lastHash) {
        console.log('[vis-material] Hash changed from', lastHash, 'to', window.location.hash);
        lastHash = window.location.hash;
        
        vis.binds.material.cleanupBasicImageIntervals();
        setTimeout(function() {
            vis.binds.material.fixBasicImageWidgets();
        }, 1500); // Etwas länger warten bei Hash-Wechsel
    }
}, 500); // Prüfe alle 500ms

// Zusätzlich: vis.activeView Änderungen überwachen
let lastActiveView = vis.activeView;
setInterval(function() {
    if (vis.activeView !== lastActiveView) {
        console.log('[vis-material] activeView changed from', lastActiveView, 'to', vis.activeView);
        lastActiveView = vis.activeView;
        
        vis.binds.material.cleanupBasicImageIntervals();
        setTimeout(function() {
            vis.binds.material.fixBasicImageWidgets();
        }, 1000);
    }
}, 500);

// Cleanup bei Page Unload
$(window).on('beforeunload', function() {
    vis.binds.material.cleanupBasicImageIntervals();
});
