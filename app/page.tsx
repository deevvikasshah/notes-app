// app/page.tsx
import NotesClient from "./NotesClient";

async function getNotes() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/notes`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function Home() {
  const notes = await getNotes();
  return <NotesClient initialNotes={notes} />;
}