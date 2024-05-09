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
const FirefoxLauncher_js_1 = require("./FirefoxLauncher.js");
(0, node_test_1.describe)('FirefoxLauncher', function () {
    (0, node_test_1.describe)('getPreferences', function () {
        (0, node_test_1.it)('should return preferences for CDP', async () => {
            const prefs = FirefoxLauncher_js_1.FirefoxLauncher.getPreferences({
                test: 1,
            }, undefined);
            (0, expect_1.default)(prefs['test']).toBe(1);
            (0, expect_1.default)(prefs['fission.bfcacheInParent']).toBe(false);
            (0, expect_1.default)(prefs['fission.webContentIsolationStrategy']).toBe(0);
            (0, expect_1.default)(prefs).toEqual(FirefoxLauncher_js_1.FirefoxLauncher.getPreferences({
                test: 1,
            }, 'cdp'));
        });
        (0, node_test_1.it)('should return preferences for WebDriver BiDi', async () => {
            const prefs = FirefoxLauncher_js_1.FirefoxLauncher.getPreferences({
                test: 1,
            }, 'webDriverBiDi');
            (0, expect_1.default)(prefs['test']).toBe(1);
            (0, expect_1.default)(prefs['fission.bfcacheInParent']).toBe(undefined);
            (0, expect_1.default)(prefs['fission.webContentIsolationStrategy']).toBe(0);
        });
    });
});
//# sourceMappingURL=FirefoxLauncher.test.js.map