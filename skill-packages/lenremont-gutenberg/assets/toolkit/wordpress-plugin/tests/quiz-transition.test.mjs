import assert from 'node:assert/strict';
import { createQuizTransition } from '../../src/scripts/quiz-transition.js';

function fixture(reduced = false) {
    let now = 0, height = 360, completeAnimation;
    const timers = [];
    const element = () => {
        const attrs = new Map(), classes = new Set();
        return {
            attrs, classes,
            setAttribute: (name, value) => attrs.set(name, value),
            removeAttribute: name => attrs.delete(name),
            classList: {
                add: name => classes.add(name),
                toggle: (name, on) => on ? classes.add(name) : classes.delete(name)
            }
        };
    };
    const buttons = [element(), element()], body = element(), app = element();
    Object.assign(app, {
        querySelectorAll: () => buttons,
        querySelector: () => body,
        getBoundingClientRect: () => ({ height }),
        animate: (frames, timing) => {
            app.animation = { frames, timing };
            return { finished: new Promise(resolve => { completeAnimation = resolve; }) };
        }
    });
    globalThis.window = {
        matchMedia: () => ({ matches: reduced }),
        setTimeout: (fn, delay) => timers.push({ at: now + delay, fn })
    };
    const advance = ms => {
        const end = now + ms;
        while (timers.some(t => t.at <= end)) {
            timers.sort((a,b) => a.at - b.at);
            const timer = timers.shift();
            now = timer.at;
            timer.fn();
        }
        now = end;
    };
    return { app, body, buttons, advance, resize: h => { height = h; }, finish: async () => { completeAnimation(); await Promise.resolve(); } };
}

const normal = fixture();
let updates = 0, starts = 0;
const run = createQuizTransition(normal.app, () => { starts++; });
assert.equal(run(() => { updates++; normal.resize(460); }, normal.buttons[0]), true);
assert.equal(normal.buttons[0].attrs.get('aria-pressed'), 'true');
assert.equal(normal.buttons[1].attrs.get('aria-pressed'), 'false');
assert.equal(normal.app.attrs.get('aria-busy'), 'true');
assert.equal(run(() => { updates++; }, normal.buttons[1]), false, 'Repeated clicks cannot skip a question.');
normal.advance(219);
assert.equal(updates, 0);
assert.equal(normal.body.classes.has('is-leaving'), false);
normal.advance(1);
assert.equal(normal.body.classes.has('is-leaving'), true);
normal.advance(139);
assert.equal(updates, 0);
normal.advance(1);
assert.equal(updates, 1);
assert.deepEqual(normal.app.animation.frames, [{ height: '360px' }, { height: '460px' }]);
assert.equal(normal.app.animation.timing.duration, 240);
assert.equal(run(() => { updates++; }), false, 'Incoming animation must also guard navigation.');
await normal.finish();
assert.equal(normal.app.attrs.has('aria-busy'), false);
assert.equal(normal.buttons[0].attrs.has('aria-disabled'), false);
assert.equal(starts, 1);
assert.equal(run(() => { updates++; }), true, 'Navigation unlocks after animation.');
normal.advance(140);
assert.equal(updates, 2, 'Back navigation has no selection pause.');
await normal.finish();

const reduced = fixture(true);
let reducedUpdates = 0;
const runReduced = createQuizTransition(reduced.app, () => {});
runReduced(() => { reducedUpdates++; }, reduced.buttons[0]);
reduced.advance(220);
assert.equal(reducedUpdates, 1);
assert.equal(reduced.body.classes.has('is-leaving'), false);
assert.equal(reduced.app.animation, undefined);
assert.equal(reduced.app.attrs.has('aria-busy'), false);
delete globalThis.window;
console.log('Quiz transition tests passed: 220ms feedback, 140ms exit, 240ms resize, click guard, back, reduced motion.');
