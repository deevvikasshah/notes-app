// app/NotesClient.tsx
"use client";

import { useState, FormEvent, ChangeEvent } from "react";

type Note = {
  id: number;
  title: string;
  content: string;
  createdAt: number;
};

type FormData = {
  title: string;
  content: string;
};

export default function NotesClient({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({ title: "", content: "" });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showForm, setShowForm] = useState(false);

  const validate = (data: FormData) => {
    const errs: Partial<FormData> = {};
    if (!data.title.trim()) errs.title = "Title required";
    else if (data.title.length > 100) errs.title = "Max 100 chars";
    if (!data.content.trim()) errs.content = "Content required";
    else if (data.content.length > 5000) errs.content = "Max 5000 chars";
    return errs;
  };

  const api = async (method: string, body: object) => {
    const res = await fetch("/api/notes", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(formData);
    if (Object.keys(errs).length) return setErrors(errs);

    try {
      if (editingId) {
        const updated = await api("PUT", { ...formData, id: editingId });
        setNotes(notes.map((n) => (n.id === editingId ? updated : n)));
        setEditingId(null);
      } else {
        const created = await api("POST", formData);
        setNotes([created, ...notes]);
      }
      setFormData({ title: "", content: "" });
      setShowForm(false);
      setErrors({});
    } catch (err: unknown) {
  const error = err as { errors?: Partial<FormData> };
  if (error.errors) setErrors(error.errors);
}
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this note?")) return;
    try {
      await api("DELETE", { id });
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err: unknown) {
  const error = err as { error?: string };
  alert(error.error || "Failed to delete");
}
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setFormData({ title: note.title, content: note.content });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", content: "" });
    setShowForm(false);
    setErrors({});
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notes</h1>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setFormData({ title: "", content: "" }); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + New Note
          </button>
        </div>

        {/* Form */}
        {(showForm || editingId) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {editingId ? "Edit Note" : "New Note"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  maxLength={100}
                  placeholder="Note title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.content ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  maxLength={5000}
                  placeholder="Write your note..."
                />
                {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition">
                  {editingId ? "Save Changes" : "Create Note"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No notes yet</p>
            <p className="text-sm mt-1">Click "New Note" to create your first note</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{note.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(note.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => startEdit(note)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}