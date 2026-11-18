"use client";
import { AlbumRun } from "./Home";
import { Hero } from "./Hero";
import { House } from "./House";
import { Broadcast, TvZoom } from "./Broadcast";
import { Search } from "./Search";
import { Corridor } from "./Corridor";
import { Ward } from "./Sangmin";
import { Finale } from "./Finale";
import { Legacy } from "./Legacy";
import { Epilogue } from "./Epilogue";
import { InfectionProvider } from "./infection";
import { ArtProvider } from "./artfiles";
import { Care } from "./Care";
import { StoryProvider, useStory } from "./story";

/**
 * Архив комнаты 101 — не справочник, а сама комната, пройденная за пять попыток.
 * 1: утро в доме и семейные чаты → 2: ночной дом (Re) → наезд в экран →
 * 3: подвал студии (смерть) → 4: поиск, коридор, палата (выстрел, смерть) → 5: страж, ком, камень → финал.
 * data-sage — подсказка Совета Мудреца для сцены.
 */
export function Room101({ art }: { art: string[] }) {
  return (
    <ArtProvider files={art}>
      <InfectionProvider>
        <StoryProvider>
          <Care />
          <main className="overflow-x-clip">
            <div data-sage="Трогайте вещи в комнате. Заметить безумие — первый шаг к побегу.">
              <Hero />
            </div>
            <Seam from="#140d08" to="var(--paper)" />
            <div data-sage="Не отвечайте «семье». Выбрался тот, кто не читал сообщений.">
              <AlbumRun />
            </div>
            <Seam from="var(--paper)" to="#14161d" tall />
            <div data-sage="Отойдите от «семьи» на десять минут и не оборачивайтесь на зов.">
              <House />
            </div>
            <TvZoom />
            <div data-sage="Нарушьте все правила подвала. Смерть здесь тоже приносит сведения.">
              <Broadcast />
            </div>
            <div data-sage="В блокноте три слова. Найдите все три.">
              <Search />
            </div>
            <div data-sage="Фильтр на этом этаже не выдержит. Берите браслет или Красное лекарство.">
              <Corridor />
            </div>
            <div data-sage="Шум зовёт медсестёр. Потом: свалить стража, бить ком, держать камень до конца.">
              <Ward />
            </div>
            <Ending />
          </main>
        </StoryProvider>
      </InfectionProvider>
    </ArtProvider>
  );
}

/** Финал открывается, только когда Источник Проклятий уничтожен. */
function Ending() {
  const { won } = useStory();
  if (!won)
    return (
      <section className="bg-[#020606] px-6 pb-40 pt-24 text-center text-[#cfeee8]">
        <div className="mx-auto h-16 w-px bg-[#c0333d]/60" />
        <p className="mt-6 font-display text-3xl">Дальше пути нет.</p>
        <p className="mx-auto mt-3 max-w-md font-display text-[18px] leading-relaxed opacity-60">Источник Проклятий ещё бьётся. Пока он жив, номер 101 никого не отпустит.</p>
      </section>
    );
  return (
    <Finale>
      <Legacy />
      <Epilogue />
    </Finale>
  );
}

/** Мягкий шов между сценами: один цвет перетекает в другой, без резкой границы. */
function Seam({ from, to, tall }: { from: string; to: string; tall?: boolean }) {
  return <div aria-hidden className={tall ? "h-72" : "h-40"} style={{ background: `linear-gradient(${from}, ${to})` }} />;
}
