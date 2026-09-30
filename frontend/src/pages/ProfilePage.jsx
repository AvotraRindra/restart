import {
  useEffect,
  useMemo,
  useState,
} from "react";

import ThemeToggle from "../components/ThemeToggle.jsx";

import {
  imageUrl,
} from "../services/memoryApi.js";

import {
  updateProfile,
  updateProfilePhoto,
} from "../services/profileApi.js";

/*
|--------------------------------------------------------------------------
| Formulaire depuis utilisateur
|--------------------------------------------------------------------------
*/

function formFromUser(
  user
) {
  return {
    nom:
      user?.nom ||
      user?.name ||
      "",

    bio:
      user?.bio ||
      "",

    sexe:
      user?.sexe ||
      "autre",

    dateNaissance:
      user
        ?.date_naissance
        ?.slice?.(
          0,
          10
        ) ||
      "",
  };
}

/*
|--------------------------------------------------------------------------
| Profil
|--------------------------------------------------------------------------
*/

export default function ProfilePage({
  user,
  theme,
  setTheme,
  onUserChanged,
}) {
  const [
    form,
    setForm,
  ] = useState(
    () =>
      formFromUser(
        user
      )
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    uploadingPhoto,
    setUploadingPhoto,
  ] = useState(false);

  const [
    photoPreview,
    setPhotoPreview,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Synchronisation formulaire
  |--------------------------------------------------------------------------
  */

  useEffect(
    () =>
      setForm(
        formFromUser(
          user
        )
      ),
    [user]
  );

  /*
  |--------------------------------------------------------------------------
  | Nettoyage preview
  |--------------------------------------------------------------------------
  */

  useEffect(
    () => {
      return () => {
        if (
          photoPreview
            ?.startsWith(
              "blob:"
            )
        ) {
          URL.revokeObjectURL(
            photoPreview
          );
        }
      };
    },
    [photoPreview]
  );

  /*
  |--------------------------------------------------------------------------
  | Avatar
  |--------------------------------------------------------------------------
  */

  const persistedAvatar =
    useMemo(
      () =>
        user?.photo
          ? imageUrl(
              user.photo
            )
          : "",
      [user?.photo]
    );

  const avatar =
    photoPreview ||
    persistedAvatar;

  /*
  |--------------------------------------------------------------------------
  | Sauvegarde utilisateur local
  |--------------------------------------------------------------------------
  */

  function persistUser(
    next
  ) {
    localStorage.setItem(
      "user",
      JSON.stringify(
        next
      )
    );

    onUserChanged?.(
      next
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Sauvegarder profil
  |--------------------------------------------------------------------------
  */

  async function save(
    event
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response =
        await updateProfile(
          form
        );

      persistUser(
        response.data
      );

      setForm(
        formFromUser(
          response.data
        )
      );

      setMessage(
        "Informations du profil enregistrées."
      );

    } catch (saveError) {
      setError(
        saveError.message
      );

    } finally {
      setSaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Photo profil
  |--------------------------------------------------------------------------
  */

  async function handlePhotoChange(
    event
  ) {
    const file =
      event.target
        .files?.[0];

    event.target.value =
      "";

    if (!file) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Type image
    |--------------------------------------------------------------------------
    */

    if (
      !file.type
        .startsWith(
          "image/"
        )
    ) {
      setError(
        "Veuillez sélectionner une image valide."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Limite 8 Mo
    |--------------------------------------------------------------------------
    */

    if (
      file.size >
      8 *
        1024 *
        1024
    ) {
      setError(
        "La photo ne doit pas dépasser 8 Mo."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Preview
    |--------------------------------------------------------------------------
    */

    const preview =
      URL.createObjectURL(
        file
      );

    setPhotoPreview(
      (old) => {
        if (
          old?.startsWith(
            "blob:"
          )
        ) {
          URL.revokeObjectURL(
            old
          );
        }

        return preview;
      }
    );

    setUploadingPhoto(
      true
    );

    setError("");
    setMessage("");

    /*
    |--------------------------------------------------------------------------
    | Upload backend
    |--------------------------------------------------------------------------
    */

    try {
      const response =
        await updateProfilePhoto(
          file
        );

      persistUser(
        response.data
      );

      setPhotoPreview("");

      setMessage(
        "Photo de profil enregistrée."
      );

    } catch (uploadError) {
      setPhotoPreview("");

      setError(
        uploadError.message
      );

    } finally {
      setUploadingPhoto(
        false
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Interface
  |--------------------------------------------------------------------------
  */

  return (
    <section className="page-shell profile-page">

      <div className="page-head">

        <div>

          <span>
            VOTRE ESPACE
          </span>

          <h1>
            Profil
          </h1>

          <p>
            Gérez votre identité,
            votre photo et vos
            préférences.
          </p>

        </div>

      </div>

      {error && (
        <div className="inline-alert">
          {error}
        </div>
      )}

      {message && (
        <div className="success-note">
          {message}
        </div>
      )}

      <form
        className="profile-grid"
        onSubmit={save}
      >

        {/* ================================
            PHOTO PROFIL
        ================================= */}

        <aside className="panel profile-card">

          <div className="profile-avatar-large">

            {avatar ? (
              <img
                src={avatar}
                alt="Photo de profil"
              />
            ) : (
              <span>
                {
                  (
                    form.nom ||
                    "U"
                  )[0]
                    ?.toUpperCase()
                }
              </span>
            )}

          </div>

          <h2>
            {
              form.nom ||
              "Utilisateur"
            }
          </h2>

          <p>
            {user?.email}
          </p>

          <label
            className={
              `profile-photo-button ${
                uploadingPhoto
                  ? "is-loading"
                  : ""
              }`
            }
          >

            {
              uploadingPhoto
                ? "Enregistrement…"
                : "Changer la photo"
            }

            <input
              type="file"
              accept="
                image/jpeg,
                image/png,
                image/webp
              "
              disabled={
                uploadingPhoto
              }
              onChange={
                handlePhotoChange
              }
            />

          </label>

          <small>
            JPG, PNG ou WebP ·
            8 Mo maximum
          </small>

        </aside>

        {/* ================================
            INFORMATIONS
        ================================= */}

        <div className="profile-main">

          <section className="panel profile-form-panel">

            <h2>
              Informations personnelles
            </h2>

            <div className="profile-form-grid">

              {/* NOM */}

              <label>

                <span>
                  Nom
                </span>

                <input
                  value={
                    form.nom
                  }
                  onChange={
                    (event) =>
                      setForm({
                        ...form,

                        nom:
                          event
                            .target
                            .value,
                      })
                  }
                  required
                  minLength={2}
                />

              </label>

              {/* EMAIL */}

              <label>

                <span>
                  E-mail
                </span>

                <input
                  value={
                    user?.email ||
                    ""
                  }
                  disabled
                />

              </label>

              {/* SEXE */}

              <label>

                <span>
                  Sexe
                </span>

                <select
                  value={
                    form.sexe
                  }
                  onChange={
                    (event) =>
                      setForm({
                        ...form,

                        sexe:
                          event
                            .target
                            .value,
                      })
                  }
                >

                  <option value="homme">
                    Homme
                  </option>

                  <option value="femme">
                    Femme
                  </option>

                  <option value="autre">
                    Autre
                  </option>

                </select>

              </label>

              {/* DATE */}

              <label>

                <span>
                  Date de naissance
                </span>

                <input
                  type="date"
                  value={
                    form.dateNaissance ||
                    ""
                  }
                  onChange={
                    (event) =>
                      setForm({
                        ...form,

                        dateNaissance:
                          event
                            .target
                            .value,
                      })
                  }
                />

              </label>

              {/* BIO */}

              <label className="full">

                <span>
                  Bio
                </span>

                <textarea
                  maxLength={500}
                  value={
                    form.bio ||
                    ""
                  }
                  onChange={
                    (event) =>
                      setForm({
                        ...form,

                        bio:
                          event
                            .target
                            .value,
                      })
                  }
                  placeholder="
                    Quelques mots sur vous…
                  "
                />

                <small>
                  {
                    (
                      form.bio ||
                      ""
                    ).length
                  }
                  /500
                </small>

              </label>

            </div>

            <button
              className="primary-btn"
              disabled={
                saving ||
                uploadingPhoto
              }
            >

              {
                saving
                  ? "Enregistrement…"
                  : "Enregistrer les modifications"
              }

            </button>

          </section>

          {/* ================================
              PARAMÈTRES
          ================================= */}

          <section className="panel profile-settings">

            <h2>
              Préférences
            </h2>

            <div>

              <div>

                <strong>
                  Apparence
                </strong>

                <p>
                  Choisissez le thème
                  de votre espace.
                </p>

              </div>

              <ThemeToggle
                theme={theme}
                onToggle={
                  () =>
                    setTheme(
                      theme === "dark"
                        ? "light"
                        : "dark"
                    )
                }
                compact
              />

            </div>

            <div>

              <div>

                <strong>
                  Confidentialité
                </strong>

                <p>
                  Les nouveaux souvenirs
                  restent privés par défaut,
                  sauf choix contraire lors
                  de leur création.
                </p>

              </div>

              <b>
                Privé par défaut
              </b>

            </div>

          </section>

        </div>

      </form>

    </section>
  );
}
