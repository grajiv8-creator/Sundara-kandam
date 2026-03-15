import { useState, useEffect, useRef, useCallback } from "react";

// ── Audio helpers ────────────────────────────────────────────────────────────
function playBell() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.5);
    g.gain.setValueAtTime(0.4, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
    o.start(); o.stop(ctx.currentTime + 2);
    // Second harmonic for richness
    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    o2.connect(g2); g2.connect(ctx.destination);
    o2.frequency.setValueAtTime(1320, ctx.currentTime);
    o2.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 1.2);
    g2.gain.setValueAtTime(0.2, ctx.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    o2.start(); o2.stop(ctx.currentTime + 1.5);
  } catch(e) {}
}

function useOmChant(playing) {
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);
  useEffect(() => {
    if (playing) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        ctxRef.current = ctx;
        const freqs = [136.1, 272.2, 408.3];
        freqs.forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sine";
          o.frequency.value = freq;
          g.gain.value = i === 0 ? 0.12 : 0.05;
          o.connect(g); g.connect(ctx.destination);
          o.start();
          nodesRef.current.push(o, g);
        });
      } catch(e) {}
    } else {
      nodesRef.current.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch(e) {} });
      nodesRef.current = [];
      if (ctxRef.current) { try { ctxRef.current.close(); } catch(e) {} ctxRef.current = null; }
    }
    return () => {
      nodesRef.current.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch(e) {} });
      nodesRef.current = [];
      if (ctxRef.current) { try { ctxRef.current.close(); } catch(e) {} ctxRef.current = null; }
    };
  }, [playing]);
}

// ── Streak helper ────────────────────────────────────────────────────────────
function getTodayStr() { return new Date().toISOString().split("T")[0]; }
function getStreak(readDates) {
  if (!readDates || readDates.length === 0) return 0;
  const sorted = [...new Set(readDates)].sort().reverse();
  let streak = 0; let check = new Date();
  for (const d of sorted) {
    const checkStr = check.toISOString().split("T")[0];
    if (d === checkStr) { streak++; check.setDate(check.getDate() - 1); }
    else if (d < checkStr) break;
  }
  return streak;
}

// ── Daily verse helper ───────────────────────────────────────────────────────
function getDailyVerseIndex() {
  const start = new Date("2025-01-01");
  const today = new Date();
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return diff % 62; // 62 total verses
}

function verseFromGlobalIdx(globalIdx) {
  const PADS = [
    { id: 1, totalVerses: 13 }, { id: 2, totalVerses: 11 },
    { id: 3, totalVerses: 13 }, { id: 4, totalVerses: 13 }, { id: 5, totalVerses: 12 },
  ];
  let idx = 0;
  for (const p of PADS) {
    if (globalIdx < idx + p.totalVerses) return { padalamId: p.id, verseNum: globalIdx - idx + 1 };
    idx += p.totalVerses;
  }
  return { padalamId: 5, verseNum: 12 };
}

const PADALAMS = [
  { id: 1, name: "கடல் தாவு படலம்", nameEn: "Crossing the Ocean", totalVerses: 13 },
  { id: 2, name: "இலங்கை காண் படலம்", nameEn: "Seeing Lanka", totalVerses: 11 },
  { id: 3, name: "சீதை தேடு படலம்", nameEn: "Searching for Sita", totalVerses: 13 },
  { id: 4, name: "தூது படலம்", nameEn: "The Embassy", totalVerses: 13 },
  { id: 5, name: "நகர் எரி படலம்", nameEn: "Burning of Lanka", totalVerses: 12 },
];

const PASURAMS = {
  "1": [
    { tamil: "மாருதி யென்னும் வானர வீரன், மலையினும் உயர்ந்த தோளினன், வலியான்;\nகாருடன் வலியோன், கடலினைக் கடந்தான், கங்கையின் வேகத்தோன் எனலாம்;\nவேருடன் பெயர்க்கும் வெற்பினன், ஐயன், வீரத்தின் மூர்த்தி, வெல்பவன்;\nதீருடன் இலங்கை நோக்கினான் அன்று, திண்மையின் திரண்ட தோன்றலே.", english: "Maruti, the valiant monkey hero, with shoulders taller than mountains and mighty as Garuda; swifter than the Ganga's current, he who crossed the great ocean; he who uproots mountains by their very roots, the noble one, embodiment of valor; with firm resolve he gazed toward Lanka — that supreme manifestation of strength.", context: "Hanuman prepares to leap across the ocean to Lanka in search of Sita." },
    { tamil: "திங்களும் சுடரும் தேவரும் வியப்பத், திண்திறல் அனுமன் தாவினான்;\nகங்கையின் ஓட்டம் கடலினில் கலப்பக், கடல்கடந்து உயர்ந்தான் வானிலே;\nதுங்கமாம் மேரு துணுக்குற நின்றான், சூரியன் நிழலில் மறைந்தான்;\nமங்களம் பொருந்தும் மாருதி வீரன், மைந்தன் வாயு தேவன் மைந்தனே.", english: "As the moon, the sun and the devas watched in wonder, mighty Hanuman leaped; as the Ganga merges into the ocean, he rose above the waters into the sky; the great Meru mountain trembled at his might, he disappeared into the shadow of the sun; blessed and auspicious Maruti — the heroic son of Vayu, the wind god.", context: "Hanuman takes his mighty leap across the ocean, astonishing the gods watching from above." },
    { tamil: "வான்வழி செல்லும் வலியோன் அனுமன், வருகின்ற வேகம் புயலென;\nதேன்மலர்ச் சோலை திசைகளில் நடுங்க, திக்கயம் அஞ்சி ஒதுங்கவே;\nமீன்கணம் கலங்க, விண்ணவர் வியப்ப, மேகங்கள் விலகி நின்றனவே;\nகான்முளை அனைய காற்றினன் மைந்தன், கடலினைக் கடந்தான் கம்பனே.", english: "Through the sky path traveled the mighty Hanuman, his speed like a raging storm; honey-flowered gardens in all directions trembled, the elephants of the quarters shrank in fear; fishes were disturbed, heavenly beings marveled, clouds parted and stood aside; swift as a young sprout of grass, the son of the wind crossed the ocean — so sings Kamban.", context: "Hanuman's flight across the ocean causes all of nature to tremble with awe." },
    { tamil: "கடலினைக் கடப்பான் கருத்துடன் எழுந்தான், கைகளை ஆர்த்தான் வீரமாய்;\nமிடலுடை மேரு மலையினைத் தாக்கி, விரைவினில் பறந்தான் வானிலே;\nதடமலர்க் கமலம் தாமரை வாவி, தகர்ந்தது அவன்தாள் வேகத்தால்;\nசுடர்விடு மணிகள் சுடர்தர நின்ற, சுந்தர இலங்கை நோக்கினான்.", english: "With firm resolve he rose to cross the ocean, clapped his mighty arms with heroic spirit; striking the great Meru mountain, he flew swiftly into the sky; lotus ponds were shattered by the speed of his feet; he gazed toward beautiful Lanka, jeweled and radiant with glittering gems.", context: "Hanuman strikes Mount Mahendra with his feet and launches himself toward Lanka." },
    { tamil: "ஐயன் அனுமன் ஆண்டகை வீரன், அலைகடல் கடந்து செல்கையில்;\nமைய மலை என மாநில நடுவே, மைனாகம் எழுந்து வந்ததே;\nசெய்ய கதிர்கள் திகழும் பொன்மலை, சேவல் ஒளிரும் சிகரத்தான்;\nகைகள் நீட்டி அழைத்தது தோழமை, காதலில் வரவேற்கின்றதே.", english: "As the noble Hanuman, that great hero, crossed the wave-tossed ocean; from the middle of the great earth, the Mainaka mountain rose up and came forth; a golden mountain with bright rays, with crests glowing like the sun; it stretched out its arms in friendship, welcoming him with deep affection.", context: "The Mainaka mountain rises from the ocean to offer rest and hospitality to Hanuman." },
    { tamil: "மேல்வரும் மலையை மெய்யன்பால் நோக்கி, மேலோன் அனுமன் இன்னவை;\nசொல்லினன் நின்று தொழுதுரைத்தானே, தோழமை மகிழ்ந்து நன்றியால்;\nவல்லமை கொண்டோன் வாரி கடந்தே, வாலியை வென்ற ஐயனுக்கு;\nநல்லது செய்வேன் நாடுமிடத்தே, நன்றிகள் சொல்வேன் என்றதே.", english: "Seeing the mountain that came toward him with true love, the noble Hanuman spoke thus; he stood and said with reverence, rejoicing in the friendship with gratitude; the mighty one said: I shall cross this ocean for the lord who vanquished Vali; I shall do good wherever I am called upon — said the mountain in gratitude.", context: "Hanuman politely declines Mainaka's offer of rest, saying he must complete his mission first." },
    { tamil: "சுரர்கள் அனைவரும் துதிக்கவே நின்று, சூழ்வான் வழியே சென்றவன்;\nவரமது பெற்ற வானர சிரேஷ்டன், வலிமையில் வென்றான் சூரசை;\nகரமது கொண்டு கவர்ந்தவள் வாயில், காற்றின் மைந்தன் புகுந்தனன்;\nதிரமுடன் வெளியே வந்தனன் வீரன், திகழ்ந்தனன் மாருதி தேவனே.", english: "As all the devas stood and praised him, he traveled along the celestial path; the best of monkeys who had received great boons, he defeated Surasa by his might; entering her wide-open mouth with his hands, the son of the wind god entered within; with steadfast courage the hero emerged outside — the divine Maruti shone forth.", context: "Hanuman outwits the demoness Surasa who was sent to test him, entering and exiting her mouth." },
    { tamil: "அங்கர தாரா என்னும் அரக்கி, அடியவன் நிழலைப் பற்றினாள்;\nசங்கரன் அருளால் தவமுடி பெற்றாள், சாவை விரும்பும் சதியினாள்;\nமங்கலம் இல்லா மாயவி தன்னை, மாருதி மாய்த்தான் வீரமாய்;\nதுங்கமாம் இலங்கை தூரத்தில் தெரிந்தே, தோன்றியது அழகு நகரமே.", english: "The demoness Angaradhara seized the shadow of the servant of the lord; she had received boons through penance by Shankara's grace but desired only death through trickery; the inauspicious enchantress was slain by Maruti with great valor; in the distance the great Lanka appeared — the beautiful city came into view.", context: "Hanuman kills the demoness Simhika who tried to catch his shadow, then spots Lanka ahead." },
    { tamil: "கானகம் சூழ்ந்த கடல்கரை நோக்கி, காற்றின் மகன் தான் இறங்கினான்;\nவான்தரும் வண்மை வடிவுடை இலங்கை, வளமையின் மிக்கு விளங்கினாள்;\nஆனவன் சிறியதாய் உருவம் மாறி, அரக்கர் நகர் புகுந்தனன்;\nதேனருவி தேவர் ஏத்தினர் வியந்தே, திண்ணிய வீரன் நுழைந்தனன்.", english: "Gazing at the ocean shore surrounded by forests, the son of the wind descended; Lanka, abundant in heavenly riches and glorious in her prosperity, shone brilliantly; the mighty one shrank himself into a tiny form and entered the city of the demons; the devas praised him in wonder as the steadfast hero entered.", context: "Hanuman shrinks himself to a tiny form and enters the heavily guarded city of Lanka." },
    { tamil: "இரவினில் புகுந்தான் இலங்கையில் ஐயன், எங்கும் தேடினான் சீதையை;\nதிரமுடன் காத்த தேவியை நினைத்தே, திரண்ட மனத்தோன் கண்ணீரால்;\nவரமுடை அரக்கர் வாழ்நகர் முழுதும், வழியெலாம் தேடி மீண்டனன்;\nகருமுகில் வண்ணன் காதலி காணான், கலங்கினன் மாருதி தேவனே.", english: "At night the noble one entered Lanka and searched everywhere for Sita; thinking of the steadfast goddess who was guarded with great determination, the brave-hearted one shed tears; through the entire city of the powerful demons, along every path he searched and returned; not finding the beloved of the dark-cloud-hued lord, Maruti the divine was distraught.", context: "Hanuman searches all through Lanka at night but cannot find Sita anywhere." },
    { tamil: "அரண்மனை எங்கும் ஆய்ந்தவன் நின்று, அகத்துயர் மிகவும் கொண்டனன்;\nகரன் முதல் வீரர் காவலர் மத்தில், கண்துயில் கொண்டோர் நடுவிலே;\nவரன்முறை சிந்தை மாறாத நம்பி, வானர வேந்தன் மீண்டனன்;\nதரணியில் விழாமல் தாவியே சென்றான், தத்துவன் சோலை நோக்கினான்.", english: "Having searched the entire palace, he stood filled with deep inner sorrow; amidst the guards and sleeping warriors, among those who slept; with unwavering faith the steadfast devotee, the lord of monkeys, turned back; without touching the earth, leaping forward he went — that truth-seeker looked toward the garden.", context: "After searching the palace in vain, Hanuman turns toward the Ashoka grove." },
    { tamil: "சோலையில் புகுந்தான் சுந்தரன் வீரன், சூழ்ந்த மரங்கள் வணங்கினவே;\nகோலமாம் மலர்கள் கொத்தொடு சிரித்தே, கூறும் வழியை காட்டினவே;\nஆலமும் அரசும் அடர்ந்த வனத்தில், அன்னையை தேடி நடந்தனன்;\nமாலவன் துணைவி மாதவி சோலை, மாருதி கண்டான் அங்கணே.", english: "The beautiful hero entered the grove, surrounding trees bowed in reverence; colorful flowers laughed in clusters and seemed to show him the way; through forests dense with banyan and pipal trees, he walked searching for the mother; the grove where Vishnu's consort dwelt — there Maruti found her at last.", context: "Hanuman enters the Ashoka grove and the trees and flowers seem to guide him toward Sita." },
    { tamil: "அசோக வனத்தில் ஆழ்ந்த நடுவே, அன்னை சீதை அமர்ந்திருந்தாள்;\nவிசோக மனத்தோன் வியந்து நோக்கினான், வீரன் அனுமன் கண்கள் குளிர்ந்தே;\nதேசமெங்கும் தேடிய பயணம் முடிந்தே, திருவுளம் மகிழ்ந்தான் காற்றினன்;\nஆசையின் முடிவில் ஐயன் ராமனின், அன்புடைத் தேவியை கண்டனன்.", english: "Deep within the Ashoka grove, the mother Sita was seated; the sorrowless-hearted one marveled and looked, the hero Hanuman's eyes filled with joy; the journey of searching across the world was complete, the son of the wind rejoiced in his heart; at the end of longing, he found the beloved goddess of the noble Rama.", context: "Hanuman finally finds Sita seated in the heart of the Ashoka grove — his long search is over." },
  ],
  "2": [
    { tamil: "இலங்கையின் வடிவம் எண்ணரும் செல்வம், இமையவர் வியக்கும் வண்ணமே;\nமலங்கலில் கோட்டை மதில்கள் பொன்னாலே, மாளிகை முத்தும் மணியுமே;\nகலங்கல் இல்லாத காவல் வீரர்கள், கடுமையாய் காத்து நிற்கவே;\nதலைமையான் இலங்கை தரிசிக்க நின்றான், தாவிய வீரன் அனுமனே.", english: "Lanka's form, her immeasurable wealth, in a manner that amazes even the immortals; fortress walls of gold, palaces studded with pearls and gems; unperturbed guards and fierce sentinels standing watch; standing to behold the great Lanka, was Hanuman the leaping hero.", context: "Hanuman surveys the magnificent city of Lanka from a distance before entering." },
    { tamil: "பொன்னரண் மதிலும் புரிசையும் நோக்கி, புலவன் அனுமன் சிந்தித்தான்;\nமன்னவன் ராமன் மனத்தினில் நினைந்தே, மாதவன் தாளை வணங்கினான்;\nசின்னமாய் உருவம் சிறுத்துக்கொண்டு அங்கே, சேவலை ஒத்தான் மாருதி;\nதுன்னிய இலங்கை நகர்க்குள் புகுந்தான், தூதனாய் வந்த வீரனே.", english: "Seeing the golden fortress walls and the ramparts, the learned Hanuman contemplated; thinking of King Rama in his heart, he bowed to the feet of Madhava; shrinking his form to become tiny, Maruti resembled a small bird; he entered the densely guarded city of Lanka — that hero who came as an emissary.", context: "Hanuman meditates on Rama, then shrinks himself small to enter Lanka undetected." },
    { tamil: "நகரினில் நடந்தான் நலமுடை வீரன், நான்கு திசையும் நோக்கினான்;\nபகரும் செல்வம் பரந்திட கண்டான், பட்டினம் முழுதும் சுற்றினான்;\nமகரமும் வாரி மலைகளும் ஒத்த, மாளிகை கண்டான் பலவினை;\nதகரமும் தங்கமும் தாழ்வர தெரிந்த, தண்ணிய மாட வீதியே.", english: "The virtuous hero walked through the city, surveying in all four directions; he saw wealth spread abundantly, he circled the entire city; he saw many palaces that resembled mountains and the ocean's makara fish; he noticed streets of mansions where copper and gold gleamed at every level.", context: "Hanuman explores the magnificent streets of Lanka, marveling at its extraordinary wealth." },
    { tamil: "இந்திரன் அமர்ந்த அமரர் நகரினும், இலங்கை மேம்பட்டு விளங்கினாள்;\nசுந்தரம் நிறைந்த சோலைகள் மத்தில், சுரர்மகள் ஒத்த மாதரார்;\nமந்தரம் கடைந்த மாதவர் வாழும், மாட மாளிகை நிறைந்ததே;\nகந்தமும் தூபமும் கமழும் நகரில், கலந்தது மகிழ்ச்சி ஓசையே.", english: "Even surpassing Indra's city of the immortals, Lanka shone with greater splendor; in gardens filled with beauty, women resembling daughters of the gods; mansions and palaces where sages who churned Mount Mandara dwelt were in abundance; in that city fragrant with perfumes and incense, the sounds of joy mingled everywhere.", context: "Hanuman is amazed by Lanka's beauty, finding it even more magnificent than Indra's heaven." },
    { tamil: "அரக்கர் குலத்தோர் ஆடல் பாடலால், அழகிய நகரில் வாழ்கின்றார்;\nகரக்கலம் ஓட்டும் கடல்வரை நாடன், காவல் கொண்டு ஆள்கின்றான்;\nவரக்கடவு தெய்வம் வாழ்த்தியே நிற்க, வஞ்சர் நகர் சுற்றி வந்தனன்;\nதிரைக்கடல் படைத்த தென்னவன் தூதன், திண்ணிய மாருதி திரிந்தனன்.", english: "The demon clan lives in song and dance in the beautiful city; the ruler of the land extending to the sea holds sway; as the gods who grant boons stood in praise, he circled the city of the deceitful; the messenger of the lord of the wave-crested ocean — steadfast Maruti wandered.", context: "Hanuman wanders through Lanka observing the demon inhabitants living in luxury." },
    { tamil: "மாட வீதியில் மணிகள் சிதறி, மஞ்சளும் குங்குமம் கமழவே;\nகோட நிலவொளி கோபுரம் தன்னில், கொடிகள் வீசினவே காற்றினால்;\nஆட அரம்பையர் அணிகலன் ஒலிக்க, அழகிய பாடல் கேட்கவே;\nதேட வந்தவன் தேவியை நினைந்தே, திகைக்கும் நெஞ்சோடு நடந்தனன்.", english: "Gems scattered in the mansion streets as turmeric and saffron wafted their fragrance; on the towers where moonlight curved, flags waved in the breeze; as celestial dancers danced with jingling ornaments, beautiful songs could be heard; the one who came searching, thinking of the goddess, walked with a trembling heart.", context: "Hanuman walks through Lanka's magnificent streets thinking of Sita and growing anxious." },
    { tamil: "இரவணன் அரண்மனை எழில்மிகு கோயில், என்ன சொல்வேன் அழகினை;\nவரமுடை தேவர் வாழுமிடத்தும், வையகம் கண்டதில்லையே;\nகரமுடை வீரர் காவல் கொண்டு நிற்க, கல்யாண மாளிகை கண்டனன்;\nதிரமுடை மாருதி திரிந்து திரிந்தே, தேடினான் சீதையை அன்றே.", english: "Ravana's palace, that temple of surpassing beauty — what can I say of its splendor; even in the abodes where the blessed gods dwell, the world has not seen its like; with powerful armed guards standing watch, he found the auspicious palace; the steadfast Maruti wandered and wandered, searching for Sita then.", context: "Hanuman is awestruck by Ravana's magnificent palace as he searches it for Sita." },
    { tamil: "புட்பக விமானம் பொன்னிறம் கொண்டு, பொலிவுடன் நிற்கும் ஓரிடத்தே;\nகட்புலன் கவரும் காட்சியை கண்டான், கலைமகள் ஏத்தும் வண்ணமே;\nவிட்டலன் மாயோன் விரும்பும் கோவிலில், வீற்றிருந்தான் அரக்கனே;\nமட்டிலா மாட மகளிர் சூழ்ந்திட, மன்னவன் ஆடல் கண்டனன்.", english: "The Pushpaka Vimana stood in golden glory in one place radiantly; he saw a sight that captured all the senses, worthy of Saraswati's praise; in a temple beloved by Vishnu the dark-hued lord, the demon king was seated; surrounded by women of exquisite mansions, he watched the king's performance.", context: "Hanuman discovers Ravana's court with the magnificent Pushpaka Vimana and watches Ravana." },
    { tamil: "பத்துத் தலைகளும் பகட்டமாய் விளங்க, பாரமாம் தோள்கள் இருபதும்;\nமுத்தொளி மணிகள் மின்னிட அணிந்தே, முரண்பட நிற்கும் வீரனே;\nசித்திர வண்ணம் சேர்ந்திட உடுத்தே, சிரமுடி தரித்த அரக்கனே;\nமத்தகம் பணியும் மன்னவர் தாளில், வாகையின் மாலை அணிந்தானே.", english: "His ten heads shining with magnificence, his twenty broad powerful shoulders; adorned with pearls and gems glittering with triple luster, standing in fierce defiance; dressed in colorful garments, the demon adorned with crown on his heads; at whose feet kings bow their heads — he who wore the garland of victory.", context: "Hanuman observes the mighty Ravana in his court, describing his ten heads and awesome presence." },
    { tamil: "உறங்கிய அரக்கர் ஓரத்தில் நின்று, ஓர்ந்தனன் காற்றின் மைந்தனே;\nமறைந்திருந்து எங்கும் மாதவன் துணைவி, மாட்சிமை கொண்டாள் எங்கெனா;\nசிறந்தவள் சீதை சென்ற இடம் தேடி, தீவிரம் கொண்டு நடந்தனன்;\nகுறைவிலா மாருதி கோலமாம் தோட்டம், கண்டனன் அசோக வனத்தையே.", english: "Standing at the side of sleeping demons, the son of the wind pondered; wherever he searched hiding — where was Madhava's consort of great glory; searching for the place where the excellent Sita had gone, with great urgency he walked; the faultless Maruti then found the beautiful garden — he found the Ashoka forest.", context: "Hanuman, having failed to find Sita in the palace, finally discovers the Ashoka grove." },
    { tamil: "அசோக மரங்கள் அணிவகுத்து நிற்க, அழகிய மலர்கள் மணம்பொழிய;\nவிசோகமில் வண்டு விரைவுடன் பாட, விரும்பிய பூக்கள் மலர்ந்திட;\nகசோகமில் கிளிகள் களிப்புடன் பேச, கருடன் ஒத்த மரங்கள் தாம்;\nதிசோர்ந்து நிற்கும் தேவியை தேடி, திரிந்தனன் மாருதி சோலையே.", english: "Ashoka trees standing in beautiful rows, lovely flowers shedding their fragrance; bees without sorrow singing swiftly, desired flowers blooming; parrots speaking joyfully without grief, trees that resembled Garuda; searching for the goddess standing disoriented, Maruti wandered through the grove.", context: "Hanuman searches through the beautiful Ashoka grove with its blooming flowers and singing birds." },
  ],
  "3": [
    { tamil: "அசோக வனத்தில் அழகிய மரத்தின், அடியில் வீற்றிருந்தாள் சீதையே;\nவசம்படாத் தன்மை வஞ்சர் கண்முன்னே, வையம் போல் நிலைத்து நின்றனள்;\nதிசைமுகன் தங்கை போல் திகழும் வண்ணமும், தீ என்னும் ஒளிவீசினாள்;\nமசகலில் கூந்தல் மாலை போட்டுழலும், மாதவன் துணைவி மானினே.", english: "In the Ashoka grove, beneath a beautiful tree, Sita was seated; in her nature of not surrendering, before the deceitful demons, she stood firm like the earth itself; shining like the sister of Brahma who faces all directions, she radiated like fire; with disheveled hair hanging loose in a braid — Madhava's consort, graceful as a deer.", context: "Hanuman finally finds Sita seated beneath an Ashoka tree, disheveled but radiating inner strength." },
    { tamil: "கண்ணீர் வடிக்கும் கமலக் கண்களாள், கலங்கிய மனத்தின் மாதரே;\nமண்ணில் விழாமல் மரத்தின் கீழமர்ந்தாள், மாதவன் தாளை நினைந்தே;\nவிண்ணில் வாழும் தேவர் வியந்து நோக்க, விரலால் தரையில் கோலமே;\nபண்ணினள் அன்று பாரினில் ஐயன், பணியும் தேவியை கண்டனன்.", english: "Her lotus eyes shedding tears, that lady of troubled heart; without falling to the ground she sat beneath the tree, thinking of Madhava's feet; as the gods dwelling in the sky watched in wonder, with her finger she drew patterns in the earth; so she was then — the goddess who bows to the lord, he found her on that ground.", context: "Hanuman observes Sita weeping, drawing patterns in the earth and meditating on Rama's feet." },
    { tamil: "அரக்கியர் சூழ்ந்த அவலமாம் இடத்தில், அஞ்சிடாள் தேவி சீதையே;\nவரக்கடவு தேவர் வாழ்த்தினும் கலங்காள், வையகம் தாங்கும் வல்லவள்;\nகரக்கலம் ஓட்டும் கடவுளின் மனைவி, கற்புடை இலக்குமி ஒத்தவள்;\nதிரைக்கடல் சூழ்ந்த திக்கினில் யாரும், திரும்பிப் பார்க்கவே நின்றனர்.", english: "In that sorrowful place surrounded by demonesses, the goddess Sita had no fear; even as gods who grant boons praised her, she was not disturbed — she who bears the world in strength; the wife of the lord who steers ships through the ocean, chaste as Lakshmi herself; in all directions surrounded by the wave-crested ocean, all turned to look upon her.", context: "Despite being surrounded by demonesses, Sita remains fearless and composed, like Lakshmi." },
    { tamil: "மரத்தின் மேல் இருந்து மாருதி தேவி, மாட்சிமை கண்டு வியந்தனன்;\nகரத்தினில் கூப்பி கண்ணீர் வடித்தே, காற்றின் மைந்தன் நினைந்தனன்;\nவரத்தினில் வீரன் வாலி வென்ற ஐயன், வனத்தில் அழும் காதலி இவளே;\nதிரத்தினில் தவஞ்செய் திண்மையோன் மனைவி, தேவியே இவள் என்றனன்.", english: "From atop the tree, Maruti saw the goddess's glory and marveled; with folded hands he shed tears, the son of the wind contemplated; this must be the beloved who weeps in the forest for the lord who won the boon of defeating Vali; this is indeed the wife of the steadfast one who performs penance with firmness — this is the goddess, he said.", context: "Hanuman watches Sita from a tree and realizes with certainty that he has found Rama's wife." },
    { tamil: "இராவணன் வருகை இன்னல் தந்திட்டே, இரக்கமில் வார்த்தை சொல்லவே;\nதிராவிட மொழியில் தேவி மறுத்தாள், திட்டமாய் நின்றாள் அஞ்சாமல்;\nவராகமுன் வென்ற வல்லவன் மனைவி, வஞ்சனை அஞ்சாள் என்றனள்;\nகரா வென்ற வீரன் கண்வளர் மனைவி, கடவுளுக்கு ஒப்பான் என்றனள்.", english: "Ravana's arrival brought suffering, speaking words without mercy; in the Tamil tongue the goddess refused, she stood firmly without fear; the wife of the mighty one who defeated the boar — she said she feared no treachery; the wife of the hero who defeated the crocodile, she said her husband is equal to the gods.", context: "Ravana approaches Sita with cruel words, but she fearlessly rejects him, praising Rama's divine nature." },
    { tamil: "அஞ்சல் என்று சொல்ல அரக்கன் மறுத்தே, அடங்கு என்று கோபம் கொண்டனன்;\nமஞ்சள் வண்ண மேனி மாதவன் துணைவி, மாறாத் தன்மையில் நின்றனள்;\nவிஞ்சியவர் விரைந்து வேண்டியே நின்றார், வேலையால் பலனில்லை என்றனர்;\nகஞ்சமலர் கண்ணாள் கவலையில் இருக்க, காலம் கொடுத்தான் அரக்கனே.", english: "When told 'Fear not', the demon refused and in anger said 'Submit'; the goddess, yellow-hued consort of Madhava, stood in her unchanging nature; those who surpassed in wisdom came quickly and begged him, saying force will yield no fruit; as the lotus-eyed one remained in her sorrow, the demon gave her time.", context: "Ravana angrily demands Sita's submission, but wise counselors convince him to give her more time." },
    { tamil: "இரக்கியர் மிரட்ட இடர்ப்படும் தேவி, ஏங்கினாள் அழுதாள் மனத்திலே;\nவரக்கடவு ராமன் வாராவிடில் என்ன, வாழ்வதில் பயனில்லை என்றனள்;\nகரக்கலம் ஓட்டும் காற்றவன் மைந்தன், கண்ணீருடன் கேட்டு நின்றனன்;\nதிரக்கமுடன் தேவி தீயினில் விழவே, திண்ணென நினைக்கவே கண்டனன்.", english: "As the demonesses threatened, the goddess in distress wept with an aching heart; if the boon-giver Rama does not come, she said, there is no purpose in living; the son of the wind stood listening with tears; he saw the goddess firmly resolving to throw herself into the fire with great determination.", context: "Sita despairs as demonesses threaten her and she contemplates ending her life if Rama doesn't come." },
    { tamil: "தூக்கமில் இரவில் துயர்கொள் தேவியை, தூதன் அனுமன் நோக்கினான்;\nஆக்கமில் அரக்கி அலர்ந்த வாய் தன்னில், அஞ்சிய மான் போல் நடுங்கினாள்;\nவாக்கினில் வல்லான் வால்மீகி காவியம், வழிகாட்ட மனம் திண்ணமாய்;\nதேக்கமில் தேவி தெரியும் வண்ணமே, தெளிந்தனன் மாருதி மெல்லவே.", english: "In the sleepless night, the messenger Hanuman watched the goddess in grief; like a frightened deer she trembled before the demoness with wide-open mouth; through the power of Valmiki's poem to guide him, with firm resolve; so that the goddess in distress would understand — Maruti slowly became calm.", context: "Hanuman watches the frightened Sita through the night and decides to reveal himself carefully." },
    { tamil: "ராமன் புகழை இராமகீதமாக, மரத்தில் இருந்து பாடினான்;\nதாமரை மலரும் தாயினை ஒத்தாள், தயங்கி நடுங்கி நின்றனள்;\nகாமர் வண்ண ஐயன் கதையை கேட்டே, கலங்கிய நெஞ்சம் தெளிந்ததே;\nஆமென ஐயோ யாரிது என்றனள், அனுமன் வருகை கண்டனள்.", english: "He sang the praise of Rama as a Ramageetam from atop the tree; she who resembled a lotus-bearing mother wavered and stood trembling; hearing the story of the handsome lord, her troubled heart found clarity; saying 'Yes, alas, who is this?' — she found Hanuman's coming.", context: "Hanuman sings Rama's praises from the tree, causing the grieving Sita to look up in wonder." },
    { tamil: "இறங்கினான் மரத்தில் இருந்து வீரன், இரு கரம் தொழுது நின்றனன்;\nமறைந்திருந்த மாருதி மகிழ்ச்சியுடன், மாதவன் தூதன் என்றனன்;\nசிறந்தவன் ராமன் திரு மோதிரத்தை, சீதைக்கு நீட்டி நின்றனன்;\nகுறைவிலா தேவி கொண்டு கண்ணீராள், கோமகன் ஐயன் மோதிரமே.", english: "The hero descended from the tree, stood with both hands folded in reverence; the hidden Maruti with great joy said: I am Madhava's messenger; he stretched out the excellent Rama's sacred ring and presented it to Sita; the flawless goddess took it and wept — the ring of the prince, the noble lord.", context: "Hanuman descends, reveals himself as Rama's messenger, and presents Sita with Rama's signet ring." },
    { tamil: "மோதிரம் கண்டாள் மொழிந்தனள் தேவி, முகம்மலர்ந்து மகிழ்ந்தனள்;\nதாதனாம் அனுமன் தன்மைகள் கேட்டாள், தன்னுடை துயரை கூறினாள்;\nபாதகன் இலங்கை பத்தினி நிலையில், பண்புடன் நின்றேன் என்றனள்;\nஏதமில் வீரன் என் நாதன் வருவான், இன்றிலை நாளை வருவனே.", english: "Seeing the ring the goddess spoke, her face blossomed with joy; she heard about Hanuman the messenger's qualities and told him of her sorrow; in Lanka of the sinners, in the state of a faithful wife, she said she stood with virtue; the faultless hero, my lord, will come — not today but tomorrow he will come.", context: "Sita recognizes Rama's ring, hears about Hanuman, shares her sorrows, and expresses faith in Rama." },
    { tamil: "கூந்தல் மணி ஒன்று கொடுத்தனள் தேவி, குறியாக கொண்டு போ என்றனள்;\nவேந்தன் அனுமன் வினைமுடிப் பதற்கே, வினையோடு செல்வேன் என்றனன்;\nதேந்தன மலர்கள் தேவியை சூழ்ந்த, திவ்யமாம் சோலை நின்றதே;\nஆந்தமில் வீரன் ஐயன் வருவான், அன்னையே அஞ்சேல் என்றனன்.", english: "The goddess gave one hair ornament and said: take this as a token; King Hanuman said: to complete this mission, I shall go with purposeful action; the honey-sweet flowers that surrounded the goddess — the divine grove stood there; the boundless hero, the lord, shall come — Mother, fear not, he said.", context: "Sita gives Hanuman her hair ornament as a token for Rama, and Hanuman reassures her before departing." },
    { tamil: "விடைகொண்டான் மாருதி விரைவுடனே, விண்ணுலகு நோக்கி உயர்ந்தனன்;\nகடைகொண்ட கண்ணாள் கண்டனள் அவனை, கலங்கிய நெஞ்சம் தெளிந்ததே;\nதடைகொள்ளும் வரை தன் நாதன் வருவான், தரணி காக்கும் ராமன் என்றனள்;\nவிடைகொண்ட தேவி விரைவில் பார்க்க, வீரன் மறைந்தான் வானினிலே.", english: "Hanuman took leave swiftly and rose toward the heavenly sky; the lotus-eyed goddess watched him, her troubled heart found peace; until all obstacles are removed my lord shall come — Rama who protects the earth, she said; as the goddess who had given leave looked on quickly, the hero disappeared into the sky.", context: "Hanuman takes his leave of Sita and rises back into the sky as she watches with a heart at peace." },
  ],
  "4": [
    { tamil: "தூதுவன் அனுமன் தொழும் தன்மையோடு, தோட்டம் அழித்தான் வீரமாய்;\nஊதுவன் என்னும் உண்மை காட்டவே, உறுதியின் வலிமை புரிவிக்க;\nதீதுவர் அரக்கர் திரண்டு வந்தாலும், திகைக்கவே வென்றான் மாருதி;\nமேதுவர் மரங்கள் வேரோடு கலைத்தே, மேவிய வனத்தை அழித்தனன்.", english: "The messenger Hanuman with reverent nature, destroyed the garden with great valor; to show the truth of what a messenger is, to make them understand the strength of resolve; even when evil demons came assembled in crowds, Maruti won causing them confusion; uprooting trees from their roots, he destroyed the grove he had entered.", context: "After meeting Sita, Hanuman deliberately destroys the Ashoka grove to provoke Ravana's forces." },
    { tamil: "அக்கும்ர புத்திரன் அரக்கர் படையுடன், அண்ணல் அனுமன் மேல் வந்தான்;\nதக்க வீரர் தம்மை தாக்கிட, தரையில் வீழ்த்தினான் மாருதி;\nமிக்கவன் இராவணன் மைந்தனும் வந்தான், மேவினான் வலிமை மிக்கவன்;\nசிக்கெனப் பிடித்து சீரழித்தே நின்றான், சிரம் அறுத்தான் வீரத்தினால்.", english: "Akshakumara, the demon son, came with an army upon the noble Hanuman; the valiant warriors who came to attack, Maruti threw them to the ground; the mighty Ravana's son also came, the exceedingly powerful one approached; seizing him firmly and destroying his glory, Hanuman stood — he severed his head by his valor.", context: "Hanuman fights and kills Aksha Kumar, Ravana's son, along with many demon soldiers." },
    { tamil: "இந்திரசித்தன் இலக்கினம் தொடுத்தே, ஐயனை கட்டினான் மாயமாய்;\nமந்திர ஆயுதம் வலியோன் தாங்கி, மாருதி நடந்தான் மன்னவன்முன்;\nசுந்தர வடிவன் சூழ்ச்சியுடன் நின்று, சொல்வன்மை கொண்டு நின்றனன்;\nகந்தர்வ வீரன் கட்டுவிட்டு நடந்தே, காட்டினான் ஐயன் முன்னிலை.", english: "Indrajit released the Brahmastra binding spell, bound the noble one through his magic; bearing the magical weapon the mighty one endured, Maruti walked before the king; the beautiful formed one stood with strategy, stood with power of speech; the Gandharva hero was freed from binding and walked, showing himself before the lord.", context: "Indrajit uses the Brahmastra to bind Hanuman, who is then brought before Ravana's court." },
    { tamil: "மன்னவன் இராவணன் முன்னே நிலைத்து, மாருதி பேசினான் தெளிவாய்;\nசொன்னவன் வார்த்தை சூழ்ச்சியில் கேட்டே, சோர்வுற்றான் அரக்கர் மன்னவன்;\nகன்னல் போல் இனிய காவியம் சொன்னான், கண்கோடி கொண்ட மாயவன்;\nபன்னினான் பலவும் பாரினில் ஒருவன், பகுத்தறிந்து சொன்னான் வீரனே.", english: "Standing before King Ravana, Maruti spoke with clarity; hearing the words spoken with strategy, the king of demons was unsettled; he spoke poetry sweet as sugarcane, the enchanting one with a million eyes; the one unique in the world spoke of many things, the hero spoke with discriminating wisdom.", context: "Hanuman stands before Ravana's court and delivers a powerful speech advising him to return Sita." },
    { tamil: "ராமனை அறிவாய் இராவணா என்றே, ரகுவீரன் சீதை கணவனே;\nகாமனை வென்றோன் கரிய மேனியோன், கவிகளில் சிரேஷ்டன் வானரம்;\nதாமரை மலரும் தடக்கை வீரனின், தாளடி தொழுது பணிவாயே;\nமாமதி கொண்டோன் வஞ்சனை விடுத்தே, மாண்புடன் வாழ்வாய் என்றனன்.", english: "Know Rama, O Ravana — the husband of Sita, the consort of the Raghu hero; the one who conquered Kama, the dark-bodied one, the best among the forest of monkeys; bowing at the lotus-flowering large hands of that hero's feet in reverence; the one of great wisdom — abandon your deceit, and live with dignity, he said.", context: "Hanuman advises Ravana to acknowledge Rama's supremacy and return Sita to live honorably." },
    { tamil: "கேளாத அரக்கன் கோபம் கொண்டு அன்று, கொல்லுக என்று ஆணை இட்டனன்;\nவேளாண்மை விட்டு விபீஷணன் வந்தே, விரைந்து வேண்டி நின்றனன்;\nதாளாண்மை கொண்ட தம்பி சொல்லினால், தண்டிக்க வேண்டாம் என்றனன்;\nமீளாத அரக்கன் வால் எரிக்கவே, மேலான் ஆணையை கொடுத்தனன்.", english: "The unhearing demon grew angry then, he gave the order: kill him; abandoning agriculture Vibhishana came quickly and stood begging; through the words of the steadfast younger brother, he said: do not punish; the irrevocable demon ordered instead that his tail be set on fire.", context: "Ravana orders Hanuman's death but Vibhishana intervenes, and Ravana instead orders his tail burned." },
    { tamil: "வாலில் நெருப்பை வைத்தனர் அரக்கர், வலிமையோன் சிரித்தான் மனத்திலே;\nகாலில் கட்டிய பட்டம் கழற்றாமல், காற்றின் மைந்தன் நடந்தனன்;\nமாலவன் தாளை மனத்தில் வணங்கி, மாற்றமில் நின்றான் வீரனே;\nவேலை கடந்த வீரனின் வாலில், வெய்ய நெருப்பு விளங்கியதே.", english: "The demons set fire to his tail, the mighty one laughed within his heart; without removing the bonds tied to his feet, the son of the wind walked; worshipping Malavan's feet in his heart, the hero stood unchanging; in the tail of the hero who crossed the ocean, the fierce fire blazed brilliantly.", context: "The demons set Hanuman's tail on fire, but he remains calm, meditating on Rama, and the fire blazes." },
    { tamil: "நகரெரித்தான் நல்லவன் அனுமன், நல்யோகம் கொண்ட வீரனே;\nமகரமும் கோளும் மாறிட நின்றே, மாளிகை தோறும் தீ வளர்ந்தே;\nதகர்ந்தது இலங்கை தழல் கொண்டிட்டே, தயங்கிட நின்று அலறினர்;\nவிகடமான் வீரன் வீதிவீதியாக, வேகமாய் சென்றான் தீயிட்டே.", english: "The good Hanuman burned the city, that hero of blessed yoga; as the makara fish and the planets changed position, fire grew in every mansion; Lanka was shattered as it caught fire, they stood wavering and cried out; the heroic one of great power went street by street, quickly setting fire everywhere.", context: "Hanuman uses his burning tail to set fire to Lanka, burning it street by street in revenge." },
    { tamil: "நெருப்பினில் நின்றும் நிலைக்கும் அசோகம், நேர்மையின் நெறியில் சீதையே;\nகருப்பு நெருப்பும் கருணை கொண்டிட்டே, கனிந்தது சீதை நலமாக;\nதிருப்பி அனுமன் தேவியை நோக்கி, திகழ்ந்தது அன்னையின் நலம்போல்;\nவருத்தமில் தேவி வாழ்வாள் என்பதை, வல்லவன் கண்டு மகிழ்ந்தனன்.", english: "The Ashoka tree standing amid fire, Sita in the path of righteousness; even the dark fire showed mercy and yielded kindly to Sita's wellbeing; turning back Hanuman looked upon the goddess, the mother's welfare shone; seeing that the goddess without sorrow shall live, the mighty one rejoiced.", context: "Hanuman looks back to ensure Sita is safe in the Ashoka grove while Lanka burns around her." },
    { tamil: "கடலினைக் கடந்தான் காற்றின் மைந்தன், கண்ணகல் ஓட்டத்தினிலே;\nமடலுடை வீரர் மாருதி வருகை, மனம்மகிழ்ந்து எதிர்கொண்டனர்;\nதடமுடை அங்கதன் தலைமை வானரர், தன்னலம் கொண்டே வந்தனர்;\nவிடலுடை வீரன் விரைவுடன் வந்தே, வீரர்க்கு மகிழ்ச்சி தந்தனன்.", english: "The son of the wind crossed the ocean, in the wide flowing stream; the heroic warriors rejoiced and received Maruti's arrival; Angada of the broad presence, the chief monkeys, came with self-interest fulfilled; the hero without laziness came quickly, and brought joy to all the warriors.", context: "Hanuman successfully crosses back over the ocean and is joyfully received by the waiting monkey army." },
    { tamil: "அனுமன் வருகை ஆர்ப்பரிப்புடனே, அங்கதன் முன்னே உரைத்தனன்;\nதினமணி ஒளிரும் திரு நயனத்தாள், தீர்க்கமாய் வாழ்கின்றாள் என்றனன்;\nமனமகிழ் ஆரவாரம் மலைபோல் எழுந்தே, மண்ணதிர் மகிழ்ச்சி கூட்டினர்;\nவினைமுடி வீரன் விரைவுடன் சென்றே, வேந்தன் ராமன் முன் நின்றனன்.", english: "Hanuman's arrival with great rejoicing, he reported before Angada; she of the auspicious eyes that shine like the daily sun, lives with resolve, he said; the joy of the heart rose like a mountain with great clamor, they celebrated with earth-shaking happiness; the hero of accomplished mission went swiftly, stood before King Rama.", context: "Hanuman reports to Angada and the monkey army that Sita lives, causing tremendous celebration." },
    { tamil: "ராமன் முன்னே நின்று மாருதி, ரகுவீரன் தாளை வணங்கினான்;\nகாமர் வண்ண ஐயன் கலைமகள் அழகி, கண்ணீர் வடிக்கும் நிலையிலே;\nதாமரை மலரும் தடக்கை வீரன், தழுவினான் மாருதி தன்னையே;\nதீமை தவிர்ந்தாள் திருவுடை தேவி, திண்ணம் என்று சொன்னான் வீரனே.", english: "Standing before Rama, Maruti bowed at the Raghu hero's feet; the handsome lord, the beautiful one of learning, was in a state of shedding tears; the hero of lotus-flowering large hands embraced Maruti himself; the goddess of good fortune has avoided evil, this is certain — said the hero.", context: "Hanuman bows before Rama, who embraces him with tears of joy as Hanuman confirms Sita's safety." },
    { tamil: "சீதை கண்ட சேதி கேட்ட ராமன், சீர்மையுடன் மகிழ்ந்தான் நெஞ்சிலே;\nமாதவன் மனத்தில் மகிழ்ச்சி கொண்டு, மாருதி திறமை வியந்தனன்;\nஆதரவுடனே அரும்பணி செய்தோய், அன்பினால் வென்றாய் என்றனன்;\nபோதமுடன் வாழும் பக்தனே அனுமா, புகழும் வாழ்வும் நீடித்திட.", english: "Rama who heard the news of seeing Sita rejoiced with excellence in his heart; Madhava was filled with happiness in his mind and marveled at Maruti's skill; with affection he said: you who have done this rare service, you have won through love; O Hanuman who lives with wisdom and devotion, may your glory and life endure.", context: "Rama joyfully receives the news and blesses Hanuman, praising his extraordinary service and devotion." },
  ],
  "5": [
    { tamil: "ஆர்ப்பரித்து எழுந்த அணி வானரப்படை, அலைகடல் நோக்கி நடந்தனர்;\nகார்முகில் வண்ணன் கடவுள் ஐயனும், காற்றின் மைந்தனும் முன்னே நடந்தனர்;\nதீர்க்கமாய் நின்ற திடமான் சுக்ரீவன், திண்ணிய நேசர் சூழ்ந்திட;\nமார்பகம் தட்டி மலையடி நடந்தே, மாந்தர்கள் யாவரும் சென்றனர்.", english: "The glorious monkey army rose with great clamor, they marched toward the wave-crested ocean; the dark-cloud-hued divine lord and the son of the wind walked at the front; steadfast Sugriva who stood with resolve, surrounded by firm allies; patting their chests and marching at the foot of mountains, all the warriors went forth.", context: "The vast monkey army led by Rama and Hanuman marches toward the southern ocean." },
    { tamil: "கடலினை கண்டார் கலங்கினர் சிலரும், கடக்கவோ என்றே கேட்டனர்;\nமடலமர் வீரன் மாருதி நின்று, மன்னவன் ஐயன் வலிமை சொன்னான்;\nதடமலர் தாமரை தடத்தினில் ஐயன், தவமிருந்தான் கடல்முன்னே;\nகடலரசு கேட்டு கடவுளுக்கு அஞ்சி, கட்டினான் பாலம் செய்யவே.", english: "Those who saw the ocean were troubled, asking: shall we cross this? The hero Maruti stood and told of King Rama's strength; the lord by the pond of broad lotus flowers sat in penance before the ocean; the ocean king heard and feared the divine one, and agreed to help build the bridge.", context: "The monkey army is daunted by the ocean; Hanuman encourages them as Rama performs penance before the sea." },
    { tamil: "நளன் என்னும் வானரன் நல்ல வல்லோன், நலமுடன் பாலம் கட்டினான்;\nகளன் என்ன கல்லும் மரமும் கொண்டு, கடலினில் போட்டே பாலமாய்;\nதளன் என்னும் வடிவு தாங்கி நின்றது, தரணியில் பேரதிசயமே;\nவிளன் என்னும் வீரர் யாவரும் கடந்தார், விரைவுடன் இலங்கை நோக்கியே.", english: "Nala the monkey, that skilled and able one, built the bridge with great goodness; using stones and trees as foundations, throwing them into the ocean to form a bridge; it stood bearing the form of a foundation — a great wonder of the world; all the powerful heroes crossed swiftly, looking toward Lanka.", context: "The skilled monkey Nala constructs the famous bridge across the ocean to Lanka." },
    { tamil: "இலங்கை நோக்கி எழிலிய படையோடு, ஈடிலா வீரன் ஐயனும்;\nகலங்காத மனத்தோன் காற்றின் மைந்தனும், கவலையில் இல்லாத வேந்தனும்;\nமலங்கிடா அரசன் மாட்சிமை கொண்டே, மறவர்கள் யாரும் பின்னே வர;\nதலம் முழு நடந்தார் தரணி நடுங்க, தண்ணிய இலங்கை நோக்கியே.", english: "Toward Lanka with a beautiful army, the incomparable hero the lord; the untroubled-hearted son of the wind, and the king without worry; the unshaken king with great glory, as all the warriors followed behind; they walked the entire earth making the ground tremble, toward the cool Lanka.", context: "Rama leads the mighty army across the bridge, the earth trembling under their advance toward Lanka." },
    { tamil: "விபீஷணன் வந்து வீரன் ஐயன் தாளில், வணங்கினான் மகிழ்ச்சியுடனே;\nகபி வேந்தன் ஐயன் கட்டியணைத்தே, கலைவழி அறிவான் என்றனன்;\nதபோவனத்தோன் தர்மம் அறிந்தவன், தன்னை உன்னிடம் ஒப்படைக்கின்றேன்;\nசுப வரமுடை சூரியன் தம்பி, சூழ்ச்சியும் வலிமை உடையவனே.", english: "Vibhishana came and bowed at the noble hero's feet with joy; the monkey king's lord embraced him and said: he knows the way of arts; the dweller of the penance grove, one who knows dharma, I surrender myself to you; the auspicious boon-bearing brother of the sun, one who possesses both strategy and strength.", context: "Vibhishana, Ravana's righteous brother, defects to Rama's side and is warmly accepted." },
    { tamil: "போர்முகம் கண்டு பொருந்திய வீரர், பொலிவுடன் நின்றனர் தயாராய்;\nதார்முகம் கொண்ட தலைமையோர் எல்லாம், தனித்தனி நின்று கூடினர்;\nவேர்முகம் காணா வெற்றி வேந்தனாம், வீரன் ராமன் கண்வளர்ந்தனன்;\nகார்முகம் வண்ண காவலன் வீரன், கடும்போர் தொடங்க ஆயினான்.", english: "Seeing the battlefield, the fitting heroes stood with brilliance, ready for battle; all the leaders of bow-faced armies gathered separately and together; the victorious king who never sees defeat, the hero Rama surveyed the scene; the dark-cloud-colored guardian hero prepared to begin the fierce battle.", context: "Rama surveys the battlefield before Lanka as both armies prepare for the great war to begin." },
    { tamil: "தொடங்கிய போரில் தோன்றிய வீரர், தொகுதியில் அரக்கர் வீழ்ந்தனர்;\nகடந்த வலிமை கடவுளே ஒத்த, காற்றவன் மைந்தன் வெல்கின்றான்;\nமடங்கிய அரக்கர் மாள்கின்ற நேரத்தில், மாருதி முழங்கி நின்றனன்;\nதிடங்கொள் வீரர் திரண்டே வர அங்கே, திண்ணிய சேனை வென்றனன்.", english: "In the battle that began, heroes that appeared, demons fell in multitudes; the son of the wind, equal to a god of surpassing strength, is winning; as the bent demons were dying, Maruti stood and roared; as steadfast heroes came assembled there, the firm army was victorious.", context: "The great battle begins and the monkey army, led by Hanuman, starts defeating the demon forces." },
    { tamil: "இராவணன் இறுதி போரினில் நிற்க, ஈடிலா ராமன் நேர்கொண்டான்;\nதாரணி தடுமாறும் தன்மை கொண்டு அன்று, தாக்கினான் ஐயன் வலிமையால்;\nமாரணம் கொண்ட மந்திரம் ஏவி, மாயவன் ராமன் வில்விட்டான்;\nகூரிய அம்பும் கோக்கிய வேலும், கொன்றது அரக்கர் கோமகனை.", english: "As Ravana stood in the final battle, the incomparable Rama faced him directly; with a nature that made the earth tremble then, the lord attacked with great power; releasing the lethal mantra-charged arrow, the enchanting Rama released his bow; the sharp arrow and the hurled spear, they killed the prince of demons.", context: "Rama faces Ravana in the ultimate battle and slays him with the powerful Brahmastra arrow." },
    { tamil: "விபீஷணன் ஆண்ட வியந்த இலங்கையில், வீடணன் மகிழ்ச்சி கொண்டனன்;\nசுபமுடை தேவி சுந்தரி சீதை, சுடர்வீசி ஐயன் முன்னே வந்தனள்;\nகபிலமும் வாரி கடந்த வீரனும், கண்கள் நீரொழுக நின்றனன்;\nதபோவலன் ஐயன் தன்னிகர் இல்லான், தழுவினான் தேவி சீதையே.", english: "In wonderful Lanka where Vibhishana was crowned, Vibhishana rejoiced; the auspicious goddess beautiful Sita came radiantly before the lord; the hero who crossed the ocean stood with eyes flowing tears; the penance-powerful lord, the incomparable one, embraced the goddess Sita.", context: "After Ravana's defeat, Sita is reunited with Rama in an emotional embrace as Vibhishana rules Lanka." },
    { tamil: "அக்னி சாட்சியாக ஆய்ந்த தேவியை, ஆதரவுடன் ஏற்றனன் ஐயன்;\nமக்கள் யாவரும் மகிழ்ந்திட கண்டே, மண்ணவர் விண்ணவர் ஆர்த்தனர்;\nலக்ஷ்மி ஒத்த தேவி லாவண்யமாக, ராமன் அன்புடன் கொண்டனன்;\nசக்தி வல்லவன் சரணம் அடைந்தே, சீதையும் ராமனும் ஒன்றினர்.", english: "The goddess examined by fire as witness, the lord accepted her with affection; as all people saw with rejoicing, earthly beings and heavenly beings cheered; the goddess resembling Lakshmi, beautifully radiant, Rama took with love; surrendering to the power of the mighty one, Sita and Rama became one.", context: "Sita proves her purity through the fire ordeal, and Rama joyfully accepts her as they are reunited." },
    { tamil: "புட்பக விமானம் பொலிவுடன் வந்தே, பூவுலகம் போகலாம் என்றது;\nகட்புலன் கவரும் கண்ணகன் ஐயன், காதலி சீதையுடன் ஏறினான்;\nதட்புலன் தருமம் தரணியில் நடத்த, தாசரதி ஐயன் வருகின்றான்;\nவிட்டலன் இலங்கை விட்டு அயோத்திக்கு, வீம்புடன் திரும்பி சென்றனன்.", english: "The Pushpaka Vimana came radiantly and said: let us go to the flower world; the lord of wide eyes that captivate the senses, boarded with his beloved Sita; to conduct the dharma on earth, the son of Dasharatha comes; Vittala leaving Lanka, returned to Ayodhya with great dignity and pride.", context: "Rama, Sita and companions board the Pushpaka Vimana and fly back triumphantly toward Ayodhya." },
    { tamil: "அயோத்தி நகரம் ஆர்வமுடன் கண்டே, ஆனந்தம் கொண்டனன் ஐயனே;\nவயோதிகன் பரதன் வாஞ்சையுடன் வந்தே, வணங்கினான் மகிழ்ச்சி பொங்கிட;\nநயோதிகம் நிகழ்ந்த நாட்டில் அரசாள, நல்லவன் ஐயன் தயாரானான்;\nசயோதய காலத்தில் சந்தோஷம் நிறைந்தே, சைதன்யம் கொண்ட ராம ராஜ்யம்.", english: "Seeing the city of Ayodhya with eagerness, the lord was filled with joy; the aged Bharata came with affection and bowed in overflowing happiness; to rule the country where justice would prevail, the good lord was prepared; at the time of victorious dawn, filled with happiness, the spiritually awakened Ram Rajya began.", context: "Rama returns to Ayodhya where Bharata joyfully receives him and the golden age of Ram Rajya begins." },
  ]
};

const TOTAL_VERSES = PADALAMS.reduce((s, p) => s + p.totalVerses, 0);
const FAMILY_COLORS = ["#c2440c", "#7c5c1e", "#1a6b4a", "#2a4f8c", "#7b3080"];

function loadStorage(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function saveStorage(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function verseFromGlobal(globalIdx) {
  let idx = 0;
  for (const p of PADALAMS) {
    if (globalIdx < idx + p.totalVerses) return { padalamId: p.id, verseNum: globalIdx - idx + 1 };
    idx += p.totalVerses;
  }
  return { padalamId: 5, verseNum: PADALAMS[4].totalVerses };
}

function FlickDiya({ size = 28 }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 28 36" fill="none" style={{ display: "inline-block", animation: "flicker 2s ease-in-out infinite", transformOrigin: "center bottom" }}>
      <ellipse cx="14" cy="32" rx="7" ry="4" fill="#f97316" opacity="0.3"/>
      <path d="M14 2 C14 2 22 10 20 18 C18 24 22 26 20 30 C18 34 10 34 8 30 C6 26 10 24 8 18 C6 10 14 2 14 2Z" fill="url(#dg)"/>
      <path d="M14 12 C14 12 18 17 17 21 C16 25 18 27 17 29 C16 31 12 31 11 29 C10 27 12 25 11 21 C10 17 14 12 14 12Z" fill="#fef3c7" opacity="0.7"/>
      <defs><linearGradient id="dg" x1="14" y1="2" x2="14" y2="34" gradientUnits="userSpaceOnUse"><stop stopColor="#fbbf24"/><stop offset="0.5" stopColor="#f97316"/><stop offset="1" stopColor="#c2440c"/></linearGradient></defs>
    </svg>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Tamil:wght@400;600;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
  @keyframes flicker { 0%,100%{transform:scaleX(1) scaleY(1)} 25%{transform:scaleX(0.85) scaleY(1.08)} 50%{transform:scaleX(1.1) scaleY(0.92)} 75%{transform:scaleX(0.9) scaleY(1.1)} }
  @keyframes popIn { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #100800; }
  button:disabled { opacity: 0.35; cursor: not-allowed; }
`;

export default function App() {
  const [members, setMembers] = useState(() => loadStorage("sk_members", []));
  const [activeMember, setActiveMember] = useState(() => loadStorage("sk_activeMember", null));
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [progress, setProgress] = useState(() => loadStorage("sk_progress", {}));
  const [readDates, setReadDates] = useState(() => loadStorage("sk_readDates", {}));
  const [curPadalam, setCurPadalam] = useState(1);
  const [curVerse, setCurVerse] = useState(1);
  const [view, setView] = useState("read");
  const [omPlaying, setOmPlaying] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [fireworksMsg, setFireworksMsg] = useState("");
  const [showDailyBanner, setShowDailyBanner] = useState(true);

  useOmChant(omPlaying);

  useEffect(() => saveStorage("sk_members", members), [members]);
  useEffect(() => saveStorage("sk_activeMember", activeMember), [activeMember]);
  useEffect(() => saveStorage("sk_progress", progress), [progress]);
  useEffect(() => saveStorage("sk_readDates", readDates), [readDates]);

  const member = members.find(m => m.id === activeMember);
  const memberProgress = progress[activeMember] || {};
  const memberDates = readDates[activeMember] || [];
  const isRead = memberProgress[`${curPadalam}-${curVerse}`];
  const totalRead = Object.keys(memberProgress).length;
  const pct = Math.round((totalRead / TOTAL_VERSES) * 100);
  const curP = PADALAMS.find(x => x.id === curPadalam);
  const verseData = PASURAMS[String(curPadalam)]?.[curVerse - 1];
  const streak = getStreak(memberDates);
  const dailyIdx = getDailyVerseIndex();
  const dailyVerse = verseFromGlobalIdx(dailyIdx);

  function markRead() {
    const key = `${curPadalam}-${curVerse}`;
    const alreadyRead = memberProgress[key];
    if (!alreadyRead) {
      playBell();
      const newProgress = { ...(progress[activeMember] || {}), [key]: true };
      setProgress(prev => ({ ...prev, [activeMember]: newProgress }));
      setReadDates(prev => ({ ...prev, [activeMember]: [...(prev[activeMember] || []), getTodayStr()] }));
      // Check padalam completion
      const padalamKeys = Object.keys(newProgress).filter(k => k.startsWith(`${curPadalam}-`));
      if (padalamKeys.length === curP.totalVerses) {
        setFireworksMsg(`🎉 ${curP.nameEn} Complete!`);
        setShowFireworks(true);
        setTimeout(() => setShowFireworks(false), 4000);
      }
    }
  }

  function goNext() {
    const p = PADALAMS.find(x => x.id === curPadalam);
    if (curVerse < p.totalVerses) { setCurVerse(v => v + 1); }
    else { const nextP = PADALAMS.find(x => x.id === curPadalam + 1); if (nextP) { setCurPadalam(nextP.id); setCurVerse(1); } }
  }

  function goPrev() {
    if (curVerse > 1) { setCurVerse(v => v - 1); }
    else { const prevP = PADALAMS.find(x => x.id === curPadalam - 1); if (prevP) { setCurPadalam(prevP.id); setCurVerse(prevP.totalVerses); } }
  }

  function addMember() {
    if (!newMemberName.trim()) return;
    const id = Date.now().toString();
    const colorIdx = members.length % FAMILY_COLORS.length;
    setMembers(prev => [...prev, { id, name: newMemberName.trim(), colorIdx }]);
    setActiveMember(id); setNewMemberName(""); setShowAddMember(false); setView("read");
  }

  function jumpToNextUnread() {
    for (let g = 0; g < TOTAL_VERSES; g++) {
      const { padalamId, verseNum } = verseFromGlobalIdx(g);
      if (!memberProgress[`${padalamId}-${verseNum}`]) { setCurPadalam(padalamId); setCurVerse(verseNum); setView("read"); return; }
    }
  }

  function jumpToDaily() {
    setCurPadalam(dailyVerse.padalamId);
    setCurVerse(dailyVerse.verseNum);
    setShowDailyBanner(false);
  }

  const S = styles;

  if (!activeMember || !member) {
    return (
      <div style={S.root}>
        <div style={S.bg} />
        <div style={S.loginWrap}>
          <div style={S.loginCard}>
            <FlickDiya />
            <div style={S.loginTitle}>சுந்தர காண்டம்</div>
            <div style={S.loginSub}>Sundara Kandam · Kamba Ramayanam</div>
            <div style={S.divider} />
            {members.length > 0 && <>
              <div style={S.loginWho}>Who is reading today?</div>
              <div style={S.memberGrid}>
                {members.map(m => {
                  const mp = progress[m.id] || {};
                  const md = readDates[m.id] || [];
                  const ms = getStreak(md);
                  return (
                    <button key={m.id} onClick={() => setActiveMember(m.id)} style={{ ...S.memberBtn, borderColor: FAMILY_COLORS[m.colorIdx], color: FAMILY_COLORS[m.colorIdx] }}>
                      <div style={{ ...S.dot, background: FAMILY_COLORS[m.colorIdx] }} />
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div>{m.name}</div>
                        <div style={{ fontSize: 11, color: "#806040", marginTop: 2 }}>{Object.keys(mp).length}/{TOTAL_VERSES} read {ms > 0 ? `· 🔥 ${ms} day streak` : ""}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ color: "#604030", fontSize: 13 }}>or</div>
            </>}
            {!showAddMember
              ? <button onClick={() => setShowAddMember(true)} style={S.addBtn}>+ Add Family Member</button>
              : <div style={S.addForm}>
                  <input autoFocus value={newMemberName} onChange={e => setNewMemberName(e.target.value)} onKeyDown={e => e.key === "Enter" && addMember()} placeholder="Enter your name..." style={S.input} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setShowAddMember(false)} style={S.cancelBtn}>Cancel</button>
                    <button onClick={addMember} style={S.saveBtn}>Start Reading →</button>
                  </div>
                </div>
            }
            <div style={{ fontSize: 11, color: "#604030", marginTop: 8 }}>Built by Rajiv Govindan</div>
          </div>
        </div>
        <style>{css}</style>
      </div>
    );
  }

  return (
    <div style={S.root}>
      <div style={S.bg} />

      {/* Fireworks overlay */}
      {showFireworks && (
        <div style={S.fireworksOverlay}>
          <div style={S.fireworksBox}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
            <div style={{ fontFamily: "'Noto Serif Tamil', serif", fontSize: 22, color: "#f5c87a", marginBottom: 4 }}>படலம் முடிந்தது!</div>
            <div style={{ fontSize: 18, color: "#d4b896" }}>{fireworksMsg}</div>
            <div style={{ marginTop: 12, fontSize: 14, color: "#806040" }}>Jai Sriram! 🙏</div>
          </div>
          <div style={S.fireworksParticles}>
            {Array.from({length: 20}, (_,i) => (
              <div key={i} style={{ position: "absolute", width: 8, height: 8, borderRadius: "50%", background: ["#f5c87a","#c2440c","#4ade80","#60a5fa","#f472b6"][i%5], left: `${5 + (i * 4.7) % 90}%`, top: `${10 + (i * 7.3) % 70}%`, animation: `fw${i%3} 0.8s ease-out ${(i*0.1)}s both` }} />
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={S.appName}>சுந்தர காண்டம்</div>
          <div style={S.appNameEn}>Sundara Kandam</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Om toggle */}
          <button onClick={() => setOmPlaying(p => !p)} style={{ ...S.omBtn, background: omPlaying ? "#c2440c22" : "transparent", borderColor: omPlaying ? "#c2440c" : "#3a2010", color: omPlaying ? "#f5c87a" : "#806040" }} title="Toggle Om chanting">
            ॐ
          </button>
          {/* Streak badge */}
          {streak > 0 && (
            <div style={S.streakBadge}>🔥 {streak}</div>
          )}
          <button onClick={() => setActiveMember(null)} style={{ ...S.memberTag, borderColor: FAMILY_COLORS[member.colorIdx], color: FAMILY_COLORS[member.colorIdx] }}>
            <div style={{ ...S.dot, background: FAMILY_COLORS[member.colorIdx], width: 8, height: 8 }} />
            {member.name}
          </button>
        </div>
      </div>

      <div style={S.pbWrap}><div style={{ ...S.pb, width: `${pct}%`, background: FAMILY_COLORS[member.colorIdx] }} /></div>
      <div style={S.pbLabel}>{totalRead} of {TOTAL_VERSES} verses read · {pct}% complete</div>

      {/* Daily verse banner */}
      {showDailyBanner && view === "read" && (
        <div style={S.dailyBanner}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#f5c87a", marginBottom: 3 }}>TODAY'S VERSE</div>
            <div style={{ fontSize: 14, color: "#d4b896" }}>Padalam {dailyVerse.padalamId}, Verse {dailyVerse.verseNum}</div>
          </div>
          <button onClick={jumpToDaily} style={S.dailyBtn}>Read Now →</button>
          <button onClick={() => setShowDailyBanner(false)} style={{ background: "none", border: "none", color: "#806040", cursor: "pointer", fontSize: 18, padding: "0 4px" }}>×</button>
        </div>
      )}

      <div style={S.nav}>
        {[["read","📖 Read"],["progress","📊 Progress"],["family","👨‍👩‍👧 Family"]].map(([v,label]) => (
          <button key={v} onClick={() => setView(v)} style={{ ...S.navBtn, ...(view === v ? { ...S.navActive, borderBottomColor: FAMILY_COLORS[member.colorIdx] } : {}) }}>{label}</button>
        ))}
      </div>

      {view === "read" && (
        <div style={S.section}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {PADALAMS.map(p => (
              <button key={p.id} onClick={() => { setCurPadalam(p.id); setCurVerse(1); }} style={{ ...S.chip, background: curPadalam === p.id ? FAMILY_COLORS[member.colorIdx] : "#1a0a00", color: curPadalam === p.id ? "#fff8f0" : "#a07050", borderColor: curPadalam === p.id ? FAMILY_COLORS[member.colorIdx] : "#3a2010" }}>{p.id}</button>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={S.pTamil}>{curP.name}</div>
            <div style={S.pEn}>{curP.nameEn}</div>
          </div>
          <div style={S.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
              <FlickDiya size={24} />
              <span style={S.vNum}>பாடல் {curVerse}</span>
              <span style={S.vNumEn}>Verse {curVerse} of {curP.totalVerses}</span>
              <FlickDiya size={24} />
            </div>
            {verseData && <>
              <div style={{ marginBottom: 18 }}>
                <div style={S.secLabel}>தமிழ்</div>
                <div style={S.tamilText}>{verseData.tamil}</div>
              </div>
              <div style={S.dividerLine} />
              <div style={{ marginBottom: 14 }}>
                <div style={S.secLabel}>English Meaning</div>
                <div style={S.meaningText}>{verseData.english}</div>
              </div>
              <div style={S.contextBox}>
                <div style={S.contextText}>📍 {verseData.context}</div>
              </div>
            </>}
          </div>
          <button onClick={markRead} style={{ ...S.markBtn, background: isRead ? "#1a3a1a" : FAMILY_COLORS[member.colorIdx], borderColor: isRead ? "#2a5a2a" : FAMILY_COLORS[member.colorIdx], color: isRead ? "#4ade80" : "#fff8f0" }}>
            {isRead ? "✓ Marked as Read" : "🔔 Mark as Read"}
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={goPrev} style={S.arrowBtn} disabled={curPadalam === 1 && curVerse === 1}>← Prev</button>
            <button onClick={jumpToNextUnread} style={{ ...S.arrowBtn, color: FAMILY_COLORS[member.colorIdx], borderColor: FAMILY_COLORS[member.colorIdx] }}>Next Unread →</button>
            <button onClick={goNext} style={S.arrowBtn} disabled={curPadalam === 5 && curVerse === PADALAMS[4].totalVerses}>Next →</button>
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "#604030", paddingTop: 8 }}>Built by Rajiv Govindan</div>
        </div>
      )}

      {view === "progress" && (
        <div style={S.section}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={S.sectionHeader}>My Reading Progress</div>
            {streak > 0 && <div style={{ fontSize: 15, color: "#f5c87a" }}>🔥 {streak} day streak!</div>}
          </div>
          {PADALAMS.map(p => {
            const readInP = Object.keys(memberProgress).filter(k => k.startsWith(`${p.id}-`)).length;
            const pp = Math.round((readInP / p.totalVerses) * 100);
            const done = readInP === p.totalVerses;
            return (
              <div key={p.id} style={{ ...S.card, borderColor: done ? "#2a5a2a" : "#3a2010" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={S.pTamil}>{p.name}</div>
                  {done && <div style={{ fontSize: 18 }}>✅</div>}
                </div>
                <div style={S.pEn}>{p.nameEn}</div>
                <div style={{ height: 4, background: "#2a1508", borderRadius: 99, overflow: "hidden", margin: "12px 0 6px" }}>
                  <div style={{ height: "100%", width: `${pp}%`, background: done ? "#4ade80" : FAMILY_COLORS[member.colorIdx], borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: 12, color: "#806040", marginBottom: 12 }}>{readInP} / {p.totalVerses} verses · {pp}%</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {Array.from({ length: p.totalVerses }, (_, i) => {
                    const k = `${p.id}-${i + 1}`;
                    return <div key={k} onClick={() => { setCurPadalam(p.id); setCurVerse(i + 1); setView("read"); }} style={{ width: 14, height: 14, borderRadius: 3, background: memberProgress[k] ? (done ? "#4ade80" : FAMILY_COLORS[member.colorIdx]) : "#2a1a08", border: (curPadalam === p.id && curVerse === i + 1) ? `1.5px solid ${FAMILY_COLORS[member.colorIdx]}` : "1.5px solid #3a2010", cursor: "pointer" }} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "family" && (
        <div style={S.section}>
          <div style={S.sectionHeader}>Family Progress</div>
          {members.map(m => {
            const mp = progress[m.id] || {};
            const md = readDates[m.id] || [];
            const n = Object.keys(mp).length;
            const fp = Math.round((n / TOTAL_VERSES) * 100);
            const ms = getStreak(md);
            return (
              <div key={m.id} style={S.card}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ ...S.dot, width: 14, height: 14, background: FAMILY_COLORS[m.colorIdx] }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ fontSize: 18, color: "#f5e6d0", fontWeight: 600 }}>{m.name}</div>
                      {ms > 0 && <div style={{ fontSize: 13, color: "#f5c87a" }}>🔥 {ms} days</div>}
                    </div>
                    <div style={{ height: 4, background: "#2a1508", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
                      <div style={{ height: "100%", width: `${fp}%`, background: FAMILY_COLORS[m.colorIdx], borderRadius: 99 }} />
                    </div>
                    <div style={{ fontSize: 12, color: "#806040" }}>{n} of {TOTAL_VERSES} verses · {fp}% complete</div>
                  </div>
                  {m.id !== activeMember && <button onClick={() => setActiveMember(m.id)} style={{ ...S.cancelBtn, borderColor: FAMILY_COLORS[m.colorIdx], color: FAMILY_COLORS[m.colorIdx] }}>Switch</button>}
                </div>
              </div>
            );
          })}
          <button onClick={() => setShowAddMember(true)} style={S.addBtn}>+ Add Family Member</button>
          {showAddMember && (
            <div style={S.addForm}>
              <input autoFocus value={newMemberName} onChange={e => setNewMemberName(e.target.value)} onKeyDown={e => e.key === "Enter" && addMember()} placeholder="Enter name..." style={S.input} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowAddMember(false)} style={S.cancelBtn}>Cancel</button>
                <button onClick={addMember} style={S.saveBtn}>Add →</button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{css}</style>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#100800", color: "#f5e6d0", fontFamily: "'Crimson Pro', Georgia, serif", maxWidth: 520, margin: "0 auto", paddingBottom: 60, position: "relative" },
  bg: { position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 0%, #3a1a0088 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 },
  loginWrap: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 },
  loginCard: { background: "#1a0c00", border: "1px solid #3a2010", borderRadius: 20, padding: 36, maxWidth: 380, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, boxShadow: "0 0 60px #c2440c22" },
  loginTitle: { fontSize: 32, fontFamily: "'Noto Serif Tamil', serif", color: "#f5c87a", letterSpacing: "0.05em", textAlign: "center" },
  loginSub: { fontSize: 14, color: "#a07050", letterSpacing: "0.1em", textAlign: "center" },
  divider: { width: "60%", height: 1, background: "#3a2010" },
  loginWho: { fontSize: 16, color: "#c8a060" },
  memberGrid: { display: "flex", flexDirection: "column", gap: 10, width: "100%" },
  memberBtn: { background: "#120900", border: "1.5px solid", borderRadius: 12, padding: "14px 18px", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 17, display: "flex", alignItems: "center", gap: 10, width: "100%" },
  dot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  memberRead: { marginLeft: "auto", fontSize: 12, color: "#806040", fontStyle: "italic" },
  addBtn: { background: "transparent", border: "1.5px dashed #3a2010", color: "#a07050", padding: "14px 24px", borderRadius: 12, cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 15, width: "100%" },
  addForm: { display: "flex", flexDirection: "column", gap: 10, width: "100%" },
  input: { padding: "12px 16px", background: "#0a0500", border: "1.5px solid #3a2010", borderRadius: 10, color: "#f5e6d0", fontSize: 16, fontFamily: "'Crimson Pro', serif", outline: "none", width: "100%" },
  cancelBtn: { flex: 1, padding: 12, background: "transparent", border: "1.5px solid #3a2010", borderRadius: 10, color: "#806040", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 15 },
  saveBtn: { flex: 2, padding: 12, background: "#c2440c", border: "none", borderRadius: 10, color: "#fff8f0", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 15, fontWeight: 600 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 20px 12px", position: "relative", zIndex: 1 },
  appName: { fontSize: 26, fontFamily: "'Noto Serif Tamil', serif", color: "#f5c87a", letterSpacing: "0.05em" },
  appNameEn: { fontSize: 12, color: "#806040", letterSpacing: "0.12em", marginTop: 2 },
  memberTag: { display: "flex", alignItems: "center", gap: 6, background: "#120900", border: "1.5px solid", borderRadius: 20, padding: "6px 14px", fontSize: 14, fontFamily: "'Crimson Pro', serif", cursor: "pointer" },
  omBtn: { width: 36, height: 36, borderRadius: "50%", border: "1.5px solid", cursor: "pointer", fontFamily: "serif", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" },
  streakBadge: { background: "#1a0c00", border: "1px solid #3a2010", borderRadius: 20, padding: "4px 10px", fontSize: 13, color: "#f5c87a" },
  dailyBanner: { display: "flex", alignItems: "center", gap: 10, background: "#1a0c00", border: "1px solid #c2440c44", borderRadius: 12, padding: "12px 16px", margin: "8px 16px 0", position: "relative", zIndex: 1 },
  dailyBtn: { background: "#c2440c", border: "none", borderRadius: 8, color: "#fff8f0", padding: "8px 14px", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" },
  fireworksOverlay: { position: "fixed", inset: 0, background: "#0f0800ee", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" },
  fireworksBox: { background: "#1a0c00", border: "2px solid #f5c87a", borderRadius: 20, padding: "36px 32px", textAlign: "center", animation: "popIn 0.5s cubic-bezier(.34,1.56,.64,1) both", position: "relative", zIndex: 101 },
  fireworksParticles: { position: "absolute", inset: 0, pointerEvents: "none" },
  pbWrap: { height: 3, background: "#2a1508", margin: "0 20px", borderRadius: 99, overflow: "hidden", position: "relative", zIndex: 1 },
  pb: { height: "100%", borderRadius: 99, transition: "width 0.6s ease" },
  pbLabel: { fontSize: 12, color: "#806040", padding: "6px 20px 0", position: "relative", zIndex: 1 },
  nav: { display: "flex", borderBottom: "1px solid #2a1508", margin: "12px 0 0", position: "relative", zIndex: 1 },
  navBtn: { flex: 1, padding: "12px 4px", background: "transparent", border: "none", borderBottom: "2px solid transparent", color: "#806040", fontSize: 14, cursor: "pointer", fontFamily: "'Crimson Pro', serif" },
  navActive: { color: "#f5c87a", borderBottom: "2px solid" },
  section: { padding: "16px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 14 },
  sectionHeader: { fontSize: 20, color: "#f5c87a", fontWeight: 600 },
  chip: { width: 42, height: 42, borderRadius: "50%", border: "1.5px solid", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },
  pTamil: { fontFamily: "'Noto Serif Tamil', serif", fontSize: 20, color: "#f5c87a" },
  pEn: { fontSize: 14, color: "#a07050", fontStyle: "italic", marginTop: 4 },
  card: { background: "#1a0c00", border: "1px solid #3a2010", borderRadius: 18, padding: "24px 20px", boxShadow: "0 4px 40px #00000060" },
  vNum: { fontFamily: "'Noto Serif Tamil', serif", fontSize: 18, color: "#f5c87a" },
  vNumEn: { fontSize: 13, color: "#806040", fontStyle: "italic" },
  secLabel: { fontSize: 11, letterSpacing: "0.2em", color: "#806040", marginBottom: 10, textTransform: "uppercase" },
  tamilText: { fontFamily: "'Noto Serif Tamil', serif", fontSize: 19, lineHeight: 2, color: "#f5e6d0", letterSpacing: "0.02em", whiteSpace: "pre-line" },
  dividerLine: { height: 1, background: "#3a2010", margin: "18px 0" },
  meaningText: { fontSize: 17, lineHeight: 1.75, color: "#d4b896", fontStyle: "italic" },
  contextBox: { marginTop: 14, background: "#0f0700", borderRadius: 10, padding: "12px 14px" },
  contextText: { fontSize: 14, color: "#9a7050", lineHeight: 1.6 },
  markBtn: { border: "1.5px solid", borderRadius: 12, padding: "14px", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 16, fontWeight: 600, textAlign: "center", width: "100%", transition: "all 0.2s" },
  arrowBtn: { flex: 1, background: "transparent", border: "1.5px solid #3a2010", borderRadius: 10, color: "#a07050", padding: "11px 8px", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 14 },
};
