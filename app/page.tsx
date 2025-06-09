import { redirect } from "next/navigation";

// Redirect root to English version
export default function RootPage() {
  redirect("/en");
}
