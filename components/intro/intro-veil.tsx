/**
 * First-visit intro: a greeting cycles through several languages, then settles
 * on a welcome line and the veil lifts to reveal the hero. Roughly 2.2s.
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

/**
 * Hindi and Punjabi lead the non-English set on purpose: this is a portfolio
 * from Patiala, and the greetings should say so before the copy does.
 */
const greetings = [
  { text: "Hello", lang: "en" },
  { text: "नमस्ते", lang: "hi" },
  { text: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", lang: "pa" },
  { text: "こんにちは", lang: "ja" },
  { text: "Bonjour", lang: "fr" },
  { text: "Hola", lang: "es" },
  { text: "你好", lang: "zh" },
];

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
  window.setTimeout(function(){ d.setAttribute('data-intro','done'); }, 2800);
})();
`;

export function IntroVeil() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: dismissScript }} />
      <div id="intro-veil" aria-hidden>
        {/*
          Stage and subtitle share one wrapper. As direct children of the veil's
          grid they became two separate rows, which stranded "to my portfolio"
          near the bottom of the screen instead of under the greeting.
        */}
        <div className="intro-inner">
          <div className="intro-stage">
            {greetings.map((g, i) => (
              <span
                key={g.lang}
                lang={g.lang}
                className="intro-greet"
                // Index drives the stagger, so the timing stays in the stylesheet.
                style={{ "--i": i } as React.CSSProperties}
              >
                {g.text}
              </span>
            ))}
            {/*
              "Welcome" and its subtitle animate as one block, in the same grid
              cell as the greetings. Binding them together is what guarantees the
              subtitle cannot appear while the greetings are still cycling; two
              independent delays only happened to line up.
            */}
            <span className="intro-final">
              <span className="intro-final-word">Welcome</span>
              <span className="intro-final-sub">to my portfolio</span>
            </span>
          </div>
        </div>
        <p className="intro-hint">click anywhere to skip</p>
      </div>
    </>
  );
}
