const db = require("../config/db");

async function clearForMemory(memoryId) {
  await db.execute("DELETE FROM book_pages WHERE memory_id = ?", [memoryId]);
  await db.execute("DELETE FROM video_scenes WHERE memory_id = ?", [memoryId]);
  await db.execute("DELETE FROM comic_panels WHERE memory_id = ?", [memoryId]);
}
async function saveBook(memoryId, pages) {
  await clearForMemory(memoryId);
  for (const p of pages || []) {
    await db.execute("INSERT INTO book_pages (memory_id, page_number, title, content, image_prompt) VALUES (?, ?, ?, ?, ?)",
      [memoryId, p.page_number, p.title || null, p.content || "", p.image_prompt || null]);
  }
}
async function saveVideo(memoryId, scenes) {
  await clearForMemory(memoryId);
  for (const s of scenes || []) {
    await db.execute("INSERT INTO video_scenes (memory_id, scene_number, duration_seconds, narration, image_prompt) VALUES (?, ?, ?, ?, ?)",
      [memoryId, s.scene_number, s.duration_seconds || 5, s.narration || null, s.image_prompt || null]);
  }
}
async function saveComic(memoryId, panels) {
  await clearForMemory(memoryId);
  for (const p of panels || []) {
    await db.execute("INSERT INTO comic_panels (memory_id, panel_number, narration, dialogue, image_prompt) VALUES (?, ?, ?, ?, ?)",
      [memoryId, p.panel_number, p.narration || null, p.dialogue || null, p.image_prompt || null]);
  }
}
async function get(memory) {
  if (memory.memory_type === "livre") {
    const [rows] = await db.execute("SELECT * FROM book_pages WHERE memory_id = ? ORDER BY page_number", [memory.id]); return rows;
  }
  if (memory.memory_type === "video") {
    const [rows] = await db.execute("SELECT * FROM video_scenes WHERE memory_id = ? ORDER BY scene_number", [memory.id]); return rows;
  }
  const [rows] = await db.execute("SELECT * FROM comic_panels WHERE memory_id = ? ORDER BY panel_number", [memory.id]); return rows;
}
module.exports = { clearForMemory, saveBook, saveVideo, saveComic, get };
