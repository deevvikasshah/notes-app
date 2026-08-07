// app/page.tsx
import { headers } from "next/headers";
import NotesClient from "./NotesClient";

async function getNotes() {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const apiUrl = `${protocol}://${host}/api/notes`;

  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  const notes = await getNotes();
  return <NotesClient initialNotes={notes} />;
}