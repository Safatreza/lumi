import { redirect } from "next/navigation";

/** The scribe marketplace is now part of the Human Support Pool (Module 2). */
export default function ScribeRedirect() {
  redirect("/pool");
}
