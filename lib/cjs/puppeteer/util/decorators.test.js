"use strict";
/**
 * @license
 * Copyright 2023 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const expect_1 = __importDefault(require("expect"));
const sinon_1 = __importDefault(require("sinon"));
const EventEmitter_js_1 = require("../common/EventEmitter.js");
const decorators_js_1 = require("./decorators.js");
(0, node_test_1.describe)('decorators', function () {
    (0, node_test_1.describe)('invokeAtMostOnceForArguments', () => {
        (0, node_test_1.it)('should delegate calls', () => {
            const spy = sinon_1.default.spy();
            let Test = (() => {
                let _instanceExtraInitializers = [];
                let _test_decorators;
                return class Test {
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _test_decorators = [decorators_js_1.invokeAtMostOnceForArguments];
                        __esDecorate(this, null, _test_decorators, { kind: "method", name: "test", static: false, private: false, access: { has: obj => "test" in obj, get: obj => obj.test }, metadata: _metadata }, null, _instanceExtraInitializers);
                        if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    }
                    test(obj1, obj2) {
                        spy(obj1, obj2);
                    }
                    constructor() {
                        __runInitializers(this, _instanceExtraInitializers);
                    }
                };
            })();
            const t = new Test();
            (0, expect_1.default)(spy.callCount).toBe(0);
            const obj1 = {};
            const obj2 = {};
            t.test(obj1, obj2);
            (0, expect_1.default)(spy.callCount).toBe(1);
        });
        (0, node_test_1.it)('should prevent repeated calls', () => {
            const spy = sinon_1.default.spy();
            let Test = (() => {
                let _instanceExtraInitializers = [];
                let _test_decorators;
                return class Test {
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _test_decorators = [decorators_js_1.invokeAtMostOnceForArguments];
                        __esDecorate(this, null, _test_decorators, { kind: "method", name: "test", static: false, private: false, access: { has: obj => "test" in obj, get: obj => obj.test }, metadata: _metadata }, null, _instanceExtraInitializers);
                        if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    }
                    test(obj1, obj2) {
                        spy(obj1, obj2);
                    }
                    constructor() {
                        __runInitializers(this, _instanceExtraInitializers);
                    }
                };
            })();
            const t = new Test();
            (0, expect_1.default)(spy.callCount).toBe(0);
            const obj1 = {};
            const obj2 = {};
            t.test(obj1, obj2);
            (0, expect_1.default)(spy.callCount).toBe(1);
            (0, expect_1.default)(spy.lastCall.calledWith(obj1, obj2)).toBeTruthy();
            t.test(obj1, obj2);
            (0, expect_1.default)(spy.callCount).toBe(1);
            (0, expect_1.default)(spy.lastCall.calledWith(obj1, obj2)).toBeTruthy();
            const obj3 = {};
            t.test(obj1, obj3);
            (0, expect_1.default)(spy.callCount).toBe(2);
            (0, expect_1.default)(spy.lastCall.calledWith(obj1, obj3)).toBeTruthy();
        });
        (0, node_test_1.it)('should throw an error for dynamic argumetns', () => {
            let Test = (() => {
                let _instanceExtraInitializers = [];
                let _test_decorators;
                return class Test {
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _test_decorators = [decorators_js_1.invokeAtMostOnceForArguments];
                        __esDecorate(this, null, _test_decorators, { kind: "method", name: "test", static: false, private: false, access: { has: obj => "test" in obj, get: obj => obj.test }, metadata: _metadata }, null, _instanceExtraInitializers);
                        if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    }
                    test(..._args) { }
                    constructor() {
                        __runInitializers(this, _instanceExtraInitializers);
                    }
                };
            })();
            const t = new Test();
            t.test({});
            (0, expect_1.default)(() => {
                t.test({}, {});
            }).toThrow();
        });
        (0, node_test_1.it)('should throw an error for non object arguments', () => {
            let Test = (() => {
                let _instanceExtraInitializers = [];
                let _test_decorators;
                return class Test {
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _test_decorators = [decorators_js_1.invokeAtMostOnceForArguments];
                        __esDecorate(this, null, _test_decorators, { kind: "method", name: "test", static: false, private: false, access: { has: obj => "test" in obj, get: obj => obj.test }, metadata: _metadata }, null, _instanceExtraInitializers);
                        if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    }
                    test(..._args) { }
                    constructor() {
                        __runInitializers(this, _instanceExtraInitializers);
                    }
                };
            })();
            const t = new Test();
            (0, expect_1.default)(() => {
                t.test(1);
            }).toThrow();
        });
    });
    (0, node_test_1.describe)('bubble', () => {
        (0, node_test_1.it)('should work', () => {
            let Test = (() => {
                let _classSuper = EventEmitter_js_1.EventEmitter;
                let _instanceExtraInitializers = [];
                let _field_decorators;
                let _field_initializers = [];
                return class Test extends _classSuper {
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _field_decorators = [(0, decorators_js_1.bubble)()];
                        __esDecorate(this, null, _field_decorators, { kind: "accessor", name: "field", static: false, private: false, access: { has: obj => "field" in obj, get: obj => obj.field, set: (obj, value) => { obj.field = value; } }, metadata: _metadata }, _field_initializers, _instanceExtraInitializers);
                        if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    }
                    #field_accessor_storage = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _field_initializers, new EventEmitter_js_1.EventEmitter()));
                    get field() { return this.#field_accessor_storage; }
                    set field(value) { this.#field_accessor_storage = value; }
                };
            })();
            const t = new Test();
            let a = false;
            t.on('a', (value) => {
                a = value;
            });
            t.field.emit('a', true);
            (0, expect_1.default)(a).toBeTruthy();
            // Set a new emitter.
            t.field = new EventEmitter_js_1.EventEmitter();
            a = false;
            t.field.emit('a', true);
            (0, expect_1.default)(a).toBeTruthy();
        });
        (0, node_test_1.it)('should not bubble down', () => {
            let Test = (() => {
                let _classSuper = EventEmitter_js_1.EventEmitter;
                let _instanceExtraInitializers = [];
                let _field_decorators;
                let _field_initializers = [];
                return class Test extends _classSuper {
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _field_decorators = [(0, decorators_js_1.bubble)()];
                        __esDecorate(this, null, _field_decorators, { kind: "accessor", name: "field", static: false, private: false, access: { has: obj => "field" in obj, get: obj => obj.field, set: (obj, value) => { obj.field = value; } }, metadata: _metadata }, _field_initializers, _instanceExtraInitializers);
                        if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    }
                    #field_accessor_storage = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _field_initializers, new EventEmitter_js_1.EventEmitter()));
                    get field() { return this.#field_accessor_storage; }
                    set field(value) { this.#field_accessor_storage = value; }
                };
            })();
            const t = new Test();
            let a = false;
            t.field.on('a', (value) => {
                a = value;
            });
            t.emit('a', true);
            (0, expect_1.default)(a).toBeFalsy();
            t.field.emit('a', true);
            (0, expect_1.default)(a).toBeTruthy();
        });
    });
});
//# sourceMappingURL=decorators.test.js.map