import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, API_URL } from "../services/api.js";
import "./MesSouvenirs.css";

function MesSouvenirs() {
  const navigate = useNavigate();

  /* =====================================================
     THEME
  ===================================================== */

  const [darkMode, setDarkMode] = useState(false);

  /* =====================================================
     SOUVENIRS
  ===================================================== */

  const [memories, setMemories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =====================================================
     FILTRES
  ===================================================== */

  const [selectedType, setSelectedType] = useState("all");

  const [search, setSearch] = useState("");

  const [sort, setSort] = useState("recent");

  /* =====================================================
     MODALS
  ===================================================== */

  const [shareMemory, setShareMemory] = useState(null);

  const [visibilityMemory, setVisibilityMemory] =
    useState(null);

  const [deleteMemoryModal, setDeleteMemoryModal] =
    useState(null);

  /* =====================================================
     CHARGEMENT INITIAL
  ===================================================== */

  useEffect(() => {
    loadMemories();
  }, []);

  /* =====================================================
     GET /api/memories/mine
  ===================================================== */

  async function loadMemories() {
    setLoading(true);
    setError("");

    try {
      const result = await apiFetch(
        "/api/memories/mine"
      );

      console.log(
        "Réponse /api/memories/mine :",
        result
      );

      /*
        Le backend devrait retourner quelque chose
        comme :

        {
          success: true,
          data: [...]
        }

        On vérifie quand même plusieurs cas pour
        éviter de casser l'interface.
      */

      if (Array.isArray(result.data)) {
        setMemories(result.data);
      } else if (
        Array.isArray(result.data?.memories)
      ) {
        setMemories(result.data.memories);
      } else {
        setMemories([]);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Impossible de récupérer vos souvenirs."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     HELPERS
  ===================================================== */

  function getMemoryId(memory) {
    return (
      memory.id ||
      memory.memory_id ||
      memory.memoryId
    );
  }

  function getMemoryType(memory) {
    return (
      memory.memory_type ||
      memory.memoryType ||
      memory.type
    );
  }

  function getMemoryTitle(memory) {
    return (
      memory.title ||
      "Souvenir sans titre"
    );
  }

  function getMemoryText(memory) {
    return (
      memory.text_content ||
      memory.text ||
      memory.description ||
      ""
    );
  }

  function getMemoryAccess(memory) {
    return (
      memory.access ||
      memory.visibility ||
      "private"
    );
  }

  function getMemoryDate(memory) {
    return (
      memory.date ||
      memory.memory_date ||
      memory.created_at ||
      memory.createdAt ||
      null
    );
  }

  function getMemoryStatus(memory) {
    return (
      memory.generation_status ||
      memory.status ||
      null
    );
  }

  function getMemoryImage(memory) {
    /*
      La documentation du backend ne précise pas encore
      le nom exact d'un champ "cover".

      On accepte donc plusieurs noms possibles.
    */

    const image =
      memory.cover_url ||
      memory.image_url ||
      memory.thumbnail_url ||
      memory.photo_url ||
      null;

    if (!image) {
      return null;
    }

    /*
      Si backend renvoie :
      /uploads/photo.jpg

      on ajoute API_URL.

      Si backend renvoie déjà :
      https://...
      on ne touche pas.
    */

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${API_URL}${image}`;
  }

  /* =====================================================
     NOMS DES TYPES
  ===================================================== */

  function getTypeName(type) {
    if (type === "livre") {
      return "Livre";
    }

    if (type === "video") {
      return "Vidéo";
    }

    if (type === "bd") {
      return "BD";
    }

    return "Souvenir";
  }

  function getTypeIcon(type) {
    if (type === "livre") {
      return "▤";
    }

    if (type === "video") {
      return "▶";
    }

    if (type === "bd") {
      return "▧";
    }

    return "✦";
  }

  /* =====================================================
     COMPTER LES TYPES
  ===================================================== */

  function countType(type) {
    if (type === "all") {
      return memories.length;
    }

    return memories.filter(
      (memory) =>
        getMemoryType(memory) === type
    ).length;
  }

  /* =====================================================
     FILTRAGE
  ===================================================== */

  const filteredMemories = useMemo(() => {
    let result = [...memories];

    /*
      Filtre type
    */

    if (selectedType !== "all") {
      result = result.filter(
        (memory) =>
          getMemoryType(memory) ===
          selectedType
      );
    }

    /*
      Recherche
    */

    if (search.trim()) {
      const value =
        search.toLowerCase();

      result = result.filter(
        (memory) => {
          const title =
            getMemoryTitle(
              memory
            ).toLowerCase();

          const text =
            getMemoryText(
              memory
            ).toLowerCase();

          return (
            title.includes(value) ||
            text.includes(value)
          );
        }
      );
    }

    /*
      Tri
    */

    if (sort === "recent") {
      result.sort((a, b) => {
        const dateA =
          new Date(
            getMemoryDate(a) || 0
          );

        const dateB =
          new Date(
            getMemoryDate(b) || 0
          );

        return dateB - dateA;
      });
    }

    if (sort === "old") {
      result.sort((a, b) => {
        const dateA =
          new Date(
            getMemoryDate(a) || 0
          );

        const dateB =
          new Date(
            getMemoryDate(b) || 0
          );

        return dateA - dateB;
      });
    }

    if (sort === "az") {
      result.sort((a, b) =>
        getMemoryTitle(a).localeCompare(
          getMemoryTitle(b)
        )
      );
    }

    return result;
  }, [
    memories,
    selectedType,
    search,
    sort,
  ]);

  /* =====================================================
     OUVRIR / VOIR
  ===================================================== */

  async function viewMemory(memory) {
    const id = getMemoryId(memory);

    if (!id) {
      alert(
        "Impossible d'identifier ce souvenir."
      );

      return;
    }

    /*
      Pour le moment :
      on envoie vers une future page Viewer.

      Dans App.jsx il faudra ensuite créer :
      /souvenir/:id
    */

    navigate(`/souvenir/${id}`);
  }

  /* =====================================================
     MODIFIER
  ===================================================== */

  function editMemory(memory) {
    const id = getMemoryId(memory);

    if (!id) {
      return;
    }

    /*
      Plus tard Creation.jsx pourra détecter cet ID
      et charger le souvenir à modifier.
    */

    navigate(`/creation/${id}`);
  }

  /* =====================================================
     CHANGER VISIBILITÉ

     PATCH /api/memories/:id/access
  ===================================================== */

  async function changeVisibility(
    memory,
    access
  ) {
    const id = getMemoryId(memory);

    if (!id) {
      return;
    }

    try {
      await apiFetch(
        `/api/memories/${id}/access`,
        {
          method: "PATCH",

          body: JSON.stringify({
            access,
          }),
        }
      );

      /*
        Mise à jour immédiate de l'interface
      */

      setMemories((oldMemories) =>
        oldMemories.map((item) => {
          if (
            getMemoryId(item) !== id
          ) {
            return item;
          }

          return {
            ...item,
            access,
            visibility: access,
          };
        })
      );

      setVisibilityMemory(null);
    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Impossible de modifier la visibilité."
      );
    }
  }

  /* =====================================================
     SUPPRIMER

     DELETE /api/memories/:id
  ===================================================== */

  async function confirmDelete() {
    if (!deleteMemoryModal) {
      return;
    }

    const id = getMemoryId(
      deleteMemoryModal
    );

    if (!id) {
      return;
    }

    try {
      await apiFetch(
        `/api/memories/${id}`,
        {
          method: "DELETE",
        }
      );

      setMemories((oldMemories) =>
        oldMemories.filter(
          (memory) =>
            getMemoryId(memory) !== id
        )
      );

      setDeleteMemoryModal(null);
    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Impossible de supprimer ce souvenir."
      );
    }
  }

  /* =====================================================
     PARTAGER
  ===================================================== */

  function getShareLink(memory) {
    const id = getMemoryId(memory);

    return `${window.location.origin}/souvenir/${id}`;
  }

  async function copyShareLink(memory) {
    const link =
      getShareLink(memory);

    try {
      await navigator.clipboard.writeText(
        link
      );

      alert("Lien copié !");
    } catch {
      alert(link);
    }
  }

  /* =====================================================
     DATE
  ===================================================== */

  function formatDate(value) {
    if (!value) {
      return "Date inconnue";
    }

    const dateValue =
      new Date(value);

    if (
      Number.isNaN(
        dateValue.getTime()
      )
    ) {
      return value;
    }

    return dateValue.toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className={
        darkMode
          ? "memories-page dark"
          : "memories-page light"
      }
    >
      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="memories-navbar">
        <div className="memories-navbar-content">
          <Link
            to="/"
            className="memories-logo"
          >
            <div className="memories-logo-icon">
              R
            </div>

            <div className="memories-logo-text">
              RE:<span>START</span>
            </div>
          </Link>

          <nav className="memories-nav-links">
            <Link to="/">
              <span>⌂</span>
              Accueil
            </Link>

            <Link to="/creation">
              <span>✦</span>
              Créer
            </Link>

            <Link to="/explorer">
              <span>▶</span>
              Explorer
            </Link>

            <Link
              to="/mes-souvenirs"
              className="active"
            >
              <span>▧</span>
              Mes souvenirs
            </Link>

            <Link to="/profil">
              <span>♙</span>
              Profil
            </Link>
          </nav>

          <div className="memories-nav-actions">
            <button
              className={`theme-switch ${
                darkMode
                  ? "active"
                  : ""
              }`}
              type="button"
              onClick={() =>
                setDarkMode(
                  !darkMode
                )
              }
            >
              <span className="theme-sun">
                ☀
              </span>

              <span className="theme-moon">
                ☾
              </span>

              <span className="theme-circle">
                {darkMode
                  ? "☾"
                  : "☀"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="memories-container">
        {/* ===============================
            HEADER
        =============================== */}

        <section className="memories-header">
          <div>
            <span className="small-red-title">
              VOTRE BIBLIOTHÈQUE
            </span>

            <h1>
              Mes{" "}
              <span>
                souvenirs
              </span>
            </h1>

            <p>
              Retrouvez les livres,
              vidéos et bandes dessinées
              que vous avez créés avec
              RE:START.
            </p>
          </div>

          <Link
            to="/creation"
            className="create-memory-button"
          >
            <span>+</span>
            Créer un souvenir
          </Link>
        </section>

        {/* ===============================
            ERROR
        =============================== */}

        {error && (
          <div className="memories-api-error">
            <div>
              <strong>
                Impossible de charger
                vos souvenirs
              </strong>

              <p>{error}</p>
            </div>

            <button
              onClick={
                loadMemories
              }
            >
              Réessayer
            </button>
          </div>
        )}

        {/* ===============================
            LAYOUT
        =============================== */}

        <section className="memories-layout">
          {/* =============================
              LEFT SIDEBAR
          ============================= */}

          <aside className="memory-sidebar">
            <div className="sidebar-heading">
              <span>
                TYPES
              </span>

              <h2>
                Mes créations
              </h2>
            </div>

            <div className="memory-types-column">
              <TypeCard
                active={
                  selectedType ===
                  "all"
                }
                icon="✦"
                title="Tous"
                description="Tous mes souvenirs"
                count={countType(
                  "all"
                )}
                onClick={() =>
                  setSelectedType(
                    "all"
                  )
                }
              />

              <TypeCard
                active={
                  selectedType ===
                  "livre"
                }
                icon="▤"
                title="Livres"
                description="Mes histoires"
                count={countType(
                  "livre"
                )}
                onClick={() =>
                  setSelectedType(
                    "livre"
                  )
                }
              />

              <TypeCard
                active={
                  selectedType ===
                  "video"
                }
                icon="▶"
                title="Vidéos"
                description="Mes créations vidéo"
                count={countType(
                  "video"
                )}
                onClick={() =>
                  setSelectedType(
                    "video"
                  )
                }
              />

              <TypeCard
                active={
                  selectedType ===
                  "bd"
                }
                icon="▧"
                title="BD"
                description="Mes bandes dessinées"
                count={countType(
                  "bd"
                )}
                onClick={() =>
                  setSelectedType(
                    "bd"
                  )
                }
              />
            </div>
          </aside>

          {/* =============================
              RIGHT CONTENT
          ============================= */}

          <div className="memories-content">
            {/* TOOLBAR */}

            <div className="memories-toolbar">
              <div className="search-box">
                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Rechercher un souvenir..."
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                />
              </div>

              <select
                className="sort-select"
                value={sort}
                onChange={(
                  event
                ) =>
                  setSort(
                    event.target
                      .value
                  )
                }
              >
                <option value="recent">
                  Plus récent
                </option>

                <option value="old">
                  Plus ancien
                </option>

                <option value="az">
                  A - Z
                </option>
              </select>
            </div>

            {/* TITRE */}

            <div className="results-heading">
              <div>
                <h2>
                  {selectedType ===
                    "all" &&
                    "Tous mes souvenirs"}

                  {selectedType ===
                    "livre" &&
                    "Mes livres"}

                  {selectedType ===
                    "video" &&
                    "Mes vidéos"}

                  {selectedType ===
                    "bd" &&
                    "Mes bandes dessinées"}
                </h2>

                {!loading && (
                  <p>
                    {
                      filteredMemories.length
                    }{" "}
                    souvenir
                    {filteredMemories.length !==
                    1
                      ? "s"
                      : ""}
                  </p>
                )}
              </div>

              <button
                className="refresh-memories-button"
                onClick={
                  loadMemories
                }
                disabled={loading}
              >
                ↻ Actualiser
              </button>
            </div>

            {/* ===========================
                LOADING
            =========================== */}

            {loading && (
              <div className="memories-loading">
                <div className="memories-spinner"></div>

                <strong>
                  Chargement de vos
                  souvenirs...
                </strong>

                <p>
                  RE:START récupère vos
                  créations depuis le
                  serveur.
                </p>
              </div>
            )}

            {/* ===========================
                MEMORIES
            =========================== */}

            {!loading &&
              filteredMemories.length >
                0 && (
                <div className="memories-grid">
                  {filteredMemories.map(
                    (memory) => (
                      <MemoryCard
                        key={
                          getMemoryId(
                            memory
                          )
                        }
                        memory={
                          memory
                        }
                        type={getMemoryType(
                          memory
                        )}
                        title={getMemoryTitle(
                          memory
                        )}
                        text={getMemoryText(
                          memory
                        )}
                        access={getMemoryAccess(
                          memory
                        )}
                        image={getMemoryImage(
                          memory
                        )}
                        date={formatDate(
                          getMemoryDate(
                            memory
                          )
                        )}
                        status={getMemoryStatus(
                          memory
                        )}
                        getTypeName={
                          getTypeName
                        }
                        getTypeIcon={
                          getTypeIcon
                        }
                        onView={() =>
                          viewMemory(
                            memory
                          )
                        }
                        onEdit={() =>
                          editMemory(
                            memory
                          )
                        }
                        onShare={() =>
                          setShareMemory(
                            memory
                          )
                        }
                        onVisibility={() =>
                          setVisibilityMemory(
                            memory
                          )
                        }
                        onDelete={() =>
                          setDeleteMemoryModal(
                            memory
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}

            {/* ===========================
                EMPTY
            =========================== */}

            {!loading &&
              filteredMemories.length ===
                0 &&
              !error && (
                <div className="empty-memory">
                  <div className="empty-icon">
                    ◇
                  </div>

                  <h3>
                    Aucun souvenir
                  </h3>

                  <p>
                    {search
                      ? "Aucun souvenir ne correspond à votre recherche."
                      : "Vous n'avez pas encore de souvenir dans cette catégorie."}
                  </p>

                  {search ? (
                    <button
                      onClick={() =>
                        setSearch(
                          ""
                        )
                      }
                    >
                      Effacer la
                      recherche
                    </button>
                  ) : (
                    <Link
                      to="/creation"
                      className="empty-create-button"
                    >
                      + Créer mon
                      premier souvenir
                    </Link>
                  )}
                </div>
              )}
          </div>
        </section>
      </main>

      {/* =================================================
          SHARE MODAL
      ================================================= */}

      {shareMemory && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShareMemory(
              null
            )
          }
        >
          <div
            className="memory-modal"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                setShareMemory(
                  null
                )
              }
            >
              ×
            </button>

            <div className="modal-icon">
              ↗
            </div>

            <span className="small-red-title">
              PARTAGER
            </span>

            <h2>
              Partager ce souvenir
            </h2>

            <p className="modal-description">
              Partagez{" "}
              <strong>
                “
                {getMemoryTitle(
                  shareMemory
                )}
                ”
              </strong>
              .
            </p>

            {getMemoryAccess(
              shareMemory
            ) === "private" && (
              <div className="share-warning">
                <span>
                  🔒
                </span>

                <div>
                  <strong>
                    Souvenir privé
                  </strong>

                  <p>
                    Vous devez rendre
                    ce souvenir public
                    pour qu'il puisse
                    être consulté par
                    d'autres
                    utilisateurs.
                  </p>
                </div>
              </div>
            )}

            <div className="share-link-box">
              <input
                readOnly
                value={getShareLink(
                  shareMemory
                )}
              />

              <button
                onClick={() =>
                  copyShareLink(
                    shareMemory
                  )
                }
              >
                Copier
              </button>
            </div>

            <div className="modal-actions">
              <button
                className="modal-secondary"
                onClick={() =>
                  setShareMemory(
                    null
                  )
                }
              >
                Fermer
              </button>

              {getMemoryAccess(
                shareMemory
              ) === "private" && (
                <button
                  className="modal-primary"
                  onClick={async () => {
                    await changeVisibility(
                      shareMemory,
                      "public"
                    );

                    setShareMemory({
                      ...shareMemory,
                      access:
                        "public",
                    });
                  }}
                >
                  🌍 Rendre public
                </button>
              )}

              {getMemoryAccess(
                shareMemory
              ) === "public" && (
                <button
                  className="modal-primary"
                  onClick={() =>
                    copyShareLink(
                      shareMemory
                    )
                  }
                >
                  ↗ Copier le lien
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          VISIBILITY MODAL
      ================================================= */}

      {visibilityMemory && (
        <div
          className="modal-overlay"
          onClick={() =>
            setVisibilityMemory(
              null
            )
          }
        >
          <div
            className="memory-modal"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                setVisibilityMemory(
                  null
                )
              }
            >
              ×
            </button>

            <div className="modal-icon">
              ◉
            </div>

            <span className="small-red-title">
              VISIBILITÉ
            </span>

            <h2>
              Qui peut voir ce
              souvenir ?
            </h2>

            <p className="modal-description">
              Choisissez la
              visibilité de{" "}
              <strong>
                “
                {getMemoryTitle(
                  visibilityMemory
                )}
                ”
              </strong>
              .
            </p>

            <div className="visibility-options">
              <VisibilityOption
                icon="🌍"
                title="Public"
                description="Visible par les utilisateurs dans Explorer."
                active={
                  getMemoryAccess(
                    visibilityMemory
                  ) === "public"
                }
                onClick={() =>
                  changeVisibility(
                    visibilityMemory,
                    "public"
                  )
                }
              />

              <VisibilityOption
                icon="🔒"
                title="Privé"
                description="Visible uniquement par vous."
                active={
                  getMemoryAccess(
                    visibilityMemory
                  ) === "private"
                }
                onClick={() =>
                  changeVisibility(
                    visibilityMemory,
                    "private"
                  )
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {deleteMemoryModal && (
        <div
          className="modal-overlay"
          onClick={() =>
            setDeleteMemoryModal(
              null
            )
          }
        >
          <div
            className="memory-modal delete-modal"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                setDeleteMemoryModal(
                  null
                )
              }
            >
              ×
            </button>

            <div className="modal-icon delete-icon">
              ×
            </div>

            <span className="small-red-title">
              SUPPRESSION
            </span>

            <h2>
              Supprimer ce
              souvenir ?
            </h2>

            <p className="modal-description">
              Vous êtes sur le point
              de supprimer{" "}
              <strong>
                “
                {getMemoryTitle(
                  deleteMemoryModal
                )}
                ”
              </strong>
              .
            </p>

            <div className="delete-warning">
              Cette action est
              définitive.
            </div>

            <div className="modal-actions">
              <button
                className="modal-secondary"
                onClick={() =>
                  setDeleteMemoryModal(
                    null
                  )
                }
              >
                Annuler
              </button>

              <button
                className="modal-delete-button"
                onClick={
                  confirmDelete
                }
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   TYPE CARD
===================================================== */

function TypeCard({
  icon,
  title,
  description,
  count,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      className={
        active
          ? "memory-type-card active"
          : "memory-type-card"
      }
      onClick={onClick}
    >
      <div className="memory-type-icon">
        {icon}
      </div>

      <div className="memory-type-info">
        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>
      </div>

      <div className="memory-type-count">
        {count}
      </div>
    </button>
  );
}

/* =====================================================
   MEMORY CARD
===================================================== */

function MemoryCard({
  type,
  title,
  text,
  access,
  image,
  date,
  status,
  getTypeName,
  getTypeIcon,
  onView,
  onEdit,
  onShare,
  onVisibility,
  onDelete,
}) {
  function getViewText() {
    if (type === "video") {
      return "Regarder";
    }

    return "Lire";
  }

  return (
    <article className="memory-card">
      {/* COVER */}

      <div className="memory-cover">
        {image ? (
          <img
            src={image}
            alt={title}
          />
        ) : (
          <div className="memory-placeholder">
            <div className="memory-placeholder-icon">
              {getTypeIcon(
                type
              )}
            </div>

            <span>
              RE:START
            </span>
          </div>
        )}

        <div className="memory-cover-overlay"></div>

        <div className="memory-format">
          <span>
            {getTypeIcon(
              type
            )}
          </span>

          {getTypeName(type)}
        </div>

        {type === "video" && (
          <button
            className="video-play-button"
            type="button"
            onClick={onView}
          >
            ▶
          </button>
        )}

        {status && (
          <GenerationBadge
            status={status}
          />
        )}
      </div>

      {/* CONTENT */}

      <div className="memory-card-content">
        <div className="memory-title-row">
          <div>
            <h3>
              {title}
            </h3>

            <p>
              {date}
            </p>
          </div>

          <VisibilityBadge
            access={access}
          />
        </div>

        {text && (
          <p className="memory-card-description">
            {text.length > 120
              ? `${text.substring(
                  0,
                  120
                )}...`
              : text}
          </p>
        )}

        <button
          className="memory-view-button"
          type="button"
          onClick={onView}
        >
          <span>
            {type === "video"
              ? "▶"
              : "▧"}
          </span>

          {getViewText()}
        </button>

        <div className="memory-actions">
          <button
            className="memory-action-button"
            type="button"
            onClick={onEdit}
          >
            <span>
              ✎
            </span>

            Modifier
          </button>

          <button
            className="memory-action-button"
            type="button"
            onClick={onShare}
          >
            <span>
              ↗
            </span>

            Partager
          </button>

          <button
            className="memory-action-button"
            type="button"
            onClick={
              onVisibility
            }
          >
            <span>
              ◉
            </span>

            Visibilité
          </button>

          <button
            className="memory-delete-button"
            type="button"
            onClick={onDelete}
          >
            <span>
              ×
            </span>

            Supprimer
          </button>
        </div>
      </div>
    </article>
  );
}

/* =====================================================
   VISIBILITY BADGE
===================================================== */

function VisibilityBadge({
  access,
}) {
  if (access === "public") {
    return (
      <span className="visibility-badge public">
        🌍 Public
      </span>
    );
  }

  return (
    <span className="visibility-badge private">
      🔒 Privé
    </span>
  );
}

/* =====================================================
   GENERATION BADGE
===================================================== */

function GenerationBadge({
  status,
}) {
  if (
    status === "completed"
  ) {
    return (
      <span className="generation-badge completed">
        ✓ Terminé
      </span>
    );
  }

  if (
    status === "generating"
  ) {
    return (
      <span className="generation-badge generating">
        ◌ Génération
      </span>
    );
  }

  if (
    status === "failed"
  ) {
    return (
      <span className="generation-badge failed">
        ! Échec
      </span>
    );
  }

  if (
    status === "pending"
  ) {
    return (
      <span className="generation-badge pending">
        ◷ En attente
      </span>
    );
  }

  return null;
}

/* =====================================================
   VISIBILITY OPTION
===================================================== */

function VisibilityOption({
  icon,
  title,
  description,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      className={
        active
          ? "visibility-option selected"
          : "visibility-option"
      }
      onClick={onClick}
    >
      <div className="visibility-option-icon">
        {icon}
      </div>

      <div>
        <strong>
          {title}
        </strong>

        <p>
          {description}
        </p>
      </div>

      <div className="visibility-radio">
        {active && (
          <span></span>
        )}
      </div>
    </button>
  );
}

export default MesSouvenirs;