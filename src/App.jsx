import React, { useEffect, useMemo, useState } from 'react';

const PASSWORD = '1909';
const LOVE_NAME = 'Srujuu';
const photoPaths = ['/photos/photo1.jpg', '/photos/photo2.jpg', '/photos/photo3.jpg', '/photos/photo4.jpg'];
const songPath = '/Elliot James Reay - I Think They Call This Love (Official Music Video).mp3';
const letterParagraphs = [
  'Srujuu,',
  'Happy Birthday 🐣',
  'I don’t love you the way I once did, and I’m not asking for another chance. But I can never pretend that what I felt for you wasn’t real.',
  'You were once the person I wanted to tell everything to, and for a long time, I imagined a future with you. That future is gone now, and I’ve finally learned to accept it.',
  'I’m sorry for the times my love became pressure or pain. I understand now that loving someone doesn’t mean they have to choose us.',
  'I only wish you a beautiful life, full of peace, happiness, and love.',
  'You were once the future I prayed for. Now you are a memory I hope always stays beautiful.',
  'Happy Birthday, Srujuu. ❤️'
];

function App() {
  const [page, setPage] = useState('lock');
  const [entered, setEntered] = useState('');
  const [toast, setToast] = useState('');
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [cakeBlown, setCakeBlown] = useState(false);
  const [micStarted, setMicStarted] = useState(false);
  const [meter, setMeter] = useState(0);
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    const audio = new Audio(songPath);
    audio.volume = 0.45;
    audio.loop = true;
    audio.autoplay = true;

    const startAudio = () => {
      audio.play().catch(() => {
        // autoplay is blocked until user interaction; this is intentionally ignored to avoid breaking the flow
      });
    };

    startAudio();
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    const hearts = Array.from({ length: 34 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      delay: `${(-Math.random() * 8).toFixed(2)}s`,
      duration: `${(6 + Math.random() * 7).toFixed(2)}s`,
      size: `${(10 + Math.random() * 18).toFixed(1)}px`,
      char: Math.random() > 0.55 ? '♡' : '✦',
    }));
    setSparkles(hearts);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  const dots = useMemo(() => Array.from({ length: 4 }, (_, index) => index < entered.length), [entered]);

  function pressKey(value) {
    if (entered.length >= 4) return;
    const next = entered + value;
    setEntered(next);
    if (next.length === 4) {
      setTimeout(() => checkCode(next), 180);
    }
  }

  function eraseKey() {
    setEntered((current) => current.slice(0, -1));
  }

  function showToast(msg) {
    setToast(msg);
  }

  function checkCode(value = entered) {
    if (value === PASSWORD) {
      setPage('envelope');
      setEntered('');
      setToast('');
      return;
    }

    showToast('Not quite ❤️ Try our special date/code.');
    setEntered('');
  }

  function goTo(id) {
    setPage(id);
    window.scrollTo(0, 0);
  }

  function openEnvelope() {
    if (envelopeOpen) return;
    setEnvelopeOpen(true);
    setTimeout(() => goTo('letter'), 900);
  }

  function blowCandles() {
    if (cakeBlown) return;
    setCakeBlown(true);
    setTimeout(() => goTo('final'), 1500);
  }

  async function startMic() {
    if (micStarted) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStarted(true);
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let strongFrames = 0;

      function listen() {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const pct = Math.min(100, avg * 2.1);
        setMeter(pct);

        if (avg > 31) strongFrames += 1;
        else strongFrames = Math.max(0, strongFrames - 1);

        if (strongFrames > 8) {
          stream.getTracks().forEach((track) => track.stop());
          blowCandles();
          return;
        }

        requestAnimationFrame(listen);
      }

      listen();
    } catch (error) {
      showToast('Microphone blocked — tap the cake instead ❤️');
    }
  }

  return (
    <>
      <div id="toast" className={toast ? 'show' : ''}>{toast}</div>
      <div className="sparkles">
        {sparkles.map((sparkle) => (
          <span
            key={sparkle.id}
            style={{
              left: sparkle.left,
              animationDelay: sparkle.delay,
              animationDuration: sparkle.duration,
              fontSize: sparkle.size,
            }}
          >
            {sparkle.char}
          </span>
        ))}
      </div>

      <section className={`page ${page === 'lock' ? 'active fadeIn' : ''}`} id="lock">
        <div className="lockCard">
          <div className="polaroid hero">
            <img src={photoPaths[0]} alt="Our photo" />
            <div className="caption">for my favorite person ❤️</div>
          </div>

          <div className="lockPanel">
            <div style={{ fontSize: '42px' }}>🔐</div>
            <h1>A little secret...</h1>
            <p>Enter our special 4-digit code to open your surprise.</p>
            <div className="dots" id="dots">
              {dots.map((filled, index) => (
                <i key={index} className={filled ? 'fill' : ''} />
              ))}
            </div>

            <div className="pad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button key={n} className="key" onClick={() => pressKey(String(n))}>
                  {n}
                </button>
              ))}
              <button className="key" onClick={eraseKey}>⌫</button>
              <button className="key" onClick={() => pressKey('0')}>0</button>
              <button className="key" onClick={() => checkCode()}>♡</button>
            </div>

            <button className="unlock" onClick={() => checkCode()}>
              Unlock my surprise
            </button>
          </div>
        </div>
      </section>

      <section className={`page ${page === 'envelope' ? 'active fadeIn' : ''}`} id="envelopePage">
        <div className="envelopeScene">
          <h2>You've unlocked something special 💌</h2>
          <div className={`envelope ${envelopeOpen ? 'open' : ''}`} onClick={openEnvelope}>
            <div className="envBack" />
            <div className="flap" />
            <div className="envFront" />
            <div className="seal">♥</div>
          </div>
          <div className="tap">Tap the envelope to open your letter</div>
        </div>
      </section>

      <section className={`page ${page === 'letter' ? 'active fadeIn' : ''}`} id="letterPage">
        <div className="letterLayout">
          <article className="letterPaper">
            <h2>To {LOVE_NAME},</h2>
            {letterParagraphs.map((paragraph, paragraphIndex) => (
              <p key={`${paragraphIndex}-${paragraph}`} className="wordReveal">
                {paragraph.split(' ').map((word, wordIndex) => (
                  <span
                    key={`${paragraphIndex}-${wordIndex}-${word}`}
                    style={{ animationDelay: `${(paragraphIndex * 0.8 + wordIndex * 0.08).toFixed(2)}s` }}
                  >
                    {word}
                  </span>
                ))}
              </p>
            ))}
            <button className="nextBtn" onClick={() => goTo('cake')}>
              Light the candles ✨
            </button>
            <p style={{ marginTop: '22px', fontStyle: 'italic' }}>
              <b>
                Always yours,<br />
                Nanii ❤️
              </b>
            </p>
          </article>

          <div className="photoStack">
            <div className="polaroid p1"><img src={photoPaths[1]} alt="" /></div>
            <div className="polaroid p2"><img src={photoPaths[2]} alt="" /></div>
            <div className="polaroid p3"><img src={photoPaths[3]} alt="" /></div>
          </div>
        </div>
      </section>

      <section className={`page ${page === 'cake' ? 'active fadeIn' : ''}`} id="cakePage">
        <div className="cakeWrap">
          <h2>Make a wish ✨</h2>
          <div className="sub">When you're ready, blow out the candles.</div>
          <div className={`cake ${cakeBlown ? 'blown' : ''}`} onClick={blowCandles} id="cake">
            <div className="candles">
              <div className="candle"><span className="flame" /></div>
              <div className="candle"><span className="flame" /></div>
              <div className="candle"><span className="flame" /></div>
            </div>
            <div className="icing" />
            <div className="base" />
          </div>

          <button className="micBtn" id="micBtn" onClick={startMic}>
            {micStarted ? 'Now blow toward your microphone 💨' : '🎤 Enable microphone & blow'}
          </button>
          <div className="meter"><i id="meter" style={{ width: `${meter}%` }} /></div>
          <div className="fallback">If microphone access is blocked, tap the cake to blow them out.</div>
        </div>
      </section>

      <section className={`page ${page === 'final' ? 'active fadeIn' : ''}`} id="finalPage">
        <div className="finalBox">
          <h1 className="finalTitle">Happy Birthday to You!</h1>
          <div className="finalSub">May your wish come true, my love. ❤️</div>
          <div className="gallery">
            {photoPaths.map((src, index) => (
              <div key={index} className="polaroid">
                <img src={src} alt="" />
              </div>
            ))}
          </div>
          <button className="restart" onClick={() => window.location.reload()}>
            Replay our surprise ↻
          </button>
        </div>
      </section>

      <style>{`
        :root{
          --red:#ec174c; --deep:#bf0e3d; --cream:#fff7e9; --ink:#4b2030;
          --night:#25233e; --gold:#f7d978;
        }
        *{box-sizing:border-box}
        html,body,#root{margin:0;width:100%;height:100%;font-family:Georgia,"Times New Roman",serif;background:#171522;color:#fff}
        body{overflow:hidden}
        .page{position:fixed;inset:0;display:none;align-items:center;justify-content:center;padding:22px;overflow:auto}
        .page.active{display:flex}
        .fadeIn{animation:fade .75s ease both}
        @keyframes fade{from{opacity:0;transform:scale(.985)}to{opacity:1;transform:scale(1)}}
        button,input{font:inherit}
        button{cursor:pointer;border:0}
        .sparkles{position:absolute;inset:0;pointer-events:none;overflow:hidden}
        .sparkles span{position:absolute;opacity:.8;animation:drift 8s linear infinite}
        @keyframes drift{from{transform:translateY(105vh) rotate(0)}to{transform:translateY(-10vh) rotate(360deg)}}

        #lock{background:radial-gradient(circle at 50% 30%,#ff3c67 0,#e71449 38%,#bd0d39 100%)}
        .lockCard{width:min(920px,95vw);display:grid;grid-template-columns:1fr 1fr;gap:34px;align-items:center;z-index:2}
        .polaroid{background:white;padding:12px 12px 42px;transform:rotate(-5deg);box-shadow:0 25px 60px rgba(72,0,20,.28)}
        .polaroid img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:linear-gradient(135deg,#d9efe2,#a8d4bb)}
        .polaroid .caption{color:#4d4450;text-align:center;margin-top:12px;font-size:18px;font-style:italic}
        .lockPanel{text-align:center}
        .lockPanel h1{font-size:clamp(32px,5vw,58px);margin:0 0 8px}
        .lockPanel p{opacity:.85;margin:0 0 20px}
        .dots{display:flex;justify-content:center;gap:9px;margin:16px}
        .dots i{width:12px;height:12px;border-radius:50%;border:2px solid #fff}
        .dots i.fill{background:#fff}
        .pad{display:grid;grid-template-columns:repeat(3,64px);gap:11px;justify-content:center}
        .key{width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.18);color:#fff;font-size:20px;border:1px solid rgba(255,255,255,.22);backdrop-filter:blur(6px)}
        .key:active{transform:scale(.94)}
        .unlock{margin-top:18px;padding:12px 22px;border-radius:30px;background:#fff;color:#c40e3b;font-weight:bold}
        .hint{font-size:12px;opacity:.7;margin-top:10px}

        #envelopePage{background:linear-gradient(145deg,#e71849,#ca0f3e)}
        .envelopeScene{text-align:center;z-index:2}
        .envelopeScene h2{font-size:clamp(30px,5vw,56px);margin-bottom:28px}
        .envelope{width:min(420px,85vw);height:270px;position:relative;margin:auto;cursor:pointer;filter:drop-shadow(0 24px 40px rgba(80,0,15,.32))}
        .envBack{position:absolute;inset:0;background:#f5dfc4;border-radius:8px}
        .envFront{position:absolute;left:0;right:0;bottom:0;height:72%;background:#fff0d8;clip-path:polygon(0 25%,50% 72%,100% 25%,100% 100%,0 100%)}
        .flap{position:absolute;left:0;right:0;top:0;height:62%;background:#efd4b5;clip-path:polygon(0 0,100% 0,50% 100%);transform-origin:top;transition:.8s}
        .seal{position:absolute;left:50%;top:51%;transform:translate(-50%,-50%);width:58px;height:58px;border-radius:50%;background:#b80d38;display:grid;place-items:center;font-size:27px;z-index:5}
        .envelope.open .flap{transform:rotateX(180deg)}
        .tap{margin-top:20px;opacity:.9}

        #letterPage{background:linear-gradient(145deg,#ec174c,#c90f3d)}
        .letterLayout{width:min(1050px,95vw);display:grid;grid-template-columns:1.1fr .9fr;gap:24px;align-items:center;z-index:2}
        .letterPaper{background:var(--cream);color:var(--ink);padding:34px;border-radius:6px;box-shadow:0 24px 65px rgba(77,0,19,.28);transform:rotate(-1deg);max-height:76vh;overflow:auto}
        .letterPaper h2{color:#d91646;font-size:40px;margin:0 0 12px}
        .letterPaper p{font-size:17px;line-height:1.7}
        .wordReveal{margin:0 0 16px;line-height:1.8}
        .wordReveal span{display:inline-block;opacity:0;transform:translateY(10px);animation:wordShow .45s ease forwards; margin-right:0.38em;}
        .wordReveal span:last-child{margin-right:0}
        @keyframes wordShow{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
        .nextBtn{padding:13px 24px;border-radius:30px;background:#d91646;color:white;font-weight:bold}
        .photoStack{position:relative;height:530px}
        .photoStack .polaroid{position:absolute;width:64%}
        .photoStack .p1{left:0;top:10px;transform:rotate(-6deg)}
        .photoStack .p2{right:0;top:140px;transform:rotate(5deg)}
        .photoStack .p3{left:12%;bottom:0;transform:rotate(-2deg)}

        #cakePage{background:radial-gradient(circle at 50% 35%,#383652 0,#24223a 55%,#181626 100%);text-align:center}
        .cakeWrap{z-index:2}
        .cakeWrap h2{font-size:clamp(32px,5vw,55px);margin:0 0 7px}
        .cakeWrap .sub{opacity:.78;margin-bottom:38px}
        .cake{width:250px;height:190px;position:relative;margin:auto;cursor:pointer}
        .base{position:absolute;bottom:0;left:28px;right:28px;height:95px;background:#fff1d7;border-radius:18px 18px 30px 30px;box-shadow:0 25px 45px rgba(0,0,0,.32)}
        .icing{position:absolute;bottom:76px;left:28px;right:28px;height:37px;background:#ffb6c8;border-radius:22px}
        .candles{position:absolute;top:12px;left:0;right:0;display:flex;justify-content:center;gap:20px}
        .candle{width:13px;height:70px;background:repeating-linear-gradient(45deg,#ffe083 0 7px,#ff7597 7px 14px);border-radius:4px;position:relative}
        .flame{position:absolute;width:16px;height:24px;background:#ffd74e;left:-1px;top:-27px;border-radius:75% 25% 70% 30%;transform:rotate(45deg);box-shadow:0 0 14px #ffc400,0 0 30px #ff7a00;animation:flicker .25s infinite alternate}
        @keyframes flicker{to{transform:rotate(50deg) scale(.9)}}
        .blown .flame{animation:out .55s forwards}
        @keyframes out{to{opacity:0;transform:translateY(-18px) scale(.1)}}
        .micBtn{margin-top:28px;padding:13px 22px;border-radius:30px;background:#fff;color:#25233e;font-weight:bold}
        .meter{height:7px;width:240px;background:rgba(255,255,255,.15);margin:15px auto 0;border-radius:8px;overflow:hidden}
        .meter i{display:block;height:100%;width:0;background:#fff;transition:.06s}
        .fallback{font-size:12px;opacity:.65;margin-top:9px}

        #finalPage{background:linear-gradient(145deg,#ef174e,#c80e3b);text-align:center}
        .finalBox{z-index:2;width:min(1050px,96vw)}
        .finalTitle{font-size:clamp(44px,8vw,92px);font-family:"Brush Script MT","Segoe Script",cursive;margin:0 0 8px;text-shadow:0 6px 20px rgba(90,0,15,.25)}
        .finalSub{font-size:18px;opacity:.92;margin-bottom:28px}
        .gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .gallery .polaroid{transform:rotate(-3deg)}
        .gallery .polaroid:nth-child(even){transform:rotate(3deg);margin-top:25px}
        .gallery img{aspect-ratio:4/5}
        .restart{margin-top:24px;padding:12px 22px;border-radius:30px;background:#fff;color:#c40e3b;font-weight:bold}

        #toast{position:fixed;left:50%;bottom:25px;transform:translateX(-50%);padding:11px 17px;border-radius:30px;background:rgba(0,0,0,.65);color:#fff;opacity:0;pointer-events:none;transition:.3s;z-index:99}
        #toast.show{opacity:1}

        @media(max-width:760px){
          body{overflow:auto}
          .page{min-height:100vh;position:absolute;inset:auto 0;top:0}
          .lockCard,.letterLayout{grid-template-columns:1fr}
          .lockCard{padding-top:30px}
          .polaroid.hero{max-width:330px;margin:auto}
          .pad{grid-template-columns:repeat(3,58px)}
          .key{width:58px;height:58px}
          .photoStack{height:500px;margin-top:5px}
          .letterPaper{max-height:none}
          .gallery{grid-template-columns:1fr 1fr}
        }
      `}</style>
    </>
  );
}

export default App;
