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
import { describe, it } from 'node:test';
import expect from 'expect';
import sinon from 'sinon';
import { EventEmitter } from '../common/EventEmitter.js';
import { bubble, invokeAtMostOnceForArguments } from './decorators.js';
describe('decorators', function () {
    describe('invokeAtMostOnceForArguments', () => {
        it('should delegate calls', () => {
            const spy = sinon.spy();
            let Test = (() => {
                let _instanceExtraInitializers = [];
                let _test_decorators;
                return class Test {
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _test_decorators = [invokeAtMostOnceForArguments];
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
            expect(spy.callCount).toBe(0);
            const obj1 = {};
            const obj2 = {};
            t.test(obj1, obj2);
            expect(spy.callCount).toBe(1);
        });
        it('should prevent repeated calls', () => {
            const spy = sinon.spy();
            let Test = (() => {
                let _instanceExtraInitializers = [];
                let _test_decorators;
                return class Test {
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _test_decorators = [invokeAtMostOnceForArguments];
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
            expect(spy.callCount).toBe(0);
            const obj1 = {};
            const obj2 = {};
            t.test(obj1, obj2);
            expect(spy.callCount).toBe(1);
            expect(spy.lastCall.calledWith(obj1, obj2)).toBeTruthy();
            t.test(obj1, obj2);
            expect(spy.callCount).toBe(1);
            expect(spy.lastCall.calledWith(obj1, obj2)).toBeTruthy();
            const obj3 = {};
            t.test(obj1, obj3);
            expect(spy.callCount).toBe(2);
            expect(spy.lastCall.calledWith(obj1, obj3)).toBeTruthy();
        });
        it('should throw an error for dynamic argumetns', () => {
            let Test = (() => {
                let _instanceExtraInitializers = [];
                let _test_decorators;
                return class Test {
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _test_decorators = [invokeAtMostOnceForArguments];
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
            expect(() => {
                t.test({}, {});
            }).toThrow();
        });
        it('should throw an error for non object arguments', () => {
            let Test = (() => {
                let _instanceExtraInitializers = [];
                let _test_decorators;
                return class Test {
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _test_decorators = [invokeAtMostOnceForArguments];
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
            expect(() => {
                t.test(1);
            }).toThrow();
        });
    });
    describe('bubble', () => {
        it('should work', () => {
            let Test = (() => {
                let _classSuper = EventEmitter;
                let _instanceExtraInitializers = [];
                let _field_decorators;
                let _field_initializers = [];
                return class Test extends _classSuper {
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _field_decorators = [bubble()];
                        __esDecorate(this, null, _field_decorators, { kind: "accessor", name: "field", static: false, private: false, access: { has: obj => "field" in obj, get: obj => obj.field, set: (obj, value) => { obj.field = value; } }, metadata: _metadata }, _field_initializers, _instanceExtraInitializers);
                        if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    }
                    #field_accessor_storage = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _field_initializers, new EventEmitter()));
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
            expect(a).toBeTruthy();
            // Set a new emitter.
            t.field = new EventEmitter();
            a = false;
            t.field.emit('a', true);
            expect(a).toBeTruthy();
        });
        it('should not bubble down', () => {
            let Test = (() => {
                let _classSuper = EventEmitter;
                let _instanceExtraInitializers = [];
                let _field_decorators;
                let _field_initializers = [];
                return class Test extends _classSuper {
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _field_decorators = [bubble()];
                        __esDecorate(this, null, _field_decorators, { kind: "accessor", name: "field", static: false, private: false, access: { has: obj => "field" in obj, get: obj => obj.field, set: (obj, value) => { obj.field = value; } }, metadata: _metadata }, _field_initializers, _instanceExtraInitializers);
                        if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    }
                    #field_accessor_storage = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _field_initializers, new EventEmitter()));
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
            expect(a).toBeFalsy();
            t.field.emit('a', true);
            expect(a).toBeTruthy();
        });
    });
});
//# sourceMappingURL=decorators.test.js.map