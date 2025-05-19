'use strict';

import {libWrapper} from './shim.js';

Hooks.once('init', function() {
    let inputDown = false;
    let hasValidToken = false;

    const MODULE_NAME = "GM Token-Drag Visibility v2";
    const MODULE_ID = "gm-token-drag-visibility-v2";
    console.log(`Initializing "${MODULE_NAME}"`);

    libWrapper.register(MODULE_ID, 'CONFIG.Token.objectClass.prototype._onDragLeftStart', function (wrapped, ...args) {
        if (!game.user.isGM || !canvas.scene.tokenVision) {
            return wrapped(...args);
            }

        inputDown = true;
        
        //Check to see if any of the controlled tokens use sight
        //Check to see if any token is interactive
        for (let t of canvas.tokens.controlled) {
            if (t.interactive && t.document.sight.enabled) {
                hasValidToken = true;
                break;
            }
        }

        return wrapped(...args);
    }, 'WRAPPER');
    
    libWrapper.register(MODULE_ID, 'CONFIG.Token.objectClass.prototype._onDragLeftMove', function (wrapped, ...args) {
        if (!game.user.isGM || !canvas.scene.tokenVision ||
            !inputDown || !hasValidToken) {
                return wrapped(...args);
        }

        canvas.scene.tokenVision = false;
        canvas.perception.update({ refreshVision: true });

        return wrapped(...args);
    }, 'WRAPPER');

    function EndDrag() {
        if (!game.user.isGM || !inputDown) {
            return;
        }
        inputDown = false;
    
        if (hasValidToken) {
            canvas.scene.tokenVision = true;
            canvas.perception.update({ refreshVision: true });
            hasValidToken = false;
        }
    }

    libWrapper.register(MODULE_ID, 'CONFIG.Token.objectClass.prototype._onDragLeftDrop', function (wrapped, ...args) {
        let result = wrapped(...args);
        if (!args[0].interactionData.released) {
            EndDrag();
        }
        return result;
    }, 'WRAPPER');

    libWrapper.register(MODULE_ID, 'CONFIG.Token.objectClass.prototype._onDragLeftCancel', function (wrapped, ...args) {
        let result = wrapped(...args);
        if (result !== false) {
            EndDrag();
        }
        return result;
    }, 'WRAPPER');
});