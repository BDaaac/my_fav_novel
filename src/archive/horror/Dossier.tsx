import Link from "next/link";
import { Cousine, Oswald } from "next/font/google";
import type { Dossier as D, IdentRow, Ref } from "@/data/horror/dossier/types";
import { BackTab } from "./BackTab";
import { Fit } from "./Fit";
import "./dossier.css";

const oswald = Oswald({ subsets: ["latin", "cyrillic"], weight: ["500", "600", "700"], variable: "--hd-oswald" });
const cousine = Cousine({ subsets: ["latin", "cyrillic"], weight: ["400", "700"], variable: "--hd-cousine" });

// номера глав остаются в данных для сверки, но на странице не показываются — они сбивают атмосферу
const ch = (_r?: Ref, _short = false) => null;
/** убирает «гл. 56», «гл. 58, 61» из подписей */
const noCh = (t: string) => t.replace(/[,(]?\s*гл\.\s*[\d\s,–-]+\)?/g, "").replace(/\(\s*\)/g, "").trim();

/** анкета: короткие строки по две в ряд, длинные — на всю ширину */
function identRows(rows: IdentRow[]) {
  const out: IdentRow[][] = [];
  let pair: IdentRow[] = [];
  for (const r of rows) {
    if (r.wide) {
      if (pair.length) out.push(pair), (pair = []);
      out.push([r]);
    } else {
      pair.push(r);
      if (pair.length === 2) out.push(pair), (pair = []);
    }
  }
  if (pair.length) out.push(pair);
  return out;
}

/** SVG-фильтры: неровная краска печати, мазок кисти, оттиск штампа, мятый край карточки */
function Filters() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <filter id="hd-ink" x="-2%" y="-2%" width="104%" height="104%">
        <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves={2} seed={4} result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale={1.4} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves={1} seed={7} result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 1.55" result="a" />
        <feComposite in="d" in2="a" operator="in" />
      </filter>
      <filter id="hd-brush" x="-3%" y="-20%" width="106%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency=".04 .5" numOctaves={3} seed={3} result="w" />
        <feDisplacementMap in="SourceGraphic" in2="w" scale={7} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves={1} seed={9} result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.6" result="a" />
        <feComposite in="d" in2="a" operator="in" />
      </filter>
      <filter id="hd-rough" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={2} seed={2} result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.75" result="a" />
        <feComposite in="SourceGraphic" in2="a" operator="in" result="s" />
        <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves={2} seed={5} result="w" />
        <feDisplacementMap in="s" in2="w" scale={3.5} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="hd-worn" x="-3%" y="-3%" width="106%" height="106%">
        <feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves={4} seed={12} result="w" />
        <feDisplacementMap in="SourceGraphic" in2="w" scale={9} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

export function Dossier({ d, backHref }: { d: D; backHref: string }) {
  // без своей подложки — общий планшет без улик
  const plate = `url(${d.art.plate ?? "/art/horror/plate-blank.webp"})`;
  // на общем планшете бумага уже и без улик: блоки ставятся по её краям (см. .hd.blank)
  const blank = !d.art.plate;
  return (
    <main className={`hd-page ${oswald.variable} ${cousine.variable}`}>
      <div className="hd-bg" style={{ backgroundImage: plate }} />
      <div className="hd-vig" />
      <Filters />
      {/* масштаб нужен до первой отрисовки, иначе лист сначала рисуется в 1200 px и потом «наезжает» */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var s=Math.min((innerWidth-28)/1200,1.25),e=document.getElementById("hd-s")||document.head.appendChild(document.createElement("style"));e.id="hd-s";e.textContent=":root{--s:"+s+"}"})()`,
        }}
      />
      <Fit>
        <article className={`hd${blank ? " blank" : ""}`} style={{ backgroundImage: plate }} aria-label={`Досье: ${d.name}`}>

          <header className="ink head">
            <svg viewBox="0 0 70 70" aria-hidden>
              <g stroke="#2a2420" strokeWidth="1.4">
                <path d="M35 2v8M35 60v8M2 35h8M60 35h8M11 11l6 6M53 53l6 6M59 11l-6 6M17 53l-6 6" />
              </g>
              <circle cx="35" cy="35" r="22" fill="none" stroke="#2a2420" strokeWidth="2.4" />
              <path d="M21 36 35 24l14 12v12h-8v-8h-12v8h-8z" fill="#2a2420" />
              <path d="M32 44h6" stroke="#8e1016" strokeWidth="2.4" />
            </svg>
            <div>
              <h1>КАРТОЧКА ОБИТАТЕЛЯ</h1>
              <p>ДОМ С ПРИВИДЕНИЯМИ ГОРОДА ЗАПАДНЫЙ ЦЗЮЦЗЯН</p>
              <div className="uline" />
            </div>
          </header>

          {d.lead ? (
            <>
              {/* архивная запись: справка → анкета → способности слева от пропуска */}
              <div className="ink ident v2col">
                <section>
                  <div className="bar">СПРАВКА</div>
                  <div className="box lead">{d.lead.text}</div>
                </section>
                <table>
                  <tbody>
                    {identRows(d.ident).map((row, i) => (
                      <tr key={i}>
                        {row.map((r) => (
                          <FragmentCells key={r.k} r={r} span={row.length === 1 ? 3 : 1} />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {d.checks.map((c) => (
                  <div key={c.title}>
                    <div className="bar">{c.title}</div>
                    <div className="row" style={{ gridTemplateColumns: `repeat(${c.options.length},1fr)` }}>
                      {c.options.map((o) => (
                        <div key={o.label}>
                          <span className={`cb${o.on ? " x" : ""}`} aria-label={o.on ? "отмечено" : "не отмечено"} />
                          {o.on ? <b>{o.label}</b> : o.label}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <section>
                  <div className="bar">{d.abilities.title}</div>
                  <table>
                    <tbody>
                      {d.abilities.rows.map((r) => (
                        <tr key={r.k}>
                          <td className="k" style={{ width: 92 }}>
                            {r.k}
                          </td>
                          <td>{r.text}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
                <section>
                  <div className="bar">ОБЛИК</div>
                  <ul>
                    {d.look.map((l) => (
                      <li key={l.text}>{l.text}</li>
                    ))}
                  </ul>
                </section>
                {d.links?.length ? (
                  <section className="linksec">
                    <div className="bar">СВЯЗИ</div>
                    {/* картотека связей: имя — отношение; строки переносятся, блок растёт по высоте */}
                    <ul className="links">
                      {d.links.map((l) => (
                        <li key={l.id}>
                          <Link href={`/books/my-house-of-horrors/${l.id}`}>{l.name}</Link>
                          <span>{l.role}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>

              {/* под пропуском во всю ширину: характер и история */}
              <div className="ink v2low">
                <section className="wide">
                  <div className="bar">ХАРАКТЕР</div>
                  <div className="box traits">
                    {d.traits.map((t) => (
                      <p key={t.text}>
                        {t.k && <b>{t.k}.</b>} {t.text}
                      </p>
                    ))}
                    {d.quote && (
                      <blockquote>
                        «{d.quote.text}»{d.quote.to && <cite> — {d.quote.to}</cite>}
                      </blockquote>
                    )}
                  </div>
                </section>
                {d.story && (
                  <section className="wide">
                    <div className="bar">ИСТОРИЯ</div>
                    <div className="box story">{d.story.text}</div>
                  </section>
                )}
              </div>
            </>
          ) : (
            <>
          {/* левая колонка под пропуском: анкета, флажки, способности */}
          <div className="ink ident" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <table>
              <tbody>
                {identRows(d.ident).map((row, i) => (
                  <tr key={i}>
                    {row.map((r) => (
                      <FragmentCells key={r.k} r={r} span={row.length === 1 ? 3 : 1} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {d.checks.map((c) => (
              <div key={c.title}>
                <div className="bar">{c.title}</div>
                <div className="row" style={{ gridTemplateColumns: `repeat(${c.options.length},1fr)` }}>
                  {c.options.map((o) => (
                    <div key={o.label}>
                      <span className={`cb${o.on ? " x" : ""}`} aria-label={o.on ? "отмечено" : "не отмечено"} />
                      {o.on ? <b>{o.label}</b> : o.label}
                      {ch(o.ch, true)}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <div className="bar">{d.abilities.title}</div>
              <table>
                <tbody>
                  {d.abilities.rows.map((r) => (
                    <tr key={r.k}>
                      <td className="k" style={{ width: 105 }}>
                        {r.k}
                      </td>
                      <td>{r.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <section className="ink look">
            <div className="bar">ОБЛИК</div>
            <ul>
              {d.look.map((l) => (
                <li key={l.text}>
                  {l.text}
                  {ch(l.ch, true)}
                </li>
              ))}
            </ul>
          </section>

          <section className="ink feat">
            <div className="bar">ОСОБЕННОСТИ</div>
            <div className="box">
              {d.traits.map((t) => (
                <p key={t.text}>
                  {t.text}
                  {ch(t.ch)}
                </p>
              ))}
            </div>
          </section>

          <section className="ink inc">
            <div className="bar">ЗАФИКСИРОВАННЫЕ ВСТРЕЧИ</div>
            <table>
              <tbody>
                {d.meetings.map((m, i) => (
                  <tr key={m.ch + i}>
                    <td>{String(i + 1).padStart(2, "0")}</td>
                    <td>{m.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="ink com">
            <div className="bar">ЗАПИСЬ ВЛАДЕЛЬЦА</div>
            <div className="box" style={{ height: 96 }}>
              {d.record.text}
              {ch(d.record.ch)}
            </div>
          </section>
          <div className="dark" style={{ left: blank ? 250 : 520, top: blank ? 1242 : 1274, font: "700 16px var(--hd-cousine)" }}>
            Владелец дома:
          </div>
          <div className="sig" style={{ left: blank ? 390 : 660, top: blank ? 1220 : 1252 }}>
            Чэнь Гэ
          </div>

            </>
          )}

          <div className="stamp" style={d.lead ? { left: 900, top: 640, transform: "rotate(-12deg)", zIndex: 6 } : blank ? { left: 700, top: 990, transform: "rotate(-10deg)" } : { left: 812, top: 880, transform: "rotate(12deg)" }}>
            <div>
              <span>{d.stamp.big}</span>
              {d.stamp.small && <small>{d.stamp.small}</small>}
            </div>
          </div>

          {/* пропуск с портретом просто лежит поверх правой части листа */}
          <div className="card-rig">
            <div className="card">
              <div className="art" style={d.art.portrait ? { backgroundImage: `url(${d.art.portrait})` } : undefined}>
                {!d.art.portrait && "портрет ещё не снят"}
              </div>
              <div className="plate" style={d.name.length > 10 ? { fontSize: 25 } : undefined}>
                {d.name.toUpperCase()}
                <small>{d.badge}</small>
              </div>
              <div className="bars" />
              <div className="no">№ {d.no}</div>
            </div>
          </div>

          {/* подписи к уликам на подложке */}
          {d.props.photo && (
            <div className="dark" style={{ left: d.props.photo.x, top: d.props.photo.y, transform: `rotate(${d.props.photo.rot ?? 0}deg)`, fontSize: 23 }}>
              {d.props.photo.title}
              {d.props.photo.sub && noCh(d.props.photo.sub) && (
                <>
                  <br />
                  <span style={{ fontSize: 18 }}>{noCh(d.props.photo.sub)}</span>
                </>
              )}
            </div>
          )}
          {d.props.evidence && (
            <div
              className="dark"
              style={{ left: d.props.evidence.x, top: d.props.evidence.y, width: d.props.evidence.w, transform: `rotate(${d.props.evidence.rot ?? 0}deg)`, fontSize: 21, textAlign: "center" }}
            >
              {d.props.evidence.title}
              {d.props.evidence.sub && noCh(d.props.evidence.sub) && (
                <>
                  <br />
                  <span style={{ fontSize: 16 }}>{noCh(d.props.evidence.sub)}</span>
                </>
              )}
            </div>
          )}
          {/* «Открытые вопросы» убраны с листа по просьбе — в данных остаются */}
          {d.aside && (
            <div className="hand" style={blank ? { left: 150, top: 1520, width: 250, transform: "rotate(5deg)", zIndex: 3, fontSize: 21 } : { left: d.aside.x, top: d.aside.y, width: d.aside.w, transform: `rotate(${d.aside.rot ?? 0}deg)`, zIndex: 3 }}>
              {d.aside.text}
            </div>
          )}
        </article>
        {/* боковой язычок папки: в отдельном слое того же масштаба, чтобы мог выступать за край кадра;
            правый край обрезан по краю бумаги — язычок уходит под лист */}
        <div className="hd-tabs">
          <BackTab href={backHref} edge={blank ? 19 : 124} top={blank ? 300 : 380} />
        </div>
      </Fit>
    </main>
  );
}

function FragmentCells({ r, span }: { r: IdentRow; span: number }) {
  return (
    <>
      <td className="k" style={{ width: 105 }}>
        {r.k}:
      </td>
      <td colSpan={span}>
        {r.v}
        {ch(r.ch)}
      </td>
    </>
  );
}
