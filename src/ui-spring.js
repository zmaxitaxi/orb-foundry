// A critically damped UI spring. Retargeting preserves the displayed position
// and velocity, so an interrupted transition never jumps to an old endpoint.
export function createUiSpring(onUpdate, { initial = 0, response = 0.3, reducedMotion = false } = {}) {
    let position = initial;
    let target = initial;
    let velocity = 0;
    let frame = 0;
    let previousTime = 0;
    const frequency = 2 * Math.PI / response;
    function tick(time) {
        const dt = Math.min(1 / 30, previousTime ? (time - previousTime) / 1000 : 1 / 60);
        previousTime = time;
        velocity += (frequency * frequency * (target - position) - 2 * frequency * velocity) * dt;
        position += velocity * dt;
        onUpdate(position);
        if (Math.abs(target - position) < 0.0005 && Math.abs(velocity) < 0.002) {
            position = target;
            velocity = 0;
            onUpdate(position);
            frame = 0;
            previousTime = 0;
        } else frame = requestAnimationFrame(tick);
    }
    return {
        to(value) {
            target = value;
            if (reducedMotion) { position = target; velocity = 0; onUpdate(position); return; }
            if (!frame) frame = requestAnimationFrame(tick);
        },
        stop() { cancelAnimationFrame(frame); frame = 0; previousTime = 0; },
    };
}
