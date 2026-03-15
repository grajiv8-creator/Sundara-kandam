<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#0f0800" />
  <meta name="description" content="சுந்தர காண்டம் · Sundara Kandam — Daily reading of Kamba Ramayanam's most sacred chapter" />
  <title>சுந்தர காண்டம் · Sundara Kandam</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Tamil:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --saffron: #c2440c; --gold: #f5c87a; --deep: #0f0800; --dark: #1a0c00;
      --border: #3a2010; --text: #f5e6d0; --muted: #a07050; --dim: #604030;
    }
    html { scroll-behavior: smooth; }
    body { background: var(--deep); color: var(--text); font-family: 'Crimson Pro', Georgia, serif; line-height: 1.7; overflow-x: hidden; }
    body::before { content: ''; position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events: none; z-index: 0; opacity: 0.5; }
    .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 24px; position: relative; overflow: hidden; }
    .hero::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 30%, #c2440c18 0%, transparent 65%); pointer-events: none; }
    .mandala { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: min(600px, 90vw); height: min(600px, 90vw); opacity: 0.04; animation: slowspin 60s linear infinite; }
    @keyframes slowspin { to { transform: translate(-50%, -50%) rotate(360deg); } }
    .om-symbol { font-size: clamp(48px, 10vw, 80px); color: var(--gold); opacity: 0.9; margin-bottom: 24px; animation: fadeUp 1s ease both; position: relative; z-index: 1; text-shadow: 0 0 40px #f5c87a44; }
    .hero-tamil { font-family: 'Noto Serif Tamil', serif; font-size: clamp(36px, 8vw, 64px); color: var(--gold); letter-spacing: 0.05em; line-height: 1.2; animation: fadeUp 1s 0.15s ease both; position: relative; z-index: 1; }
    .hero-en { font-size: clamp(14px, 2.5vw, 18px); color: var(--muted); letter-spacing: 0.2em; margin-top: 8px; animation: fadeUp 1s 0.3s ease both; position: relative; z-index: 1; }
    .hero-divider { width: 80px; height: 1px; background: linear-gradient(to right, transparent, var(--gold), transparent); margin: 28px auto; animation: fadeUp 1s 0.45s ease both; position: relative; z-index: 1; }
    .hero-tagline { font-size: clamp(18px, 3.5vw, 26px); color: var(--text); max-width: 560px; font-style: italic; animation: fadeUp 1s 0.6s ease both; position: relative; z-index: 1; line-height: 1.6; }
    .cta-btn { display: inline-block; margin-top: 40px; padding: 16px 40px; background: var(--saffron); color: #fff8f0; font-family: 'Crimson Pro', serif; font-size: 18px; font-weight: 600; letter-spacing: 0.05em; border: none; border-radius: 50px; cursor: pointer; text-decoration: none; animation: fadeUp 1s 0.75s ease both; position: relative; z-index: 1; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 24px #c2440c44; }
    .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px #c2440c66; }
    .scroll-hint { position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); color: var(--dim); font-size: 13px; letter-spacing: 0.2em; animation: bounce 2s ease infinite; z-index: 1; }
    @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(6px)} }
    section { max-width: 720px; margin: 0 auto; padding: 80px 24px; position: relative; z-index: 1; }
    .section-label { font-size: 11px; letter-spacing: 0.3em; color: var(--saffron); text-transform: uppercase; margin-bottom: 16px; }
    h2 { font-family: 'Cormorant Garamond', serif; font-size: clamp(28px, 5vw, 44px); color: var(--gold); font-weight: 600; line-height: 1.2; margin-bottom: 24px; }
    p { font-size: clamp(16px, 2.5vw, 19px); color: #d4b896; margin-bottom: 18px; line-height: 1.8; }
    .quote-block { background: var(--dark); border: 1px solid var(--border); border-left: 4px solid var(--saffron); border-radius: 0 16px 16px 0; padding: 28px 32px; margin: 40px 0; }
    .quote-tamil { font-family: 'Noto Serif Tamil', serif; font-size: clamp(14px, 2.5vw, 17px); color: var(--gold); line-height: 1.9; margin-bottom: 16px; }
    .quote-en { font-size: clamp(16px, 2.5vw, 19px); font-style: italic; color: var(--text); line-height: 1.7; margin-bottom: 16px; }
    .quote-attr { font-size: 13px; letter-spacing: 0.15em; color: var(--saffron); }
    .benefits { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-top: 40px; }
    .benefit-card { background: var(--dark); border: 1px solid var(--border); border-radius: 16px; padding: 24px; transition: border-color 0.2s, transform 0.2s; }
    .benefit-card:hover { border-color: var(--saffron); transform: translateY(-2px); }
    .benefit-icon { font-size: 28px; margin-bottom: 12px; }
    .benefit-title { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: var(--gold); margin-bottom: 8px; font-weight: 600; }
    .benefit-text { font-size: 15px; color: var(--muted); line-height: 1.65; margin: 0; }
    .divider { width: 100%; height: 1px; background: linear-gradient(to right, transparent, var(--border), transparent); }
    .padalams { display: flex; flex-direction: column; gap: 16px; margin-top: 40px; }
    .padalam-row { display: flex; align-items: center; gap: 20px; padding: 20px 24px; background: var(--dark); border: 1px solid var(--border); border-radius: 14px; transition: border-color 0.2s; }
    .padalam-row:hover { border-color: var(--saffron); }
    .padalam-num { width: 48px; height: 48px; border-radius: 50%; background: #2a1508; border: 1.5px solid var(--saffron); color: var(--gold); font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .padalam-tamil { font-family: 'Noto Serif Tamil', serif; font-size: 17px; color: var(--gold); }
    .padalam-en { font-size: 14px; color: var(--muted); font-style: italic; margin-top: 2px; }
    .final-cta { text-align: center; padding: 80px 24px 100px; position: relative; z-index: 1; }
    .final-cta::before { content: ''; display: block; width: 1px; height: 60px; background: linear-gradient(to bottom, transparent, var(--border)); margin: 0 auto 60px; }
    .final-tamil { font-family: 'Noto Serif Tamil', serif; font-size: clamp(20px, 4vw, 32px); color: var(--gold); margin-bottom: 12px; }
    .final-sub { font-size: 17px; color: var(--muted); margin-bottom: 36px; font-style: italic; }
    .credit { margin-top: 48px; font-size: 12px; letter-spacing: 0.15em; color: var(--dim); }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    #app-container { display: none; }
    @media (max-width: 480px) { .quote-block { padding: 20px; } .benefits { grid-template-columns: 1fr; } }
  </style>
</head>
<body>

  <!-- LANDING PAGE -->
  <div id="landing">

    <div class="hero">
      <svg class="mandala" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="190" stroke="#f5c87a" stroke-width="0.5"/>
        <circle cx="200" cy="200" r="160" stroke="#f5c87a" stroke-width="0.5"/>
        <circle cx="200" cy="200" r="130" stroke="#f5c87a" stroke-width="0.5"/>
        <circle cx="200" cy="200" r="100" stroke="#f5c87a" stroke-width="0.5"/>
        <circle cx="200" cy="200" r="70" stroke="#f5c87a" stroke-width="0.5"/>
        <circle cx="200" cy="200" r="40" stroke="#f5c87a" stroke-width="0.5"/>
        <line x1="200" y1="10" x2="200" y2="390" stroke="#f5c87a" stroke-width="0.3"/>
        <line x1="10" y1="200" x2="390" y2="200" stroke="#f5c87a" stroke-width="0.3"/>
        <line x1="62" y1="62" x2="338" y2="338" stroke="#f5c87a" stroke-width="0.3"/>
        <line x1="338" y1="62" x2="62" y2="338" stroke="#f5c87a" stroke-width="0.3"/>
        <ellipse cx="200" cy="110" rx="18" ry="40" fill="#f5c87a" opacity="0.08" transform="rotate(0 200 200)"/>
        <ellipse cx="200" cy="110" rx="18" ry="40" fill="#f5c87a" opacity="0.08" transform="rotate(45 200 200)"/>
        <ellipse cx="200" cy="110" rx="18" ry="40" fill="#f5c87a" opacity="0.08" transform="rotate(90 200 200)"/>
        <ellipse cx="200" cy="110" rx="18" ry="40" fill="#f5c87a" opacity="0.08" transform="rotate(135 200 200)"/>
        <ellipse cx="200" cy="110" rx="18" ry="40" fill="#f5c87a" opacity="0.08" transform="rotate(180 200 200)"/>
        <ellipse cx="200" cy="110" rx="18" ry="40" fill="#f5c87a" opacity="0.08" transform="rotate(225 200 200)"/>
        <ellipse cx="200" cy="110" rx="18" ry="40" fill="#f5c87a" opacity="0.08" transform="rotate(270 200 200)"/>
        <ellipse cx="200" cy="110" rx="18" ry="40" fill="#f5c87a" opacity="0.08" transform="rotate(315 200 200)"/>
      </svg>
      <div class="om-symbol">ॐ</div>
      <div class="hero-tamil">சுந்தர காண்டம்</div>
      <div class="hero-en">SUNDARA KANDAM · KAMBA RAMAYANAM</div>
      <div class="hero-divider"></div>
      <div class="hero-tagline">The heart of the Ramayana — Hanuman's journey of devotion, courage and unwavering faith</div>
      <a href="#" class="cta-btn" id="enterBtn">Begin Reading →</a>
      <div class="scroll-hint">↓ &nbsp; scroll to learn more</div>
    </div>

    <div class="divider"></div>

    <section>
      <div class="section-label">About</div>
      <h2>What is Sundara Kandam?</h2>
      <p>Sundara Kandam is the fifth and most celebrated chapter of the Ramayana. Unlike any other section, its central hero is not Rama — but Hanuman. The word <em>Sundara</em> means beautiful, and this chapter is considered the most beautiful of all.</p>
      <p>It narrates Hanuman's extraordinary leap across the ocean to Lanka, his search for Sita in Ravana's kingdom, his message of hope to her, and his triumphant return to Rama. Every verse breathes devotion, courage and the power of faith.</p>
      <p>The Kamba Ramayanam — composed by the poet Kambar in the 12th century CE — is Tamil literature's greatest retelling. Its Sundara Kandam is celebrated for its classical Tamil poetry, richness, metre and devotional depth.</p>
      <div class="quote-block">
        <div class="quote-tamil">சுந்தர காண்டம் இராமாயணத்தின் சிரோமணி. தாய் சீதை, ஸ்ரீ ராமன், தூதன் அனுமன், சுலோகங்கள், அசோக வனம் — இவை அனைத்தும் இதில் மிகவும் அழகாக உள்ளன. இதை கேட்பது ஞானம், பக்தி வளர்க்கும், ஹனுமனின் ஆசியை தரும்.</div>
        <div class="quote-en">"Sundara Kanda is a crest jewel in Sri Ramayana. Mother Sita, Sri Rama, the messenger Hanuman, the slokas, Ashoka Vana — everything is so beautiful in this text. Listening to and studying this develops jnana, bhakti, and brings the glorious blessings of Sri Hanuman."</div>
        <div class="quote-attr">— Sri U.Ve. Velukkudi Krishnan Swami</div>
      </div>
    </section>

    <div class="divider"></div>

    <section>
      <div class="section-label">Why Read</div>
      <h2>The Power of Daily Parayanam</h2>
      <p>For centuries, devoted families across Tamil Nadu have recited Sundara Kandam daily as their most sacred practice. The tradition holds that if one does not have time to read the entire Ramayana, one should read the Sundara Kandam.</p>
      <div class="quote-block">
        <div class="quote-en">"Instead of trying to remove doshas one by one or seeking individual blessings separately — if you perform daily Sundara Kandam parayanam, all obstacles will dissolve on their own, and all blessings you have not even asked for will come to you."</div>
        <div class="quote-attr">— Sri U.Ve. Velukkudi Krishnan Swami, Sundara Kandam Upanyasam</div>
      </div>
      <p>Spiritual masters teach that each sarga of Sundara Kandam carries the power of great mantras. Regular reading automatically becomes sadhana — gradually bringing you closer to self-realisation and peace.</p>
      <div class="benefits">
        <div class="benefit-card"><div class="benefit-icon">🛡️</div><div class="benefit-title">Removes Obstacles</div><p class="benefit-text">Daily reading dissolves doshas and clears the path of life's difficulties — especially the malefic influence of Saturn.</p></div>
        <div class="benefit-card"><div class="benefit-icon">🙏</div><div class="benefit-title">Deepens Bhakti</div><p class="benefit-text">The depth of Hanuman's devotion to Rama transforms the reader — cultivating unwavering faith and inner strength.</p></div>
        <div class="benefit-card"><div class="benefit-icon">🏠</div><div class="benefit-title">Brings Harmony</div><p class="benefit-text">The Dharmic tradition holds that regular recital brings peace, prosperity and harmony to the entire household.</p></div>
        <div class="benefit-card"><div class="benefit-icon">💡</div><div class="benefit-title">Awakens Wisdom</div><p class="benefit-text">Hanuman's journey represents the soul's search for truth — reading it is the path from ignorance to self-realisation.</p></div>
        <div class="benefit-card"><div class="benefit-icon">🔥</div><div class="benefit-title">Transforms the Mind</div><p class="benefit-text">Reading with true bhava — a melting heart — ends sins and enables what once seemed impossible.</p></div>
        <div class="benefit-card"><div class="benefit-icon">👨‍👩‍👧</div><div class="benefit-title">Unites the Family</div><p class="benefit-text">When a family reads together, the blessings multiply. Hanuman's love for Rama becomes the family's shared devotion.</p></div>
      </div>
    </section>

    <div class="divider"></div>

    <section>
      <div class="section-label">The Journey</div>
      <h2>Five Padalams, One Sacred Story</h2>
      <p>Kambar's Sundara Kandam is organised into five Padalams — sections that trace Hanuman's journey from the shores of India to the heart of Lanka and back.</p>
      <div class="padalams">
        <div class="padalam-row"><div class="padalam-num">1</div><div><div class="padalam-tamil">கடல் தாவு படலம்</div><div class="padalam-en">Crossing the Ocean — Hanuman's legendary leap across the sea</div></div></div>
        <div class="padalam-row"><div class="padalam-num">2</div><div><div class="padalam-tamil">இலங்கை காண் படலம்</div><div class="padalam-en">Seeing Lanka — Entering Ravana's golden city in secret</div></div></div>
        <div class="padalam-row"><div class="padalam-num">3</div><div><div class="padalam-tamil">சீதை தேடு படலம்</div><div class="padalam-en">Searching for Sita — Finding her in the Ashoka grove, giving Rama's ring</div></div></div>
        <div class="padalam-row"><div class="padalam-num">4</div><div><div class="padalam-tamil">தூது படலம்</div><div class="padalam-en">The Embassy — Standing before Ravana, advising him to return Sita</div></div></div>
        <div class="padalam-row"><div class="padalam-num">5</div><div><div class="padalam-tamil">நகர் எரி படலம்</div><div class="padalam-en">Burning of Lanka — Setting Lanka ablaze, returning triumphant to Rama</div></div></div>
      </div>
    </section>

    <div class="divider"></div>

    <section>
      <div class="section-label">Tradition</div>
      <h2>How to Approach the Reading</h2>
      <p>The most important quality in reading Sundara Kandam is <em>bhava</em> — the emotion and devotion you bring. Read not as a literary exercise, but as worship of Hanuman and an offering to Rama and Sita.</p>
      <p>Traditional practice recommends reading on Tuesdays and Saturdays — days consecrated to Hanuman. Light a lamp in your puja room before beginning. One Padalam a day is a gentle, sustainable pace that the whole family can share together.</p>
      <p>Read with understanding — let the Tamil text sing, and let the English meaning open the story in your heart. The amount of Sundara Kandam you read reflects how near you are to God.</p>
      <div class="quote-block">
        <div class="quote-en">"Mother Sita, Messenger Anjaneya, chaste slokas, serene Ashoka Vanam and the in-depth ideology of this part of the Ramayana earned it the name Sundara Kanda. Let us devote time, listen, and accomplish our prayers."</div>
        <div class="quote-attr">— Sri U.Ve. Velukkudi Krishnan Swami, Velukkudi Discourses</div>
      </div>
    </section>

    <div class="final-cta">
      <div class="final-tamil">ஜய் ஸ்ரீராம் 🙏</div>
      <div class="final-sub">Begin your family's daily journey through Sundara Kandam</div>
      <a href="#" class="cta-btn" id="enterBtn2">Start Reading Today →</a>
      <div class="credit">Built by Rajiv Govindan · Inspired by Sri U.Ve. Velukkudi Krishnan Swami's teachings</div>
    </div>

  </div><!-- end #landing -->

  <!-- REACT APP MOUNTS HERE -->
  <div id="root" style="display:none;"></div>

  <script>
    // Scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('section, .benefit-card, .padalam-row, .quote-block').forEach(el => {
      el.style.opacity = '0'; el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
      observer.observe(el);
    });

    // Begin Reading buttons — hide landing, show React app
    document.querySelectorAll('#enterBtn, #enterBtn2').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('landing').style.display = 'none';
        document.getElementById('root').style.display = 'block';
        window.scrollTo(0, 0);
      });
    });
  </script>

</body>
</html>
