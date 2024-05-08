"use strict";
/**
 * @license
 * Copyright 2024 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const expect_1 = __importDefault(require("expect"));
const sinon_1 = __importDefault(require("sinon"));
const ExtensionTransport_js_1 = require("./ExtensionTransport.js");
(0, node_test_1.describe)('ExtensionTransport', function () {
    (0, node_test_1.afterEach)(() => {
        sinon_1.default.restore();
    });
    function mockChrome() {
        const fakeAttach = sinon_1.default.fake.resolves(undefined);
        const fakeDetach = sinon_1.default.fake.resolves(undefined);
        const fakeSendCommand = sinon_1.default.fake.resolves({});
        const fakeGetTargets = sinon_1.default.fake.resolves([]);
        const onEvent = [];
        sinon_1.default.define(globalThis, 'chrome', {
            debugger: {
                attach: fakeAttach,
                detach: fakeDetach,
                sendCommand: fakeSendCommand,
                getTargets: fakeGetTargets,
                onEvent: {
                    addListener: (cb) => {
                        onEvent.push(cb);
                    },
                    removeListener: (cb) => {
                        const idx = onEvent.indexOf(cb);
                        if (idx !== -1) {
                            onEvent.splice(idx, 1);
                        }
                    },
                },
            },
        });
        return {
            fakeAttach,
            fakeDetach,
            fakeSendCommand,
            fakeGetTargets,
            onEvent,
        };
    }
    (0, node_test_1.describe)('connectTab', function () {
        (0, node_test_1.it)('should attach using tabId', async () => {
            const { fakeAttach, onEvent } = mockChrome();
            const transport = await ExtensionTransport_js_1.ExtensionTransport.connectTab(1);
            (0, expect_1.default)(transport).toBeInstanceOf(ExtensionTransport_js_1.ExtensionTransport);
            (0, expect_1.default)(fakeAttach.calledOnceWith({ tabId: 1 }, '1.3')).toBeTruthy();
            (0, expect_1.default)(onEvent).toHaveLength(1);
        });
        (0, node_test_1.it)('should detach', async () => {
            const { onEvent } = mockChrome();
            const transport = await ExtensionTransport_js_1.ExtensionTransport.connectTab(1);
            transport.close();
            (0, expect_1.default)(onEvent).toHaveLength(0);
        });
    });
    (0, node_test_1.describe)('send', function () {
        async function testTranportResponse(command) {
            const { fakeSendCommand } = mockChrome();
            const transport = await ExtensionTransport_js_1.ExtensionTransport.connectTab(1);
            const onmessageFake = sinon_1.default.fake();
            transport.onmessage = onmessageFake;
            transport.send(JSON.stringify(command));
            (0, expect_1.default)(fakeSendCommand.notCalled).toBeTruthy();
            return onmessageFake.getCalls().map(call => {
                return call.args[0];
            });
        }
        (0, node_test_1.it)('provides a dummy response to Browser.getVersion', async () => {
            (0, expect_1.default)(await testTranportResponse({
                id: 1,
                method: 'Browser.getVersion',
            })).toStrictEqual([
                '{"id":1,"method":"Browser.getVersion","result":{"protocolVersion":"1.3","product":"chrome","revision":"unknown","userAgent":"chrome","jsVersion":"unknown"}}',
            ]);
        });
        (0, node_test_1.it)('provides a dummy response to Target.getBrowserContexts', async () => {
            (0, expect_1.default)(await testTranportResponse({
                id: 1,
                method: 'Target.getBrowserContexts',
            })).toStrictEqual([
                '{"id":1,"method":"Target.getBrowserContexts","result":{"browserContextIds":[]}}',
            ]);
        });
        (0, node_test_1.it)('provides a dummy response and events to Target.setDiscoverTargets', async () => {
            (0, expect_1.default)(await testTranportResponse({
                id: 1,
                method: 'Target.setDiscoverTargets',
            })).toStrictEqual([
                '{"method":"Target.targetCreated","params":{"targetInfo":{"targetId":"tabTargetId","type":"tab","title":"tab","url":"about:blank","attached":false,"canAccessOpener":false}}}',
                '{"method":"Target.targetCreated","params":{"targetInfo":{"targetId":"pageTargetId","type":"page","title":"page","url":"about:blank","attached":false,"canAccessOpener":false}}}',
                '{"id":1,"method":"Target.setDiscoverTargets","result":{}}',
            ]);
        });
        (0, node_test_1.it)('attaches to a dummy tab target on Target.setAutoAttach', async () => {
            (0, expect_1.default)(await testTranportResponse({
                id: 1,
                method: 'Target.setAutoAttach',
            })).toStrictEqual([
                '{"method":"Target.attachedToTarget","params":{"targetInfo":{"targetId":"tabTargetId","type":"tab","title":"tab","url":"about:blank","attached":false,"canAccessOpener":false},"sessionId":"tabTargetSessionId"}}',
                '{"id":1,"method":"Target.setAutoAttach","result":{}}',
            ]);
        });
        (0, node_test_1.it)('attaches to a dummy page target on Target.setAutoAttach', async () => {
            (0, expect_1.default)(await testTranportResponse({
                id: 1,
                method: 'Target.setAutoAttach',
                sessionId: 'tabTargetSessionId',
            })).toStrictEqual([
                '{"method":"Target.attachedToTarget","params":{"targetInfo":{"targetId":"pageTargetId","type":"page","title":"page","url":"about:blank","attached":false,"canAccessOpener":false},"sessionId":"pageTargetSessionId"}}',
                '{"id":1,"sessionId":"tabTargetSessionId","method":"Target.setAutoAttach","result":{}}',
            ]);
        });
        (0, node_test_1.it)('rewrites session id for pageTargetSessionId commands', async () => {
            const { fakeSendCommand } = mockChrome();
            const transport = await ExtensionTransport_js_1.ExtensionTransport.connectTab(1);
            transport.send(JSON.stringify({
                id: 1,
                method: 'Runtime.evaluate',
                params: {},
                sessionId: 'pageTargetSessionId',
            }));
            (0, expect_1.default)(fakeSendCommand.calledOnce).toBeTruthy();
            (0, expect_1.default)(fakeSendCommand.lastCall.args).toStrictEqual([
                {
                    tabId: 1,
                    sessionId: undefined,
                },
                'Runtime.evaluate',
                {},
            ]);
        });
    });
});
//# sourceMappingURL=ExtensionTransport.test.js.map