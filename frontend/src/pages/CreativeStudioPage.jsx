import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  addComicCharacter,
  generateMemory,
  getCreation,
  imageUrl,
  uploadMemoryPhotos,
} from "../services/memoryApi.js";

import Book3DViewer
  from "../components/Book3DViewer.jsx";

import "../styles/comic-images.css";


const typeLabel = {
  livre: "Livre souvenir",
  video: "Vidéo",
  bd: "Bande dessinée",
};


const typeIcon = {
  livre: "▱",
  video: "▶",
  bd: "▤",
};


export default function CreativeStudioPage({
  memories = [],
  setPage,
  onChanged,
  initialMemoryId = "",
}) {

  const [
    selectedId,
    setSelectedId,
  ] = useState(
    () =>
      initialMemoryId ||
      memories[0]?.id ||
      ""
  );


  const [
    creation,
    setCreation,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    notice,
    setNotice,
  ] = useState("");


  const [
    photos,
    setPhotos,
  ] = useState([]);


  const [
    characterName,
    setCharacterName,
  ] = useState("");


  const [
    characterImage,
    setCharacterImage,
  ] = useState(null);


  /* =====================================================
     SÉLECTION DU SOUVENIR
  ===================================================== */

  useEffect(() => {

    if (
      initialMemoryId &&
      memories.some(
        (memory) =>
          String(memory.id) ===
          String(initialMemoryId)
      )
    ) {

      setSelectedId(
        initialMemoryId
      );

    } else if (
      !selectedId &&
      memories[0]?.id
    ) {

      setSelectedId(
        memories[0].id
      );
    }

  }, [
    memories,
    selectedId,
    initialMemoryId,
  ]);


  const memory =
    useMemo(
      () =>
        memories.find(
          (item) =>
            String(item.id) ===
            String(selectedId)
        ) || null,

      [
        memories,
        selectedId,
      ]
    );


  /* =====================================================
     RECHARGER LA CRÉATION
  ===================================================== */

  async function refresh(
    id = selectedId,
    quiet = false
  ) {

    if (!id) {
      return;
    }


    if (!quiet) {
      setLoading(true);
    }


    setError("");


    try {

      const response =
        await getCreation(
          id
        );


      setCreation(
        response?.data ||
        null
      );

    } catch (error) {

      if (
        error.status === 404
      ) {

        setCreation(null);

      } else {

        setError(
          error.message
        );
      }

    } finally {

      if (!quiet) {
        setLoading(false);
      }
    }
  }


  useEffect(() => {

    setCreation(null);

    setNotice("");


    if (selectedId) {

      refresh(
        selectedId,
        true
      );
    }

  }, [selectedId]);


  /* =====================================================
     GÉNÉRATION MNEMOS
  ===================================================== */

  async function generate() {

    if (!memory) {
      return;
    }


    setLoading(true);

    setError("");

    setNotice("");


    try {

      /* -------------------------------------------------
         VIDÉO : uploader les photos
      ------------------------------------------------- */

      if (
        memory.memory_type ===
          "video" &&
        photos.length
      ) {

        setNotice(
          "Envoi des photos…"
        );


        await uploadMemoryPhotos(
          memory.id,
          photos
        );
      }


      /* -------------------------------------------------
         BD : personnage
      ------------------------------------------------- */

      if (
        memory.memory_type ===
          "bd" &&
        characterImage
      ) {

        if (
          !characterName.trim()
        ) {

          throw new Error(
            "Donnez un nom au personnage avant d'envoyer sa photo."
          );
        }


        setNotice(
          "Ajout du personnage de référence…"
        );


        await addComicCharacter(
          memory.id,

          characterName.trim(),

          characterImage
        );
      }


      /* -------------------------------------------------
         GÉNÉRATION
      ------------------------------------------------- */

      setNotice(
        memory.memory_type ===
          "bd"

          ? "MNEMOS écrit la BD puis génère les images des cases…"

          : "MNEMOS génère la création…"
      );


      const generated =
        await generateMemory(
          memory.id
        );


      /* -------------------------------------------------
         Recharger depuis MySQL
      ------------------------------------------------- */

      await refresh(
        memory.id,
        true
      );


      /* -------------------------------------------------
         Avertissements images
      ------------------------------------------------- */

      if (
        generated?.warnings?.length
      ) {

        setNotice(
          `Création terminée. ` +
          `${generated.warnings.length} ` +
          `avertissement(s) pendant ` +
          `la génération des images.`
        );

      } else {

        setNotice(
          "Création générée avec succès."
        );
      }


      /* -------------------------------------------------
         Nettoyage des inputs
      ------------------------------------------------- */

      setCharacterImage(
        null
      );

      setCharacterName("");

      setPhotos([]);


      onChanged?.();

    } catch (error) {

      setError(
        error.details ||
        error.message ||
        "La génération a échoué."
      );


      setNotice("");

    } finally {

      setLoading(false);
    }
  }


  /* =====================================================
     PAS DE SOUVENIRS
  ===================================================== */

  if (!memories.length) {

    return (

      <section className="page-shell">

        <div className="page-head">

          <div>

            <span>
              MNEMOS
            </span>

            <h1>
              Atelier créatif
            </h1>

            <p>
              Transformez un souvenir
              en livre, vidéo ou
              bande dessinée.
            </p>

          </div>

        </div>


        <div className="empty-state">

          <strong>
            Vous n'avez encore
            aucun souvenir.
          </strong>

          <p>
            Créez d'abord un souvenir
            en choisissant sa forme
            créative.
          </p>

          <button
            className="primary-btn"

            onClick={() =>
              setPage?.(
                "new-memory"
              )
            }
          >

            Créer un souvenir

          </button>

        </div>

      </section>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (

    <section
      className="
        page-shell
        studio-live-page
      "
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-head">

        <div>

          <span>
            MNEMOS · ATELIER CRÉATIF
          </span>

          <h1>
            Donnez une nouvelle forme
            à vos souvenirs.
          </h1>

          <p>
            Sélectionnez un souvenir,
            ajoutez les références
            nécessaires puis lancez
            ou relancez sa génération.
          </p>

        </div>


        <button
          className="primary-btn"

          onClick={() =>
            setPage?.(
              "new-memory"
            )
          }
        >

          + Nouveau souvenir

        </button>

      </div>


      {/* =================================================
          MESSAGES
      ================================================= */}

      {error && (

        <div className="inline-alert">

          {error}

        </div>
      )}


      {notice && (

        <div className="success-note">

          {notice}

        </div>
      )}


      {/* =================================================
          CONTENU
      ================================================= */}

      <div className="studio-live-grid">


        {/* ===============================================
            LISTE DES SOUVENIRS
        =============================================== */}

        <aside
          className="
            panel
            studio-memory-list
          "
        >

          <h3>
            Mes souvenirs
          </h3>


          {memories.map(
            (item) => (

              <button
                key={item.id}

                className={
                  String(item.id) ===
                  String(selectedId)

                    ? "active"

                    : ""
                }

                onClick={() =>
                  setSelectedId(
                    item.id
                  )
                }
              >

                <span>
                  {
                    typeIcon[
                      item.memory_type
                    ] ||
                    "✦"
                  }
                </span>


                <div>

                  <strong>
                    {item.title}
                  </strong>

                  <small>

                    {
                      typeLabel[
                        item.memory_type
                      ] ||
                      item.memory_type
                    }

                    {" · "}

                    {
                      item
                        .generation_status ||
                      "pending"
                    }

                  </small>

                </div>

              </button>
            )
          )}

        </aside>


        {/* ===============================================
            CRÉATION
        =============================================== */}

        <main
          className="
            panel
            studio-live-main
          "
        >

          {memory && (

            <>

              {/* -----------------------------------------
                  Titre
              ----------------------------------------- */}

              <div className="studio-live-head">

                <div>

                  <span>

                    {
                      typeIcon[
                        memory.memory_type
                      ]
                    }

                    {" "}

                    {
                      typeLabel[
                        memory.memory_type
                      ]
                    }

                  </span>


                  <h2>
                    {memory.title}
                  </h2>


                  <p>

                    {
                      memory.text_content ||
                      "Souvenir vocal"
                    }

                  </p>

                </div>


                <button
                  className="primary-btn"

                  disabled={loading}

                  onClick={generate}
                >

                  {
                    loading

                      ? "Traitement…"

                      : memory
                          .generation_status ===
                        "completed"

                        ? "↻ Régénérer"

                        : "✦ Générer avec MNEMOS"
                  }

                </button>

              </div>


              {/* -----------------------------------------
                  PHOTOS VIDÉO
              ----------------------------------------- */}

              {
                memory.memory_type ===
                "video" && (

                  <div className="studio-upload-box">

                    <strong>
                      Photos de la vidéo
                    </strong>

                    <p>
                      Ajoutez des photos
                      du souvenir avant
                      de générer ou
                      régénérer le
                      storyboard.
                    </p>


                    <input
                      type="file"

                      accept="
                        image/jpeg,
                        image/png,
                        image/webp
                      "

                      multiple

                      onChange={
                        (event) =>
                          setPhotos(
                            [
                              ...event
                                .target
                                .files,
                            ].slice(
                              0,
                              10
                            )
                          )
                      }
                    />


                    <small>

                      {photos.length}

                      {" photo(s) prête(s) à être envoyée(s)"}

                    </small>

                  </div>
                )
              }


              {/* -----------------------------------------
                  PERSONNAGE BD
              ----------------------------------------- */}

              {
                memory.memory_type ===
                "bd" && (

                  <div className="studio-upload-box">

                    <strong>
                      Personnage de référence
                    </strong>


                    <p>
                      Optionnel :
                      ajoutez une photo.

                      MNEMOS l'utilisera
                      pour garder une
                      apparence plus
                      cohérente entre
                      les cases.
                    </p>


                    <div className="character-upload-row">

                      <input
                        value={
                          characterName
                        }

                        onChange={
                          (event) =>
                            setCharacterName(
                              event
                                .target
                                .value
                            )
                        }

                        placeholder="
                          Nom du personnage
                        "
                      />


                      <input
                        type="file"

                        accept="
                          image/jpeg,
                          image/png,
                          image/webp
                        "

                        onChange={
                          (event) =>
                            setCharacterImage(
                              event
                                .target
                                .files?.[0] ||
                              null
                            )
                        }
                      />

                    </div>

                  </div>
                )
              }


              {/* -----------------------------------------
                  RESULTAT
              ----------------------------------------- */}

              <div className="studio-result-head">

                <div>

                  <span>
                    RÉSULTAT
                  </span>

                  <h3>

                    {
                      creation
                        ?.memory
                        ?.generated_title ||

                      "Création MNEMOS"
                    }

                  </h3>

                </div>


                <button
                  onClick={() =>
                    refresh()
                  }

                  disabled={loading}
                >

                  Actualiser

                </button>

              </div>


              {
                loading &&
                !creation

                  ? (

                    <div className="empty-state">

                      <p>
                        Chargement…
                      </p>

                    </div>

                  )

                  : (

                    <CreationViewer
                      data={creation}

                      type={
                        memory
                          .memory_type
                      }
                    />
                  )
              }

            </>
          )}

        </main>

      </div>

    </section>
  );
}


/* =========================================================
   VIEWER
========================================================= */

function CreationViewer({
  data,
  type,
}) {

  if (
    !data ||
    !Array.isArray(
      data.creation
    ) ||
    data.creation.length === 0
  ) {

    return (

      <div className="empty-state">

        <strong>
          Aucune création disponible.
        </strong>

        <p>
          Lancez MNEMOS pour générer
          le contenu de ce souvenir.
        </p>

      </div>
    );
  }


  /* =====================================================
     LIVRE
  ===================================================== */

  if (type === "livre") {

    return (

      <Book3DViewer

        pages={
          data.creation
        }

        title={
          data.memory
            ?.generated_title ||

          data.memory
            ?.title ||

          "Livre souvenir"
        }

      />
    );
  }


  /* =====================================================
     BANDE DESSINÉE
  ===================================================== */

  if (type === "bd") {

    return (

      <div>

        {/* -----------------------------------------------
            Références personnages
        ----------------------------------------------- */}

        {
          data.characters?.length >
          0 && (

            <div className="reference-strip">

              {
                data.characters.map(
                  (character) => (

                    <figure
                      key={
                        character.id
                      }
                    >

                      <img
                        src={
                          imageUrl(
                            character
                              .image_url
                          )
                        }

                        alt={
                          character.name
                        }
                      />

                      <figcaption>
                        {character.name}
                      </figcaption>

                    </figure>
                  )
                )
              }

            </div>
          )
        }


        {/* -----------------------------------------------
            CASES
        ----------------------------------------------- */}

        <div className="comic-result">

          {
            data.creation.map(
              (panel) => (

                <article
                  key={
                    panel.id ||
                    panel.panel_number
                  }
                >

                  {/* -------------------------------------
                      IMAGE
                  ------------------------------------- */}

                  <div
                    className="
                      comic-placeholder
                      comic-generated-art
                    "
                  >

                    <span>

                      CASE {
                        panel.panel_number
                      }

                    </span>


                    {
                      panel.image_url

                        ? (

                          <img
                            className="
                              comic-generated-image
                            "

                            src={
                              imageUrl(
                                panel.image_url
                              )
                            }

                            alt={
                              `Case ${panel.panel_number} de la bande dessinée`
                            }

                            loading="lazy"
                          />
                        )

                        : (

                          <div className="comic-generation-fallback">

                            <strong>
                              Illustration
                              non disponible
                            </strong>


                            <small>

                              {
                                panel.image_prompt ||

                                "L'image de cette case n'a pas encore été générée."
                              }

                            </small>

                          </div>
                        )
                    }

                  </div>


                  {/* -------------------------------------
                      Narration
                  ------------------------------------- */}

                  {
                    panel.narration && (

                      <p className="narration">

                        {
                          panel.narration
                        }

                      </p>
                    )
                  }


                  {/* -------------------------------------
                      Dialogue
                  ------------------------------------- */}

                  {
                    panel.dialogue && (

                      <blockquote>

                        “{
                          panel.dialogue
                        }”

                      </blockquote>
                    )
                  }

                </article>
              )
            )
          }

        </div>

      </div>
    );
  }


  /* =====================================================
     VIDÉO
  ===================================================== */

  return (

    <div className="video-result">

      {
        data.photos?.length >
        0 && (

          <div className="reference-strip">

            {
              data.photos.map(
                (photo) => (

                  <figure
                    key={
                      photo.id
                    }
                  >

                    <img
                      src={
                        imageUrl(
                          photo.image_url
                        )
                      }

                      alt="
                        Référence vidéo
                      "
                    />

                  </figure>
                )
              )
            }

          </div>
        )
      }


      <div className="video-timeline">

        {
          data.creation.map(
            (scene) => (

              <article
                key={
                  scene.id ||
                  scene.scene_number
                }
              >

                <span>

                  {
                    scene.scene_number
                  }

                </span>


                <div>

                  <strong>

                    Scène {
                      scene.scene_number
                    }

                    {" · "}

                    {
                      scene
                        .duration_seconds ||
                      5
                    }

                    s

                  </strong>


                  <p>

                    {
                      scene.narration ||
                      "Sans narration"
                    }

                  </p>


                  <small>

                    {
                      scene.image_prompt
                    }

                  </small>

                </div>

              </article>
            )
          )
        }

      </div>


      <p className="studio-limit-note">

        Le backend actuel génère
        le storyboard et la narration.

        L'assemblage en MP4 reste
        une étape média supplémentaire.

      </p>

    </div>
  );
}
