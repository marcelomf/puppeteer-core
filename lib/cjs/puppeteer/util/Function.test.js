"use strict";
/**
 * @license
 * Copyright 2018 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const expect_1 = __importDefault(require("expect"));
const Function_js_1 = require("./Function.js");
(0, node_test_1.describe)('Function', function () {
    (0, node_test_1.describe)('interpolateFunction', function () {
        (0, node_test_1.it)('should work', async () => {
            const test = (0, Function_js_1.interpolateFunction)(() => {
                const test = PLACEHOLDER('test');
                return test();
            }, { test: `() => 5` });
            (0, expect_1.default)(test()).toBe(5);
        });
        (0, node_test_1.it)('should work inlined', async () => {
            const test = (0, Function_js_1.interpolateFunction)(() => {
                // Note the parenthesis will be removed by the typescript compiler.
                return PLACEHOLDER('test')();
            }, { test: `() => 5` });
            (0, expect_1.default)(test()).toBe(5);
        });
    });
});
//# sourceMappingURL=Function.test.js.map