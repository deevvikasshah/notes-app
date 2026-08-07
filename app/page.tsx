// app/page.tsx
import NotesClient from "./NotesClient";

async function getNotes() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/notes`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    hour: "2-digit", 
    minute: "2-digit",
    timeZone: "UTC"
  });
}

export default async function Home() {
  const notes = await getNotes();
  const notesWithFormattedDate = notes.map((note: { createdAt: number }) => ({
    ...note,
    formattedDate: formatDate(note.createdAt),
  }));
  return <NotesClient initialNotes={notesWithFormattedDate} />;
}