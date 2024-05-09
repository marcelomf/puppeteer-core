"use strict";
/**
 * @license
 * Copyright 2022 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const expect_1 = __importDefault(require("expect"));
const Connection_js_1 = require("./Connection.js");
(0, node_test_1.describe)('WebDriver BiDi Connection', () => {
    class TestConnectionTransport {
        sent = [];
        closed = false;
        send(message) {
            this.sent.push(message);
        }
        close() {
            this.closed = true;
        }
    }
    (0, node_test_1.it)('should work', async () => {
        const transport = new TestConnectionTransport();
        const connection = new Connection_js_1.BidiConnection('ws://127.0.0.1', transport);
        const responsePromise = connection.send('session.new', {
            capabilities: {},
        });
        (0, expect_1.default)(transport.sent).toEqual([
            `{"id":1,"method":"session.new","params":{"capabilities":{}}}`,
        ]);
        const id = JSON.parse(transport.sent[0]).id;
        const rawResponse = {
            id,
            type: 'success',
            result: { ready: false, message: 'already connected' },
        };
        transport.onmessage?.(JSON.stringify(rawResponse));
        const response = await responsePromise;
        (0, expect_1.default)(response).toEqual(rawResponse);
        connection.dispose();
        (0, expect_1.default)(transport.closed).toBeTruthy();
    });
});
//# sourceMappingURL=Connection.test.js.map