"use strict";
/**
 * @license
 * Copyright 2023 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const expect_1 = __importDefault(require("expect"));
const sinon_1 = __importDefault(require("sinon"));
const EventEmitter_js_1 = require("./EventEmitter.js");
(0, node_test_1.describe)('EventEmitter', () => {
    let emitter;
    (0, node_test_1.beforeEach)(() => {
        emitter = new EventEmitter_js_1.EventEmitter();
    });
    (0, node_test_1.describe)('on', () => {
        const onTests = (methodName) => {
            (0, node_test_1.it)(`${methodName}: adds an event listener that is fired when the event is emitted`, () => {
                const listener = sinon_1.default.spy();
                emitter[methodName]('foo', listener);
                emitter.emit('foo', undefined);
                (0, expect_1.default)(listener.callCount).toEqual(1);
            });
            (0, node_test_1.it)(`${methodName} sends the event data to the handler`, () => {
                const listener = sinon_1.default.spy();
                const data = {};
                emitter[methodName]('foo', listener);
                emitter.emit('foo', data);
                (0, expect_1.default)(listener.callCount).toEqual(1);
                (0, expect_1.default)(listener.firstCall.args[0]).toBe(data);
            });
            (0, node_test_1.it)(`${methodName}: supports chaining`, () => {
                const listener = sinon_1.default.spy();
                const returnValue = emitter[methodName]('foo', listener);
                (0, expect_1.default)(returnValue).toBe(emitter);
            });
        };
        onTests('on');
    });
    (0, node_test_1.describe)('off', () => {
        const offTests = (methodName) => {
            (0, node_test_1.it)(`${methodName}: removes the listener so it is no longer called`, () => {
                const listener = sinon_1.default.spy();
                emitter.on('foo', listener);
                emitter.emit('foo', undefined);
                (0, expect_1.default)(listener.callCount).toEqual(1);
                emitter.off('foo', listener);
                emitter.emit('foo', undefined);
                (0, expect_1.default)(listener.callCount).toEqual(1);
            });
            (0, node_test_1.it)(`${methodName}: supports chaining`, () => {
                const listener = sinon_1.default.spy();
                emitter.on('foo', listener);
                const returnValue = emitter.off('foo', listener);
                (0, expect_1.default)(returnValue).toBe(emitter);
            });
        };
        offTests('off');
    });
    (0, node_test_1.describe)('once', () => {
        (0, node_test_1.it)('only calls the listener once and then removes it', () => {
            const listener = sinon_1.default.spy();
            emitter.once('foo', listener);
            emitter.emit('foo', undefined);
            (0, expect_1.default)(listener.callCount).toEqual(1);
            emitter.emit('foo', undefined);
            (0, expect_1.default)(listener.callCount).toEqual(1);
        });
        (0, node_test_1.it)('supports chaining', () => {
            const listener = sinon_1.default.spy();
            const returnValue = emitter.once('foo', listener);
            (0, expect_1.default)(returnValue).toBe(emitter);
        });
    });
    (0, node_test_1.describe)('emit', () => {
        (0, node_test_1.it)('calls all the listeners for an event', () => {
            const listener1 = sinon_1.default.spy();
            const listener2 = sinon_1.default.spy();
            const listener3 = sinon_1.default.spy();
            emitter.on('foo', listener1).on('foo', listener2).on('bar', listener3);
            emitter.emit('foo', undefined);
            (0, expect_1.default)(listener1.callCount).toEqual(1);
            (0, expect_1.default)(listener2.callCount).toEqual(1);
            (0, expect_1.default)(listener3.callCount).toEqual(0);
        });
        (0, node_test_1.it)('passes data through to the listener', () => {
            const listener = sinon_1.default.spy();
            emitter.on('foo', listener);
            const data = {};
            emitter.emit('foo', data);
            (0, expect_1.default)(listener.callCount).toEqual(1);
            (0, expect_1.default)(listener.firstCall.args[0]).toBe(data);
        });
        (0, node_test_1.it)('returns true if the event has listeners', () => {
            const listener = sinon_1.default.spy();
            emitter.on('foo', listener);
            (0, expect_1.default)(emitter.emit('foo', undefined)).toBe(true);
        });
        (0, node_test_1.it)('returns false if the event has listeners', () => {
            const listener = sinon_1.default.spy();
            emitter.on('foo', listener);
            (0, expect_1.default)(emitter.emit('notFoo', undefined)).toBe(false);
        });
    });
    (0, node_test_1.describe)('listenerCount', () => {
        (0, node_test_1.it)('returns the number of listeners for the given event', () => {
            emitter.on('foo', () => { });
            emitter.on('foo', () => { });
            emitter.on('bar', () => { });
            (0, expect_1.default)(emitter.listenerCount('foo')).toEqual(2);
            (0, expect_1.default)(emitter.listenerCount('bar')).toEqual(1);
            (0, expect_1.default)(emitter.listenerCount('noListeners')).toEqual(0);
        });
    });
    (0, node_test_1.describe)('removeAllListeners', () => {
        (0, node_test_1.it)('removes every listener from all events by default', () => {
            emitter.on('foo', () => { }).on('bar', () => { });
            emitter.removeAllListeners();
            (0, expect_1.default)(emitter.emit('foo', undefined)).toBe(false);
            (0, expect_1.default)(emitter.emit('bar', undefined)).toBe(false);
        });
        (0, node_test_1.it)('returns the emitter for chaining', () => {
            (0, expect_1.default)(emitter.removeAllListeners()).toBe(emitter);
        });
        (0, node_test_1.it)('can filter to remove only listeners for a given event name', () => {
            emitter
                .on('foo', () => { })
                .on('bar', () => { })
                .on('bar', () => { });
            emitter.removeAllListeners('bar');
            (0, expect_1.default)(emitter.emit('foo', undefined)).toBe(true);
            (0, expect_1.default)(emitter.emit('bar', undefined)).toBe(false);
        });
    });
    (0, node_test_1.describe)('dispose', () => {
        (0, node_test_1.it)('should dispose higher order emitters properly', () => {
            let values = '';
            emitter.on('foo', () => {
                values += '1';
            });
            const higherOrderEmitter = new EventEmitter_js_1.EventEmitter(emitter);
            higherOrderEmitter.on('foo', () => {
                values += '2';
            });
            higherOrderEmitter.emit('foo', undefined);
            (0, expect_1.default)(values).toMatch('12');
            higherOrderEmitter.off('foo');
            higherOrderEmitter.emit('foo', undefined);
            (0, expect_1.default)(values).toMatch('121');
        });
    });
});
//# sourceMappingURL=EventEmitter.test.js.map