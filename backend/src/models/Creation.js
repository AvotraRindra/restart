const db =
  require("../config/db");


/* =========================================================
   SUPPRIMER LES ANCIENNES CRÉATIONS
========================================================= */

async function clearForMemory(
  memoryId
) {

  await db.execute(
    "DELETE FROM book_pages WHERE memory_id = ?",
    [memoryId]
  );


  await db.execute(
    "DELETE FROM video_scenes WHERE memory_id = ?",
    [memoryId]
  );


  await db.execute(
    "DELETE FROM comic_panels WHERE memory_id = ?",
    [memoryId]
  );
}


/* =========================================================
   LIVRE
========================================================= */

async function saveBook(
  memoryId,
  pages
) {

  await clearForMemory(
    memoryId
  );


  for (
    const page
    of pages || []
  ) {

    await db.execute(
      `
      INSERT INTO book_pages
      (
        memory_id,
        page_number,
        title,
        content,
        image_prompt,
        image_url
      )

      VALUES (?, ?, ?, ?, ?, ?)
      `,

      [
        memoryId,

        page.page_number,

        page.title ||
          null,

        page.content ||
          "",

        page.image_prompt ||
          null,

        page.image_url ||
          null,
      ]
    );
  }
}


/* =========================================================
   VIDÉO
========================================================= */

async function saveVideo(
  memoryId,
  scenes
) {

  await clearForMemory(
    memoryId
  );


  for (
    const scene
    of scenes || []
  ) {

    await db.execute(
      `
      INSERT INTO video_scenes
      (
        memory_id,
        scene_number,
        duration_seconds,
        narration,
        image_prompt,
        image_url,
        video_url
      )

      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,

      [
        memoryId,

        scene.scene_number,

        scene.duration_seconds ||
          5,

        scene.narration ||
          null,

        scene.image_prompt ||
          null,

        scene.image_url ||
          null,

        scene.video_url ||
          null,
      ]
    );
  }
}


/* =========================================================
   BANDE DESSINÉE
========================================================= */

async function saveComic(
  memoryId,
  panels
) {

  await clearForMemory(
    memoryId
  );


  for (
    const panel
    of panels || []
  ) {

    await db.execute(
      `
      INSERT INTO comic_panels
      (
        memory_id,
        panel_number,
        narration,
        dialogue,
        image_prompt,
        image_url
      )

      VALUES (?, ?, ?, ?, ?, ?)
      `,

      [
        memoryId,

        panel.panel_number,

        panel.narration ||
          null,

        panel.dialogue ||
          null,

        panel.image_prompt ||
          null,

        panel.image_url ||
          null,
      ]
    );
  }
}


/* =========================================================
   ENREGISTRER L'IMAGE D'UNE CASE
========================================================= */

async function updateComicPanelImage(
  memoryId,
  panelNumber,
  imageUrl
) {

  const [result] =
    await db.execute(
      `
      UPDATE comic_panels

      SET image_url = ?

      WHERE
        memory_id = ?
        AND panel_number = ?
      `,

      [
        imageUrl,
        memoryId,
        panelNumber,
      ]
    );


  return (
    result.affectedRows > 0
  );
}


/* =========================================================
   RÉCUPÉRATION
========================================================= */

async function get(
  memory
) {

  /* ----------------------------
     LIVRE
  ---------------------------- */

  if (
    memory.memory_type ===
    "livre"
  ) {

    const [rows] =
      await db.execute(
        `
        SELECT *

        FROM book_pages

        WHERE memory_id = ?

        ORDER BY page_number
        `,

        [
          memory.id
        ]
      );


    return rows;
  }


  /* ----------------------------
     VIDÉO
  ---------------------------- */

  if (
    memory.memory_type ===
    "video"
  ) {

    const [rows] =
      await db.execute(
        `
        SELECT *

        FROM video_scenes

        WHERE memory_id = ?

        ORDER BY scene_number
        `,

        [
          memory.id
        ]
      );


    return rows;
  }


  /* ----------------------------
     BD
  ---------------------------- */

  const [rows] =
    await db.execute(
      `
      SELECT *

      FROM comic_panels

      WHERE memory_id = ?

      ORDER BY panel_number
      `,

      [
        memory.id
      ]
    );


  return rows;
}


module.exports = {

  clearForMemory,

  saveBook,

  saveVideo,

  saveComic,

  updateComicPanelImage,

  get,

};
