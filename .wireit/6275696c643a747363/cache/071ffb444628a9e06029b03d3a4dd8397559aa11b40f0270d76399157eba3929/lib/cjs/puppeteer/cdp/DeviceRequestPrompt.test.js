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
const Errors_js_1 = require("../common/Errors.js");
const EventEmitter_js_1 = require("../common/EventEmitter.js");
const TimeoutSettings_js_1 = require("../common/TimeoutSettings.js");
const DeviceRequestPrompt_js_1 = require("./DeviceRequestPrompt.js");
class MockCDPSession extends EventEmitter_js_1.EventEmitter {
    async send() { }
    connection() {
        return undefined;
    }
    async detach() { }
    id() {
        return '1';
    }
    parentSession() {
        return undefined;
    }
}
(0, node_test_1.describe)('DeviceRequestPrompt', function () {
    (0, node_test_1.describe)('waitForDevicePrompt', function () {
        (0, node_test_1.it)('should return prompt', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const manager = new DeviceRequestPrompt_js_1.DeviceRequestPromptManager(client, timeoutSettings);
            const [prompt] = await Promise.all([
                manager.waitForDevicePrompt(),
                (() => {
                    client.emit('DeviceAccess.deviceRequestPrompted', {
                        id: '00000000000000000000000000000000',
                        devices: [],
                    });
                })(),
            ]);
            (0, expect_1.default)(prompt).toBeTruthy();
        });
        (0, node_test_1.it)('should respect timeout', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const manager = new DeviceRequestPrompt_js_1.DeviceRequestPromptManager(client, timeoutSettings);
            await (0, expect_1.default)(manager.waitForDevicePrompt({ timeout: 1 })).rejects.toBeInstanceOf(Errors_js_1.TimeoutError);
        });
        (0, node_test_1.it)('should respect default timeout when there is no custom timeout', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const manager = new DeviceRequestPrompt_js_1.DeviceRequestPromptManager(client, timeoutSettings);
            timeoutSettings.setDefaultTimeout(1);
            await (0, expect_1.default)(manager.waitForDevicePrompt()).rejects.toBeInstanceOf(Errors_js_1.TimeoutError);
        });
        (0, node_test_1.it)('should prioritize exact timeout over default timeout', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const manager = new DeviceRequestPrompt_js_1.DeviceRequestPromptManager(client, timeoutSettings);
            timeoutSettings.setDefaultTimeout(0);
            await (0, expect_1.default)(manager.waitForDevicePrompt({ timeout: 1 })).rejects.toBeInstanceOf(Errors_js_1.TimeoutError);
        });
        (0, node_test_1.it)('should work with no timeout', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const manager = new DeviceRequestPrompt_js_1.DeviceRequestPromptManager(client, timeoutSettings);
            const [prompt] = await Promise.all([
                manager.waitForDevicePrompt({ timeout: 0 }),
                (async () => {
                    await new Promise(resolve => {
                        setTimeout(resolve, 50);
                    });
                    client.emit('DeviceAccess.deviceRequestPrompted', {
                        id: '00000000000000000000000000000000',
                        devices: [],
                    });
                })(),
            ]);
            (0, expect_1.default)(prompt).toBeTruthy();
        });
        (0, node_test_1.it)('should return the same prompt when there are many watchdogs simultaneously', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const manager = new DeviceRequestPrompt_js_1.DeviceRequestPromptManager(client, timeoutSettings);
            const [prompt1, prompt2] = await Promise.all([
                manager.waitForDevicePrompt(),
                manager.waitForDevicePrompt(),
                (() => {
                    client.emit('DeviceAccess.deviceRequestPrompted', {
                        id: '00000000000000000000000000000000',
                        devices: [],
                    });
                })(),
            ]);
            (0, expect_1.default)(prompt1 === prompt2).toBeTruthy();
        });
        (0, node_test_1.it)('should listen and shortcut when there are no watchdogs', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const manager = new DeviceRequestPrompt_js_1.DeviceRequestPromptManager(client, timeoutSettings);
            client.emit('DeviceAccess.deviceRequestPrompted', {
                id: '00000000000000000000000000000000',
                devices: [],
            });
            (0, expect_1.default)(manager).toBeTruthy();
        });
    });
    (0, node_test_1.describe)('DeviceRequestPrompt.devices', function () {
        (0, node_test_1.it)('lists devices as they arrive', function () {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const prompt = new DeviceRequestPrompt_js_1.DeviceRequestPrompt(client, timeoutSettings, {
                id: '00000000000000000000000000000000',
                devices: [],
            });
            (0, expect_1.default)(prompt.devices).toHaveLength(0);
            client.emit('DeviceAccess.deviceRequestPrompted', {
                id: '00000000000000000000000000000000',
                devices: [{ id: '00000000', name: 'Device 0' }],
            });
            (0, expect_1.default)(prompt.devices).toHaveLength(1);
            client.emit('DeviceAccess.deviceRequestPrompted', {
                id: '00000000000000000000000000000000',
                devices: [
                    { id: '00000000', name: 'Device 0' },
                    { id: '11111111', name: 'Device 1' },
                ],
            });
            (0, expect_1.default)(prompt.devices).toHaveLength(2);
            (0, expect_1.default)(prompt.devices[0]).toBeInstanceOf(DeviceRequestPrompt_js_1.DeviceRequestPromptDevice);
            (0, expect_1.default)(prompt.devices[1]).toBeInstanceOf(DeviceRequestPrompt_js_1.DeviceRequestPromptDevice);
        });
        (0, node_test_1.it)('does not list devices from events of another prompt', function () {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const prompt = new DeviceRequestPrompt_js_1.DeviceRequestPrompt(client, timeoutSettings, {
                id: '00000000000000000000000000000000',
                devices: [],
            });
            (0, expect_1.default)(prompt.devices).toHaveLength(0);
            client.emit('DeviceAccess.deviceRequestPrompted', {
                id: '88888888888888888888888888888888',
                devices: [
                    { id: '00000000', name: 'Device 0' },
                    { id: '11111111', name: 'Device 1' },
                ],
            });
            (0, expect_1.default)(prompt.devices).toHaveLength(0);
        });
    });
    (0, node_test_1.describe)('DeviceRequestPrompt.waitForDevice', function () {
        (0, node_test_1.it)('should return first matching device', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const prompt = new DeviceRequestPrompt_js_1.DeviceRequestPrompt(client, timeoutSettings, {
                id: '00000000000000000000000000000000',
                devices: [],
            });
            const [device] = await Promise.all([
                prompt.waitForDevice(({ name }) => {
                    return name.includes('1');
                }),
                (() => {
                    client.emit('DeviceAccess.deviceRequestPrompted', {
                        id: '00000000000000000000000000000000',
                        devices: [{ id: '00000000', name: 'Device 0' }],
                    });
                    client.emit('DeviceAccess.deviceRequestPrompted', {
                        id: '00000000000000000000000000000000',
                        devices: [
                            { id: '00000000', name: 'Device 0' },
                            { id: '11111111', name: 'Device 1' },
                        ],
                    });
                })(),
            ]);
            (0, expect_1.default)(device).toBeInstanceOf(DeviceRequestPrompt_js_1.DeviceRequestPromptDevice);
        });
        (0, node_test_1.it)('should return first matching device from already known devices', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const prompt = new DeviceRequestPrompt_js_1.DeviceRequestPrompt(client, timeoutSettings, {
                id: '00000000000000000000000000000000',
                devices: [
                    { id: '00000000', name: 'Device 0' },
                    { id: '11111111', name: 'Device 1' },
                ],
            });
            const device = await prompt.waitForDevice(({ name }) => {
                return name.includes('1');
            });
            (0, expect_1.default)(device).toBeInstanceOf(DeviceRequestPrompt_js_1.DeviceRequestPromptDevice);
        });
        (0, node_test_1.it)('should return device in the devices list', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const prompt = new DeviceRequestPrompt_js_1.DeviceRequestPrompt(client, timeoutSettings, {
                id: '00000000000000000000000000000000',
                devices: [],
            });
            const [device] = await Promise.all([
                prompt.waitForDevice(({ name }) => {
                    return name.includes('1');
                }),
                (() => {
                    client.emit('DeviceAccess.deviceRequestPrompted', {
                        id: '00000000000000000000000000000000',
                        devices: [
                            { id: '00000000', name: 'Device 0' },
                            { id: '11111111', name: 'Device 1' },
                        ],
                    });
                })(),
            ]);
            (0, expect_1.default)(prompt.devices).toContain(device);
        });
        (0, node_test_1.it)('should respect timeout', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const prompt = new DeviceRequestPrompt_js_1.DeviceRequestPrompt(client, timeoutSettings, {
                id: '00000000000000000000000000000000',
                devices: [],
            });
            await (0, expect_1.default)(prompt.waitForDevice(({ name }) => {
                return name.includes('Device');
            }, { timeout: 1 })).rejects.toBeInstanceOf(Errors_js_1.TimeoutError);
        });
        (0, node_test_1.it)('should respect default timeout when there is no custom timeout', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const prompt = new DeviceRequestPrompt_js_1.DeviceRequestPrompt(client, timeoutSettings, {
                id: '00000000000000000000000000000000',
                devices: [],
            });
            timeoutSettings.setDefaultTimeout(1);
            await (0, expect_1.default)(prompt.waitForDevice(({ name }) => {
                return name.includes('Device');
            }, { timeout: 1 })).rejects.toBeInstanceOf(Errors_js_1.TimeoutError);
        });
        (0, node_test_1.it)('should prioritize exact timeout over default timeout', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const prompt = new DeviceRequestPrompt_js_1.DeviceRequestPrompt(client, timeoutSettings, {
                id: '00000000000000000000000000000000',
                devices: [],
            });
            timeoutSettings.setDefaultTimeout(0);
            await (0, expect_1.default)(prompt.waitForDevice(({ name }) => {
                return name.includes('Device');
            }, { timeout: 1 })).rejects.toBeInstanceOf(Errors_js_1.TimeoutError);
        });
        (0, node_test_1.it)('should work with no timeout', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const prompt = new DeviceRequestPrompt_js_1.DeviceRequestPrompt(client, timeoutSettings, {
                id: '00000000000000000000000000000000',
                devices: [],
            });
            const [device] = await Promise.all([
                prompt.waitForDevice(({ name }) => {
                    return name.includes('1');
                }, { timeout: 0 }),
                (() => {
                    client.emit('DeviceAccess.deviceRequestPrompted', {
                        id: '00000000000000000000000000000000',
                        devices: [{ id: '00000000', name: 'Device 0' }],
                    });
                    client.emit('DeviceAccess.deviceRequestPrompted', {
                        id: '00000000000000000000000000000000',
                        devices: [
                            { id: '00000000', name: 'Device 0' },
                            { id: '11111111', name: 'Device 1' },
                        ],
                    });
                })(),
            ]);
            (0, expect_1.default)(device).toBeInstanceOf(DeviceRequestPrompt_js_1.DeviceRequestPromptDevice);
        });
        (0, node_test_1.it)('should return same device from multiple watchdogs', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const prompt = new DeviceRequestPrompt_js_1.DeviceRequestPrompt(client, timeoutSettings, {
                id: '00000000000000000000000000000000',
                devices: [],
            });
            const [device1, device2] = await Promise.all([
                prompt.waitForDevice(({ name }) => {
                    return name.includes('1');
                }),
                prompt.waitForDevice(({ name }) => {
                    return name.includes('1');
                }),
                (() => {
                    client.emit('DeviceAccess.deviceRequestPrompted', {
                        id: '00000000000000000000000000000000',
                        devices: [{ id: '00000000', name: 'Device 0' }],
                    });
                    client.emit('DeviceAccess.deviceRequestPrompted', {
                        id: '00000000000000000000000000000000',
                        devices: [
                            { id: '00000000', name: 'Device 0' },
                            { id: '11111111', name: 'Device 1' },
                        ],
                    });
                })(),
            ]);
            (0, expect_1.default)(device1 === device2).toBeTruthy();
        });
    });
    (0, node_test_1.describe)('DeviceRequestPrompt.select', function () {
        (0, node_test_1.it)('should succeed with listed device', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const prompt = new DeviceRequestPrompt_js_1.DeviceRequestPrompt(client, timeoutSettings, {
                id: '00000000000000000000000000000000',
                devices: [],
            });
            const [device] = await Promise.all([
                prompt.waitForDevice(({ name }) => {
                    return name.includes('1');
                }),
                (() => {
                    client.emit('DeviceAccess.deviceRequestPrompted', {
                        id: '00000000000000000000000000000000',
                        devices: [
                            { id: '00000000', name: 'Device 0' },
                            { id: '11111111', name: 'Device 1' },
                        ],
                    });
                })(),
            ]);
            await prompt.select(device);
        });
        (0, node_test_1.it)('should error for device not listed in devices', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const prompt = new DeviceRequestPrompt_js_1.DeviceRequestPrompt(client, timeoutSettings, {
                id: '00000000000000000000000000000000',
                devices: [],
            });
            await (0, expect_1.default)(prompt.select(new DeviceRequestPrompt_js_1.DeviceRequestPromptDevice('11111111', 'Device 1'))).rejects.toThrowError('Cannot select unknown device!');
        });
        (0, node_test_1.it)('should fail when selecting prompt twice', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const prompt = new DeviceRequestPrompt_js_1.DeviceRequestPrompt(client, timeoutSettings, {
                id: '00000000000000000000000000000000',
                devices: [],
            });
            const [device] = await Promise.all([
                prompt.waitForDevice(({ name }) => {
                    return name.includes('1');
                }),
                (() => {
                    client.emit('DeviceAccess.deviceRequestPrompted', {
                        id: '00000000000000000000000000000000',
                        devices: [
                            { id: '00000000', name: 'Device 0' },
                            { id: '11111111', name: 'Device 1' },
                        ],
                    });
                })(),
            ]);
            await prompt.select(device);
            await (0, expect_1.default)(prompt.select(device)).rejects.toThrowError('Cannot select DeviceRequestPrompt which is already handled!');
        });
    });
    (0, node_test_1.describe)('DeviceRequestPrompt.cancel', function () {
        (0, node_test_1.it)('should succeed on first call', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const prompt = new DeviceRequestPrompt_js_1.DeviceRequestPrompt(client, timeoutSettings, {
                id: '00000000000000000000000000000000',
                devices: [],
            });
            await prompt.cancel();
        });
        (0, node_test_1.it)('should fail when canceling prompt twice', async () => {
            const client = new MockCDPSession();
            const timeoutSettings = new TimeoutSettings_js_1.TimeoutSettings();
            const prompt = new DeviceRequestPrompt_js_1.DeviceRequestPrompt(client, timeoutSettings, {
                id: '00000000000000000000000000000000',
                devices: [],
            });
            await prompt.cancel();
            await (0, expect_1.default)(prompt.cancel()).rejects.toThrowError('Cannot cancel DeviceRequestPrompt which is already handled!');
        });
    });
});
//# sourceMappingURL=DeviceRequestPrompt.test.js.map