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
    version: "0.1.5",
    showVersion: function () {
        if (vis.binds.material.version) {
            console.log('Version material: ' + vis.binds.material.version);
            vis.binds.material.version = null;
        }
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
