// In-memory store (resets on server restart)
let notes = [
  { id: 1, title: 'Welcome', content: 'This is your first note!', createdAt: Date.now() }
];
let nextId = 2;

// Helper: format date in UTC for consistent hydration
function formatDateUTC(ts) {
  return new Date(ts).toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    hour: "2-digit", 
    minute: "2-digit",
    timeZone: "UTC"
  });
}

// Helper: validate note input
function validateNote(data) {
  const errors = {};
  if (!data.title || !data.title.trim()) errors.title = 'Title is required';
  else if (data.title.length > 100) errors.title = 'Title max 100 chars';
  if (!data.content || !data.content.trim()) errors.content = 'Content is required';
  else if (data.content.length > 5000) errors.content = 'Content max 5000 chars';
  return errors;
}

// Helper: add formattedDate to note
function withFormattedDate(note) {
  return { ...note, formattedDate: formatDateUTC(note.createdAt) };
}

// GET /api/notes - Return all notes
export async function GET() {
  return Response.json(notes.sort((a, b) => b.createdAt - a.createdAt).map(withFormattedDate));
}

// POST /api/notes - Create new note
export async function POST(request) {
  const body = await request.json();
  const errors = validateNote(body);
  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 400 });
  }
  const note = {
    id: nextId++,
    title: body.title.trim(),
    content: body.content.trim(),
    createdAt: Date.now()
  };
  notes.push(note);
  return Response.json(withFormattedDate(note), { status: 201 });
}

// PUT /api/notes - Update note (expects { id, title, content })
export async function PUT(request) {
  const body = await request.json();
  const { id, title, content } = body;
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 });
  
  const errors = validateNote({ title, content });
  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 400 });
  }
  
  const index = notes.findIndex(n => n.id === id);
  if (index === -1) return Response.json({ error: 'Not found' }, { status: 404 });
  
  notes[index] = { ...notes[index], title: title.trim(), content: content.trim() };
  return Response.json(withFormattedDate(notes[index]));
}

// DELETE /api/notes - Delete note (expects { id })
export async function DELETE(request) {
  const body = await request.json();
  const { id } = body;
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 });
  
  const index = notes.findIndex(n => n.id === id);
  if (index === -1) return Response.json({ error: 'Not found' }, { status: 404 });
  
  notes.splice(index, 1);
  return new Response(null, { status: 204 });
}