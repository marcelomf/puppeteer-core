/**
 * @license
 * Copyright 2022 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it } from 'node:test';
import expect from 'expect';
import { BidiConnection } from './Connection.js';
describe('WebDriver BiDi Connection', () => {
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
    it('should work', async () => {
        const transport = new TestConnectionTransport();
        const connection = new BidiConnection('ws://127.0.0.1', transport);
        const responsePromise = connection.send('session.new', {
            capabilities: {},
        });
        expect(transport.sent).toEqual([
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
        expect(response).toEqual(rawResponse);
        connection.dispose();
        expect(transport.closed).toBeTruthy();
    });
});
//# sourceMappingURL=Connection.test.js.map