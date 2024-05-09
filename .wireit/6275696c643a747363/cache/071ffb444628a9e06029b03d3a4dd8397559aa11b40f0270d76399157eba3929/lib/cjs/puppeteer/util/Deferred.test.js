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
const Deferred_js_1 = require("./Deferred.js");
(0, node_test_1.describe)('DeferredPromise', function () {
    (0, node_test_1.it)('should catch errors', async () => {
        // Async function before try/catch.
        async function task() {
            await new Promise(resolve => {
                return setTimeout(resolve, 50);
            });
        }
        // Async function that fails.
        function fails() {
            const deferred = Deferred_js_1.Deferred.create();
            setTimeout(() => {
                deferred.reject(new Error('test'));
            }, 25);
            return deferred;
        }
        const expectedToFail = fails();
        await task();
        let caught = false;
        try {
            await expectedToFail.valueOrThrow();
        }
        catch (err) {
            (0, expect_1.default)(err.message).toEqual('test');
            caught = true;
        }
        (0, expect_1.default)(caught).toBeTruthy();
    });
    (0, node_test_1.it)('Deferred.race should cancel timeout', async function () {
        const clock = sinon_1.default.useFakeTimers();
        try {
            const deferred = Deferred_js_1.Deferred.create();
            const deferredTimeout = Deferred_js_1.Deferred.create({
                message: 'Race did not stop timer',
                timeout: 100,
            });
            clock.tick(50);
            await Promise.all([
                Deferred_js_1.Deferred.race([deferred, deferredTimeout]),
                deferred.resolve(),
            ]);
            clock.tick(150);
            (0, expect_1.default)(deferredTimeout.value()).toBeInstanceOf(Error);
            (0, expect_1.default)(deferredTimeout.value()?.message).toContain('Timeout cleared');
        }
        finally {
            clock.restore();
        }
    });
});
//# sourceMappingURL=Deferred.test.js.map