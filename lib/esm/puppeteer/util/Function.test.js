/**
 * @license
 * Copyright 2018 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it } from 'node:test';
import expect from 'expect';
import { interpolateFunction } from './Function.js';
describe('Function', function () {
    describe('interpolateFunction', function () {
        it('should work', async () => {
            const test = interpolateFunction(() => {
                const test = PLACEHOLDER('test');
                return test();
            }, { test: `() => 5` });
            expect(test()).toBe(5);
        });
        it('should work inlined', async () => {
            const test = interpolateFunction(() => {
                // Note the parenthesis will be removed by the typescript compiler.
                return PLACEHOLDER('test')();
            }, { test: `() => 5` });
            expect(test()).toBe(5);
        });
    });
});
//# sourceMappingURL=Function.test.js.map