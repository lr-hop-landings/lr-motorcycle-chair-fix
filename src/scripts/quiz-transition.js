/** A short selection acknowledgement, then one outgoing/incoming step. */
export function createQuizTransition(app, onStart) {
    let busy = false;
    const setBusy = value => {
        app.classList.toggle('is-transitioning', value);
        if (value) app.setAttribute('aria-busy', 'true');
        else app.removeAttribute('aria-busy');
        app.querySelectorAll('button').forEach(button => {
            if (value) button.setAttribute('aria-disabled', 'true');
            else button.removeAttribute('aria-disabled');
        });
    };
    const finish = () => { busy = false; setBusy(false); };

    return function transition(update, choice = null, delay = choice ? 220 : 0) {
        if (busy) return false;
        busy = true;
        onStart();
        setBusy(true);
        if (choice) {
            app.querySelectorAll('[data-choice]').forEach(button => {
                button.setAttribute('aria-pressed', String(button === choice));
            });
        }
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.setTimeout(() => {
            if (!reduced) app.querySelector('.enter')?.classList.add('is-leaving');
            window.setTimeout(() => {
                const before = app.getBoundingClientRect().height;
                update();
                const after = app.getBoundingClientRect().height;
                setBusy(true);
                if (reduced || !app.animate) {
                    finish();
                    return;
                }
                // Only animate the temporary height; the resting height stays auto.
                const animation = app.animate(
                    [{ height: `${before}px` }, { height: `${after}px` }],
                    { duration: 240, easing: 'cubic-bezier(.2,.7,.2,1)' }
                );
                animation.finished.then(finish, finish);
            }, reduced ? 0 : 140);
        }, delay);
        return true;
    };
}
