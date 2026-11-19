import { redirect } from "next/navigation";

// Картотека переехала на главную; старый адрес оставлен, чтобы закладки не ломались.
export default function OldPeople() {
  redirect("/");
}
