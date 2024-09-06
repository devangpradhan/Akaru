import { TweenMax } from 'gsap';
import rightNow from 'right-now';

export default ({ app }) => {
  const maxDeltaTime = 1 / 30; // approximately 30 fps
  let lastTime = 0;

  TweenMax.ticker.addEventListener('tick', () => {
    const now = rightNow();
    const deltaTime = Math.min(maxDeltaTime, (now - lastTime) / 1000);
    lastTime = now;

    app.$bus.$emit('tick', deltaTime);
  });
};
