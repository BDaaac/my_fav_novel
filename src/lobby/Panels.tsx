"use client";
import { useState } from "react";
import { motion } from "motion/react";
import rooms from "@/data/rooms.json";
import characters from "@/data/characters.json";
import type { HotspotId, SceneState } from "./world";
import type { Skin } from "./skin";
import type { KeyTone, RackKey } from "./LobbySvg";
import { cn } from "@/lib/utils";

type RoomLite = { id: string; runOf?: string | null; title: string; chapters: number[]; outcome: { solved?: boolean | null } };
const ROOMS = rooms as unknown as RoomLite[];

const TONE_LABEL: Record<KeyTone, string> = {
  solved: "Решена · пусто",
  alive: "Источник жив",
  rest: "Комната Отдыха",
  plate: "Табличка без двери",
  unknown: "??",
};

export function rackKeys(): (RackKey & { runs: RoomLite[] })[] {
  return ["101", "102", "103", "104", "105", "106", "107"].map((id) => {
    const runs = ROOMS.filter((r) => r.id === id || r.runOf === id);
    let tone: KeyTone = "unknown";
    if (id === "105") tone = "rest";
    else if (id === "107") tone = "plate";
    else if (runs.some((r) => r.outcome.solved)) tone = "solved";
    else if (runs.length) tone = "alive";
    return { id, tone, runs };
  });
}

const TEAM = ["han-gain", "cha-jinchul", "lee-eunsol", "elena-ivanova", "yu-sonyi", "park-seungyeop"];

function chRange(ch: number[]) {
  if (!ch.length) return "";
  const a = Math.min(...ch);
  const b = Math.max(...ch);
  return a === b ? `гл. ${a}` : `гл. ${a}–${b}`;
}

export type PanelProps = {
  id: HotspotId;
  skin: Skin;
  scene: SceneState;
  setScene: (f: (s: SceneState) => SceneState) => void;
  onClose: () => void;
  onBurn: () => void;
  onBell: () => void;
};

export function Panel(p: PanelProps) {
  const { skin } = p;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22 }}
      className={cn("pointer-events-auto absolute left-1/2 top-1/2 w-[min(640px,92%)] -translate-x-1/2 -translate-y-1/2 p-6", skin.panel)}
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={p.onClose} className={cn("absolute right-3 top-3", skin.btn)} aria-label="Закрыть">
        Esc ✕
      </button>
      <PanelBody {...p} />
    </motion.div>
  );
}

function PanelBody(p: PanelProps) {
  switch (p.id) {
    case "entrance":
      return <EntrancePanel {...p} />;
    case "sign":
      return <SignPanel {...p} />;
    case "desk":
      return <DeskPanel {...p} />;
    case "displays":
      return <DisplaysPanel {...p} />;
    case "elevator":
      return <ElevatorPanel {...p} />;
    case "corridor":
      return <CorridorPanel {...p} />;
    default:
      return null;
  }
}

function Ch({ n, skin }: { n: number; skin: Skin }) {
  return <span className={cn("ml-1 whitespace-nowrap font-system text-[10px]", skin.muted)}>гл. {n}</span>;
}

function EntrancePanel({ skin, scene, setScene }: PanelProps) {
  if (scene.lightsOff)
    return (
      <div className="space-y-3">
        <h2 className={skin.title}>Святилище Благословений</h2>
        <p className={skin.body}>
          Свет погашен, и за стеклом больше нет неба: там тьма, а в ней тёплое свечение. Так открывается Святилище Благословений.<Ch n={39} skin={skin} />
        </p>
        <p className={skin.body}>
          Там Благословение можно «осознать» и «усилить». Право на усиление получает тот, кто сделал решающий вклад в побег или в решение комнаты.<Ch n={40} skin={skin} />
        </p>
        <p className={cn("text-sm", skin.muted)}>Войти можно будет позже. Включите свет у двери, чтобы вернуть небо.</p>
      </div>
    );
  return (
    <div className="space-y-3">
      <h2 className={skin.title}>Парадный вход</h2>
      <p className={skin.body}>
        {scene.doorOpen
          ? "Дверь открыта. За порогом нет улицы: только синева и облака далеко внизу. Отель «Пионер» парит в небе."
          : "Стеклянные двери. За ними светло, как днём, но улицы не видно."}
        <Ch n={3} skin={skin} />
      </p>
      {scene.doorOpen && (
        <p className={skin.body}>
          Шагнуть наружу без особого снаряжения значит разбиться.<Ch n={3} skin={skin} />
        </p>
      )}
      <div className="flex gap-2 pt-1">
        <button className={skin.btn} onClick={() => setScene((s) => ({ ...s, doorOpen: !s.doorOpen }))}>
          {scene.doorOpen ? "Закрыть дверь" : "Открыть дверь"}
        </button>
      </div>
    </div>
  );
}

function SignPanel({ skin }: PanelProps) {
  return (
    <div className="space-y-3">
      <h2 className={skin.title}>«Путь к спасению 2»</h2>
      <p className={skin.body}>
        Надпись у входа: «Путь к спасению 2. Требуется создание специального Предмета». Раз есть второй путь, значит, путей побега несколько.
        <Ch n={3} skin={skin} />
      </p>
      <p className={cn("text-sm", skin.muted)}>Какой Предмет нужен, отель пока не говорит.</p>
    </div>
  );
}

function DeskPanel({ skin, onBell }: PanelProps) {
  const [tab, setTab] = useState<"keys" | "bell" | "book">("keys");
  const keys = rackKeys();
  const [sel, setSel] = useState("103");
  const [rang, setRang] = useState(false);
  const k = keys.find((x) => x.id === sel)!;
  const team = TEAM.map((id) => characters.find((c) => c.id === id)).filter(Boolean) as { id: string; name: string; stat: string | null; role?: string }[];

  return (
    <div className="space-y-4">
      <h2 className={skin.title}>Стойка регистрации</h2>
      <div className="flex flex-wrap gap-2">
        {([
          ["keys", "Стенд ключей"],
          ["bell", "Колокольчик"],
          ["book", "Гостевая книга"],
        ] as const).map(([id, label]) => (
          <button key={id} className={cn(skin.btn, tab === id && "opacity-100 ring-2 ring-current")} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "keys" && (
        <div className="space-y-3">
          <div className="grid grid-cols-7 gap-2">
            {keys.map((x) => (
              <button key={x.id} onClick={() => setSel(x.id)} className={cn(skin.chip, "text-center font-system text-sm", sel === x.id && "ring-2 ring-current")}>
                {x.id}
              </button>
            ))}
          </div>
          <div className={cn("p-3", skin.chip)}>
            <div className="flex items-baseline justify-between gap-3">
              <span className={cn("font-system text-lg")}>№ {k.id}</span>
              <span className="font-system text-xs uppercase tracking-wider">{TONE_LABEL[k.tone]}</span>
            </div>
            {k.runs.length > 0 ? (
              <ul className={cn("mt-2 space-y-1", skin.body)}>
                {k.runs.map((r, i) => (
                  <li key={r.id} className="flex justify-between gap-3">
                    <span>
                      {i + 1}. {r.title}
                    </span>
                    <span className={cn("font-system text-xs", skin.muted)}>
                      {chRange(r.chapters)} · {r.outcome.solved ? "решена" : "сбежали"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={cn("mt-2", skin.body)}>
                {k.id === "105" ? "Номер команды. Монстры не переступают порог, отель здесь лечит." : "На стенде есть табличка 107, но двери с таким номером в коридоре нет."}
              </p>
            )}
          </div>
        </div>
      )}

      {tab === "bell" && (
        <div className="space-y-3">
          <p className={skin.body}>
            Персонал отеля застенчив: работает, только когда на него не смотрят.<Ch n={2} skin={skin} />
          </p>
          <button
            className={skin.btn}
            onClick={() => {
              setRang(true);
              onBell();
            }}
          >
            🔔 Позвонить
          </button>
          {rang && <p className={cn("text-sm", skin.muted)}>Динь. Никто не вышел. Отойдите от стойки и отвернитесь.</p>}
        </div>
      )}

      {tab === "book" && (
        <div className="space-y-2">
          <p className={cn("text-sm", skin.muted)}>Постояльцы номера 105. Досье откроются в 105-м.</p>
          <ul className="grid grid-cols-2 gap-2">
            {team.map((c) => (
              <li key={c.id} className={cn("p-2", skin.chip)}>
                <div className={skin.body}>{c.name}</div>
                <div className={cn("font-system text-[11px]", skin.muted)}>Благословение: {c.stat ?? "—"}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const RULES: { text: string; ch: number }[] = [
  { text: "Отель любит своих гостей.", ch: 1 },
  { text: "Лифт работает не полностью.", ch: 1 },
  { text: "Отель бережёт приватность гостей, но предлагает есть вместе.", ch: 1 },
  { text: "Персонал застенчив и работает, только когда на него не смотрят.", ch: 2 },
  { text: "В номерах встречаются «не слишком чистоплотные прежние постояльцы». Входите вместе: если выйдет хоть один, проблем не будет.", ch: 14 },
  { text: "Когда гости скучают, особых событий становится больше.", ch: 14 },
];

function DisplaysPanel({ skin }: PanelProps) {
  return (
    <div className="space-y-3">
      <h2 className={skin.title}>Правила отеля</h2>
      <p className={cn("text-sm", skin.muted)}>Дисплеи мигают, список пополняется. Его всегда можно перечитать.</p>
      <ol className={cn("space-y-2 p-3", skin.system)}>
        {RULES.map((r, i) => (
          <li key={i} className="text-[13px] leading-snug">
            [{i + 1}] {r.text} <span className="opacity-50">· гл. {r.ch}</span>
          </li>
        ))}
        <li className="animate-pulse">▌</li>
      </ol>
    </div>
  );
}

function ElevatorPanel({ skin, onBurn }: PanelProps) {
  const [msg, setMsg] = useState("Вы на 1-м этаже.");
  const [pass, setPass] = useState<string | null>(null);
  const floors: [string, string][] = [
    ["3", "Кнопка не работает."],
    ["2", "Кнопка не работает."],
    ["1", "Вы на 1-м этаже."],
    ["Б", "Подвал. Спускаться сейчас «крайне опасно»."],
  ];
  return (
    <div className="space-y-4">
      <h2 className={skin.title}>Лифт</h2>
      <div className="flex gap-6">
        <div className="grid grid-cols-1 gap-2">
          {floors.map(([f, m]) => (
            <button key={f} className={cn(skin.btn, "w-14 font-system")} onClick={() => setMsg(m)}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1 space-y-3">
          <p className={cn("p-3", skin.system)}>{msg}</p>
          <p className={cn("text-sm", skin.muted)}>
            Кнопки 2-го и 3-го этажей не работают.<Ch n={4} skin={skin} /> Рядом с красной кнопкой пометка: «Путь к спасению 1, не сообщать посторонним».<Ch n={26} skin={skin} />
          </p>
          {pass === null ? (
            <button className={skin.btnDanger} onClick={() => setPass("")}>
              ПОБЕГ
            </button>
          ) : (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                onBurn();
              }}
            >
              <input
                autoFocus
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Пароль"
                className={cn("w-40 bg-transparent px-2 py-1 font-system text-sm outline-none", skin.chip)}
              />
              <button className={skin.btnDanger}>Ввести</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function CorridorPanel({ skin }: PanelProps) {
  return (
    <div className="space-y-3">
      <h2 className={skin.title}>Коридор 101–107</h2>
      <p className={skin.body}>Арка ведёт к номерам первого этажа. Двери 101–106 и табличка 107, у которой нет двери.</p>
      <p className={cn("text-sm", skin.muted)}>Коридор и комнаты — следующий шаг демо, после выбора стиля.</p>
    </div>
  );
}
