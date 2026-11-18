# Арты для архива 101: промпты для Gemini (Nano Banana)

Готовые картинки клади в `public/art/101/` **с точно такими именами**: страница подхватит их сама.
Пока файла нет, на его месте остаётся старая заглушка.

## Как генерировать

- Промпты на английском: модель так точнее держит стиль. Пояснения на русском.
- **Пары «норма → правда» делай правкой.** Сгенерируй первую картинку, затем в том же чате напиши второй промпт («Edit this image: …»). Так сохраняются композиция и лица, и на странице одна картинка плавно перетекает в другую.
- Соотношение сторон пиши в промпте. Если Gemini его игнорирует, обрежь потом.
- Сохраняй в PNG или JPG. Если файл JPG, назови его `.png` или скажи мне, я поправлю путь.

**Общий стиль (уже вставлен в каждый промпт):** «painterly cinematic illustration, Korean webnovel horror, warm film grain, soft volumetric light, muted palette, no text, no watermark».

**Правило по героям:** гостей отеля (Гаин, Сынёп и другие) не показываем в лицо. Только со спины, в тени или вне кадра. Лица есть только у «семей».

---

## 1. Первый экран: утро в доме Гаина (гл. 5–6)

Сцена во всю ширину. Поверх неё будут кликабельные точки: мама, отец, Хиган, рисоварка, портрет на стене. Под курсором будет проступать вторая версия, «правда».
**Композицию держи именно такой**, иначе точки окажутся мимо.

### `hero-home.png` (16:9)
```
Painterly cinematic illustration, Korean webnovel horror, warm film grain, soft volumetric morning light, muted warm palette, no text, no watermark. 16:9 wide shot, first-person view from a hallway doorway into a cozy modern Korean apartment at breakfast time.
LEFT third: a middle-aged Korean mother in an apron stands by the kitchen counter next to a closed electric rice cooker, mouth open as if calling someone, smiling.
CENTER: a small dining table with four bowls of rice and side dishes; a high-school girl (17, school uniform, ponytail) sits at the table holding chopsticks, looking toward the viewer with a bright playful smile.
RIGHT third: a middle-aged Korean father in a cardigan sits on a sofa in the living room, eating from a small bowl, newspaper beside him.
On the back wall above the table hangs a framed family photo (mother, father, the girl and a young man whose face is blurred).
Everything looks warm, wholesome and ordinary, but the smiles are slightly too perfect.
```

### `hero-home-mad.png` (правка предыдущей)
```
Edit this image, keep the exact same composition, camera, people and furniture positions. Turn it into the hidden horror version:
the rice in every bowl is crawling with pale silkworm larvae; the father on the sofa chews something wriggling, a larva hanging from his lips; the mother's smile is stretched far too wide and her eyes are glossy black; the girl's smile is frozen, eyes empty, a larva on her chopsticks; the rice cooker is unopened and dusty; in the framed photo the young man's place is scratched out.
Light turns sickly amber-red, wallpaper stained, deep shadows. Same painterly style, no gore, no text.
```

---

## 2. Альбом: 6 фото «семей» (гл. 6–10)

Лицевая сторона: тёплое «семейное фото». Оборот: правда. **Оборот делай правкой лица** («Edit this image…»).
Формат 4:5. Не обязательно делать все сразу: каждая пара подхватывается отдельно.

### Хан Гаин: `album-han-gain.png` / `album-han-gain-truth.png`
```
Faded 2000s family snapshot, warm overexposed film colors, grain, 4:5, no text, no border. A Korean family on a sunny trip to an arboretum: mother, father and a high-school girl laughing in a meadow of lilies of the valley, a young man seen only from behind at the edge of the frame. Everyone holds garden scissors. Wholesome, but the smiles are a little too wide.
```
```
Edit this image, same composition and people: the family is happily cutting and tearing the plants to shreds with the scissors, the girl rips lilies of the valley apart laughing, the mother pulls an earthworm out of the soil. Overcast cold light, desaturated, uneasy. Painterly horror, no gore, no text.
```

### Ча Джинчхоль: `album-cha-jinchul.png` / `album-cha-jinchul-truth.png`
```
Faded 2000s snapshot, warm film colors, grain, 4:5, no text. A proud Korean mother and an older school director in a suit hold up a golden trophy beside a tall young athlete seen from behind, confetti, tournament hall with banners. Celebration, smiles a bit too fixed.
```
```
Edit this image, same composition: the hall is dark and empty, the trophy lies on the floor under a single spotlight, a mayor in a suit on a podium in silhouette holds a smoking pistol, the mother and the director still smile and clap. Implied violence only, no gore, no text.
```

### Ли Ынсоль: `album-lee-eunsol.png` / `album-lee-eunsol-truth.png`
```
Faded 2000s snapshot, warm film colors, grain, 4:5, no text. A large wealthy Korean family posing in the grand hall of a mansion: elderly father seated in the center, siblings and relatives around him, a young woman seen from behind at the edge. Formal, stiff smiles, two brothers glaring at each other.
```
```
Edit this image, same composition: night, the same hall, an overturned chair, a testament document on the marble floor, the long shadow of a brother holding a knife on the wall, the family still smiling at the camera. No gore, no readable text.
```

### Ю Сонъи: `album-yu-sonyi.png` / `album-yu-sonyi-truth.png`
```
Faded 2000s snapshot, warm film colors, grain, 4:5, no text. A cozy living room full of pets: two dogs, three cats, a rabbit and a parrot crowd around a girl seen from behind sitting on the sofa; her parents smile behind it. Cute, but every animal stares into the camera.
```
```
Edit this image, same composition: the girl is gone, only her torn cardigan on the sofa; the pets sit around it with glowing eyes and dark-stained muzzles, the parents still smile. Dim red light. Implied horror, no gore, no text.
```

### Елена Иванова: `album-elena-ivanova.png` / `album-elena-ivanova-truth.png`
```
Faded 2000s snapshot, warm candle-lit film colors, grain, 4:5, no text. A family dinner in a European-style apartment: mother, father and a smiling blonde younger sister raise wine glasses over a festive table; a blonde young woman is seen from behind at the near end of the table.
```
```
Edit this image, same composition: the parents are slumped over the table clutching their stomachs, glasses tipped over, a small glass poison vial beside the sister's plate; the sister alone keeps smiling and raises her glass. No gore, no text.
```

### Пак Сынёп: `album-park-seungyeop.png` / `album-park-seungyeop-truth.png`
```
Faded 2000s snapshot, warm film colors, grain, 4:5, no readable text. A small Korean apartment bedroom: a teenage boy seen from behind sits at a gaming PC playing a fantasy MOBA, monitor glowing; his parents stand in the doorway smiling too widely.
```
```
Edit this image, same composition: the boy is gone, the gaming chair is empty and still spinning, the window next to the desk is wide open with curtains blowing outward into the night city; the parents stand frozen with unnaturally wide smiles staring at the open window. Cold blue light, a feeling of escape. No text.
```

---

## 3. Палата: сердце (гл. 76)

Предыдущий промпт отклонил фильтр. Этот мягче, без «плоти».

### `ward-heart.png` (4:5, лучше на тёмном фоне)
```
Dark cosmic horror illustration, 4:5, no text. An alien crystal cave inside an old hospital ward: translucent teal crystals glowing with sourceless light. In the center floats a giant dark-red organic heart, pulsing, wrapped in veins and old hospital tubes, a faint teal glow leaking through hairline cracks. High above, half hidden in darkness, a tall doctor in a white coat and round glasses holds thin puppet strings that run down into the heart. Oppressive, eerie, painterly, dark background.
```
