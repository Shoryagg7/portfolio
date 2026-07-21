import { profile } from "@/lib/content/profile";

/**
 * Cinematic first-visit intro: the name resolves out of black, then the veil
 * lifts to reveal the hero. Roughly 1.8s end to end.
 *
 * Deliberately server-rendered HTML driven by CSS animations, with no client
 * component behind it. Three reasons:
 *
 *  - No flash. A React-mounted overlay would paint the hero first and then drop
 *    black over it, which is worse than no intro at all.
 *  - No hydration mismatch. The markup is identical on server and client; the
 *    only thing that varies is an attribute set on <html> before first paint.
 *  - No cost. It adds nothing to the JS bundle and runs before hydration, so a
 *    slow connection gets the intro on time rather than late.
 *
 * The inline script runs before the veil is parsed, so a repeat visitor or
 * anyone with prefers-reduced-motion never sees a frame of it.
 */
const dismissScript = `
(function(){
  var d = document.documentElement;
  var off = function(){ d.setAttribute('data-intro','off'); };
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return off();
    if (sessionStorage.getItem('intro-seen') === '1') return off();
    sessionStorage.setItem('intro-seen','1');
  } catch (e) { return off(); }

  // Any deliberate input dismisses it. Never a gate you have to wait out.
  var skip = function(){ d.setAttribute('data-intro','dismiss'); };
  var opts = { once: true, passive: true };
  ['pointerdown','keydown','wheel','touchstart'].forEach(function(evt){
    window.addEventListener(evt, skip, opts);
  });
  window.setTimeout(function(){ d.setAttribute('data-intro','done'); }, 2000);
})();
`;

export function IntroVeil() {
  const [first, last] = profile.name.split(" ");

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: dismissScript }} />
      <div id="intro-veil" aria-hidden>
        <div className="intro-inner">
          <p className="intro-name">
            {first} <span>{last}</span>
          </p>
          <span className="intro-rule" />
          <p className="intro-role">Backend &amp; Distributed Systems Engineer</p>
        </div>
        <p className="intro-hint">click anywhere to skip</p>
      </div>
    </>
  );
}
