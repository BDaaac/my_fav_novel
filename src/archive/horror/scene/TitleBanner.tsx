import { TITLE } from "@/data/horror/board/geometry";

/** надпись нарисована на ткани в кадре; здесь — настоящий заголовок для чтения с экрана */
export function TitleBanner() {
  return (
    <h1 className="hs-title" style={{ left: TITLE.x, top: TITLE.y, width: TITLE.w, height: TITLE.h }}>
      Мой дом ужасов
    </h1>
  );
}
