import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx";
import Auth from "./pages/Auth.jsx";
import AuthUtilityPage from "./pages/AuthUtilityPage.jsx";
import OAuthCallbackPage from "./pages/OAuthCallbackPage.jsx";
import PublicMemoryPage from "./pages/PublicMemoryPage.jsx";

import AppLayout from "./components/AppLayout.jsx";
import LoadingPage from "./components/LoadingPage.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import MemoriesPage from "./pages/MemoriesPage.jsx";
import SharedPage from "./pages/SharedPage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import NewMemoryWizard from "./pages/NewMemoryWizard.jsx";
import CreativeStudioPage from "./pages/CreativeStudioPage.jsx";
import MemoryViewerPage from "./pages/MemoryViewerPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

import {
  getMyMemories,
} from "./services/memoryApi.js";

import {
  getCurrentUser,
} from "./services/AuthServices.js";

import {
  clearSession,
  getToken,
} from "./services/api.js";

import {
  closeSocket,
} from "./services/socketApi.js";

/*
|--------------------------------------------------------------------------
| Normalisation utilisateur
|--------------------------------------------------------------------------
*/

function normalizeUser(
  raw = {}
) {
  return {
    ...raw,

    name:
      raw.name ||
      raw.nom ||
      "Utilisateur",

    email:
      raw.email ||
      "",
  };
}

/*
|--------------------------------------------------------------------------
| Route protégée
|--------------------------------------------------------------------------
*/

function Protected({
  children,
}) {
  return getToken()
    ? children
    : (
      <Navigate
        to="/login"
        replace
      />
    );
}

/*
|--------------------------------------------------------------------------
| Application après connexion
|--------------------------------------------------------------------------
*/

function AuthenticatedApp() {
  const navigate =
    useNavigate();

  const [
    showLoader,
    setShowLoader,
  ] = useState(
    () =>
      sessionStorage.getItem(
        "memories-loader-seen"
      ) !== "1"
  );

  const [
    page,
    setPage,
  ] = useState(
    "dashboard"
  );

  const [
    theme,
    setTheme,
  ] = useState(
    () =>
      localStorage.getItem(
        "memories-theme"
      ) || "light"
  );

  const [
    user,
    setUser,
  ] = useState(
    () => {
      try {
        return normalizeUser(
          JSON.parse(
            localStorage.getItem(
              "user"
            ) || "{}"
          )
        );
      } catch {
        return normalizeUser();
      }
    }
  );

  const [
    memories,
    setMemories,
  ] = useState([]);

  const [
    refreshKey,
    setRefreshKey,
  ] = useState(0);

  const [
    toast,
    setToast,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    studioMemoryId,
    setStudioMemoryId,
  ] = useState("");

  const [
    viewerMemoryId,
    setViewerMemoryId,
  ] = useState("");

  const [
    viewerPublic,
    setViewerPublic,
  ] = useState(false);

  const [
    messageConversationId,
    setMessageConversationId,
  ] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Thème
  |--------------------------------------------------------------------------
  */

  useEffect(
    () => {
      localStorage.setItem(
        "memories-theme",
        theme
      );
    },
    [theme]
  );

  /*
  |--------------------------------------------------------------------------
  | Utilisateur connecté
  |--------------------------------------------------------------------------
  */

  useEffect(
    () => {
      let active = true;

      getCurrentUser()
        .then(
          (response) => {
            if (!active) {
              return;
            }

            const next =
              normalizeUser(
                response?.data ||
                {}
              );

            setUser(next);

            localStorage.setItem(
              "user",
              JSON.stringify(
                response?.data ||
                {}
              )
            );
          }
        )
        .catch(
          (error) => {
            if (
              error.status ===
                401 ||
              !getToken()
            ) {
              navigate(
                "/login",
                {
                  replace: true,
                }
              );
            }
          }
        );

      return () => {
        active = false;
      };
    },
    [navigate]
  );

  /*
  |--------------------------------------------------------------------------
  | Souvenirs
  |--------------------------------------------------------------------------
  */

  useEffect(
    () => {
      let active = true;

      getMyMemories()
        .then(
          (response) => {
            if (active) {
              setMemories(
                Array.isArray(
                  response?.data
                )
                  ? response.data
                  : []
              );
            }
          }
        )
        .catch(
          (error) => {
            if (
              error.status ===
              401
            ) {
              navigate(
                "/login",
                {
                  replace: true,
                }
              );
            }
          }
        );

      return () => {
        active = false;
      };
    },
    [
      refreshKey,
      navigate,
    ]
  );

  /*
  |--------------------------------------------------------------------------
  | Loader
  |--------------------------------------------------------------------------
  */

  const doneLoading =
    useCallback(
      () => {
        sessionStorage.setItem(
          "memories-loader-seen",
          "1"
        );

        setShowLoader(false);
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Nouveau souvenir
  |--------------------------------------------------------------------------
  */

  const handleSaved =
    (memory) => {
      if (memory) {
        setMemories(
          (items) => [
            memory,

            ...items.filter(
              (item) =>
                item.id !==
                memory.id
            ),
          ]
        );
      }

      setRefreshKey(
        (key) =>
          key + 1
      );

      setPage(
        "dashboard"
      );

      setToast(
        memory?._generationWarning
          ? `Souvenir sauvegardé. ${memory._generationWarning}`
          : "Souvenir sauvegardé avec succès ♥"
      );

      window.setTimeout(
        () =>
          setToast(""),
        4500
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Visualisation souvenir
  |--------------------------------------------------------------------------
  */

  const openMemory =
    (
      id,
      isPublic = false
    ) => {
      setViewerMemoryId(
        id
      );

      setViewerPublic(
        Boolean(
          isPublic
        )
      );

      setPage(
        "memory-view"
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Conversation
  |--------------------------------------------------------------------------
  */

  const openConversation =
    (id) => {
      setMessageConversationId(
        id || null
      );

      setPage(
        "messages"
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Déconnexion
  |--------------------------------------------------------------------------
  */

  const handleLogout =
    () => {
      closeSocket();

      clearSession();

      sessionStorage.removeItem(
        "memories-loader-seen"
      );

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Pages dashboard
  |--------------------------------------------------------------------------
  */

  const content =
    useMemo(
      () => {
        if (
          page ===
          "dashboard"
        ) {
          return (
            <Dashboard
              user={user}
              memories={memories}
              setPage={setPage}
              onOpenMemory={
                (id) =>
                  openMemory(
                    id,
                    false
                  )
              }
            />
          );
        }

        if (
          page ===
          "memories"
        ) {
          return (
            <MemoriesPage
              refreshKey={
                refreshKey
              }
              onCreate={
                () =>
                  setPage(
                    "new-memory"
                  )
              }
              search={
                search
              }
              onOpenViewer={
                (id) =>
                  openMemory(
                    id,
                    false
                  )
              }
              onOpenStudio={
                (id) => {
                  setStudioMemoryId(
                    id
                  );

                  setPage(
                    "studio"
                  );
                }
              }
            />
          );
        }

        if (
          page ===
          "shared"
        ) {
          return (
            <SharedPage
              onOpenMemory={
                (id) =>
                  openMemory(
                    id,
                    true
                  )
              }
            />
          );
        }

        if (
          page ===
          "messages"
        ) {
          return (
            <MessagesPage
              user={user}
              initialConversationId={
                messageConversationId
              }
            />
          );
        }

        if (
          page ===
          "notifications"
        ) {
          return (
            <NotificationsPage
              onOpenMemory={
                (id) =>
                  openMemory(
                    id,
                    false
                  )
              }
              onOpenConversation={
                openConversation
              }
            />
          );
        }

        if (
          page ===
            "profile" ||
          page ===
            "settings"
        ) {
          return (
            <ProfilePage
              user={user}
              theme={theme}
              setTheme={
                setTheme
              }
              onUserChanged={
                (next) =>
                  setUser(
                    normalizeUser(
                      next
                    )
                  )
              }
            />
          );
        }

        if (
          page ===
          "studio"
        ) {
          return (
            <CreativeStudioPage
              memories={
                memories
              }
              user={user}
              setPage={
                setPage
              }
              initialMemoryId={
                studioMemoryId
              }
              onChanged={
                () =>
                  setRefreshKey(
                    (key) =>
                      key + 1
                  )
              }
            />
          );
        }

        if (
          page ===
          "new-memory"
        ) {
          return (
            <NewMemoryWizard
              onCancel={
                () =>
                  setPage(
                    "dashboard"
                  )
              }
              onSaved={
                handleSaved
              }
            />
          );
        }

        if (
          page ===
          "memory-view"
        ) {
          return (
            <MemoryViewerPage
              memoryId={
                viewerMemoryId
              }
              publicMode={
                viewerPublic
              }
              onBack={
                () =>
                  setPage(
                    viewerPublic
                      ? "shared"
                      : "dashboard"
                  )
              }
            />
          );
        }

        return (
          <Dashboard
            user={user}
            memories={
              memories
            }
            setPage={
              setPage
            }
            onOpenMemory={
              (id) =>
                openMemory(
                  id,
                  false
                )
            }
          />
        );
      },
      [
        page,
        user,
        memories,
        refreshKey,
        theme,
        search,
        studioMemoryId,
        viewerMemoryId,
        viewerPublic,
        messageConversationId,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (showLoader) {
    return (
      <LoadingPage
        theme={theme}
        onDone={
          doneLoading
        }
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Layout
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <AppLayout
        page={page}
        setPage={
          setPage
        }
        theme={
          theme
        }
        setTheme={
          setTheme
        }
        user={
          user
        }
        onLogout={
          handleLogout
        }
        search={
          search
        }
        setSearch={
          setSearch
        }
        onProfile={
          () =>
            setPage(
              "profile"
            )
        }
      >
        <div
          key={page}
          className="page-transition"
        >
          {content}
        </div>
      </AppLayout>

      {toast && (
        <div className="toast-success">
          {toast}
        </div>
      )}
    </>
  );
}

/*
|--------------------------------------------------------------------------
| Routes publiques
|--------------------------------------------------------------------------
*/

export default function App() {
  const authenticated =
    Boolean(
      getToken()
    );

  return (
    <Routes>

      <Route
        path="/"
        element={
          <LandingPage />
        }
      />

      <Route
        path="/login"
        element={
          authenticated
            ? (
              <Navigate
                to="/dashboard"
                replace
              />
            )
            : (
              <Auth
                initialMode="login"
              />
            )
        }
      />

      <Route
        path="/register"
        element={
          authenticated
            ? (
              <Navigate
                to="/dashboard"
                replace
              />
            )
            : (
              <Auth
                initialMode="register"
              />
            )
        }
      />

      <Route
        path="/forgot-password"
        element={
          authenticated
            ? (
              <Navigate
                to="/dashboard"
                replace
              />
            )
            : (
              <AuthUtilityPage
                mode="forgot"
              />
            )
        }
      />

      <Route
        path="/reset-password"
        element={
          <AuthUtilityPage
            mode="reset"
          />
        }
      />

      <Route
        path="/oauth/callback"
        element={
          <OAuthCallbackPage />
        }
      />

      <Route
        path="/memory/:id"
        element={
          <PublicMemoryPage />
        }
      />

      <Route
        path="/dashboard/*"
        element={
          <Protected>
            <AuthenticatedApp />
          </Protected>
        }
      />

      <Route
        path="/MesSouvenirs"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={
              authenticated
                ? "/dashboard"
                : "/"
            }
            replace
          />
        }
      />

    </Routes>
  );
}
