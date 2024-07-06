'use strict';

import {libWrapper} from './shim.js';

let inputDown = false;
let hasValidToken = false;

Hooks.once('init', function() {
    const MODULE_NAME = "GM Token-Drag Visibility v2";
    const MODULE_ID = "gm-token-drag-visibility-v2";
    console.log(`Initializing "${MODULE_NAME}"`);

    libWrapper.register(MODULE_ID, 'Token.prototype._onDragLeftStart', (function() {
        return async function(wrapped, ...args) {
            if (!game.user.isGM || !canvas.scene.tokenVision) {
                return wrapped.apply(this, args);
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

            return wrapped.apply(this, args);
        }
    })(), 'WRAPPER');
    
    libWrapper.register(MODULE_ID, 'Token.prototype._onDragLeftMove', (function() {
        return async function(wrapped, ...args) {
            if (!game.user.isGM || !canvas.scene.tokenVision ||
                !inputDown || !hasValidToken) {
                    return wrapped.apply(this, args);
            }

            canvas.scene.tokenVision = false;
            canvas.perception.update({ refreshVision: true });

            return wrapped.apply(this, args);
        }
    })(), 'WRAPPER');

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

    libWrapper.register(MODULE_ID, 'Token.prototype._onDragLeftDrop', (function() {
        return async function(wrapped, ...args) {
            EndDrag();
            return wrapped.apply(this, args);
        }
    })(), 'WRAPPER');

    libWrapper.register(MODULE_ID, 'Token.prototype._onDragLeftCancel', (function() {
        return async function(wrapped, ...args) {
            EndDrag();
            return wrapped.apply(this, args);
        }
    })(), 'WRAPPER');
});