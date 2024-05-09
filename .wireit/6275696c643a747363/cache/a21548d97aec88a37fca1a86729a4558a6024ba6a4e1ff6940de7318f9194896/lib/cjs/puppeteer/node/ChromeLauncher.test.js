"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright 2023 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */
const node_test_1 = require("node:test");
const expect_1 = __importDefault(require("expect"));
const ChromeLauncher_js_1 = require("./ChromeLauncher.js");
(0, node_test_1.describe)('getFeatures', () => {
    (0, node_test_1.it)('returns an empty array when no options are provided', () => {
        const result = (0, ChromeLauncher_js_1.getFeatures)('--foo');
        (0, expect_1.default)(result).toEqual([]);
    });
    (0, node_test_1.it)('returns an empty array when no options match the flag', () => {
        const result = (0, ChromeLauncher_js_1.getFeatures)('--foo', ['--bar', '--baz']);
        (0, expect_1.default)(result).toEqual([]);
    });
    (0, node_test_1.it)('returns an array of values when options match the flag', () => {
        const result = (0, ChromeLauncher_js_1.getFeatures)('--foo', ['--foo=bar', '--foo=baz']);
        (0, expect_1.default)(result).toEqual(['bar', 'baz']);
    });
    (0, node_test_1.it)('does not handle whitespace', () => {
        const result = (0, ChromeLauncher_js_1.getFeatures)('--foo', ['--foo bar', '--foo baz ']);
        (0, expect_1.default)(result).toEqual([]);
    });
    (0, node_test_1.it)('handles equals sign around the flag and value', () => {
        const result = (0, ChromeLauncher_js_1.getFeatures)('--foo', ['--foo=bar', '--foo=baz ']);
        (0, expect_1.default)(result).toEqual(['bar', 'baz']);
    });
});
(0, node_test_1.describe)('removeMatchingFlags', () => {
    (0, node_test_1.it)('empty', () => {
        const a = [];
        (0, expect_1.default)((0, ChromeLauncher_js_1.removeMatchingFlags)(a, '--foo')).toEqual([]);
    });
    (0, node_test_1.it)('with one match', () => {
        const a = ['--foo=1', '--bar=baz'];
        (0, expect_1.default)((0, ChromeLauncher_js_1.removeMatchingFlags)(a, '--foo')).toEqual(['--bar=baz']);
    });
    (0, node_test_1.it)('with multiple matches', () => {
        const a = ['--foo=1', '--foo=2', '--bar=baz'];
        (0, expect_1.default)((0, ChromeLauncher_js_1.removeMatchingFlags)(a, '--foo')).toEqual(['--bar=baz']);
    });
    (0, node_test_1.it)('with no matches', () => {
        const a = ['--foo=1', '--bar=baz'];
        (0, expect_1.default)((0, ChromeLauncher_js_1.removeMatchingFlags)(a, '--baz')).toEqual(['--foo=1', '--bar=baz']);
    });
});
//# sourceMappingURL=ChromeLauncher.test.js.map