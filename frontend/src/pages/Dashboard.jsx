import friends from "../assets/friends.jpg";
import mountains from "../assets/mountains.jpg";
import workspace from "../assets/workspace.jpg";
import dog from "../assets/dog.jpg";
import city from "../assets/city.jpg";
import road from "../assets/road.jpg";

const demo = [friends, mountains, workspace, dog, city, road];
const TYPE_LABELS = { livre: "Livre", video: "Vidéo", bd: "BD" };

function memoryText(memory) {
  return memory.text_content || memory.text || "Souvenir vocal";
}

export default function Dashboard({ user, memories = [], setPage, onOpenMemory }) {
  const recent = memories.slice(0, 6);
  const used = Math.min(memories.length, 100);
  const percent = Math.round((used / 100) * 100);

  return (
    <div className="dashboard-page">
      <section className="welcome-banner">
        <div>
          <small>BIENVENUE,</small>
          <h1>Ravi de vous revoir, <span>{user?.name || "Utilisateur"}</span> 👋</h1>
          <p>Revivez vos meilleurs moments et continuez à en créer de nouveaux.</p>
        </div>
        <button onClick={() => setPage("new-memory")}>+ Ajouter un souvenir</button>
      </section>

      <section className="quick-menu">
        <button onClick={() => setPage("new-memory")}><span className="qm red">＋</span><div><strong>Créer un souvenir</strong><small>Texte ou vocal</small></div></button>
        <button onClick={() => setPage("memories")}><span className="qm blue">▧</span><div><strong>Mes souvenirs</strong><small>Retrouvez vos moments</small></div></button>
        <button onClick={() => setPage("studio")}><span className="qm coral">✦</span><div><strong>Atelier créatif</strong><small>BD, livre ou vidéo</small></div></button>
        <button onClick={() => setPage("shared")}><span className="qm green">◎</span><div><strong>Partagés</strong><small>Souvenirs publics</small></div></button>
        <button onClick={() => setPage("messages")}><span className="qm purple">◌</span><div><strong>Messages</strong><small>Discutez avec vos proches</small></div></button>
      </section>

      <div className="dashboard-grid">
        <section className="panel recent-section">
          <div className="section-title">
            <div><h2>Souvenirs récents</h2><p>Vos derniers moments</p></div>
            <button onClick={() => setPage("memories")}>Voir tout →</button>
          </div>

          {recent.length === 0 ? (
            <div className="empty-state compact-empty">
              <strong>Votre histoire commence ici.</strong>
              <p>Créez votre premier souvenir pour le retrouver dans ce tableau de bord.</p>
              <button className="primary-btn" onClick={() => setPage("new-memory")}>Créer mon premier souvenir</button>
            </div>
          ) : (
            <div className="memory-feed">
              {recent.map((m, i) => (
                <article className="memory-post memory-post-clickable" key={m.id} role="button" tabIndex={0} onClick={() => onOpenMemory?.(m.id)} onKeyDown={(e) => { if (e.key === "Enter") onOpenMemory?.(m.id); }}>
                  <div className={`memory-dashboard-cover type-${m.memory_type || "livre"}`}>
                    <img src={demo[i % demo.length]} alt="" />
                    <span>{TYPE_LABELS[m.memory_type] || "Souvenir"}</span>
                  </div>
                  <div className="memory-post-body">
                    <div className="post-author">
                      <span>{(user?.name || "U")[0]}</span>
                      <div><strong>{user?.name || "Vous"}</strong><small>{m.memory_date || "Date non précisée"}</small></div>
                      <button aria-label="Options">•••</button>
                    </div>
                    <p><strong>{m.title}</strong><br />{memoryText(m).slice(0, 88)}{memoryText(m).length > 88 ? "…" : ""}</p>
                    <div className="post-reactions"><span>{m.access_level === "public" ? "◎ Public" : "🔒 Privé"}</span><span>{m.generation_status === "completed" ? "✦ Créé" : "○ À créer"}</span></div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="dashboard-right">
          <div className="panel storage-card">
            <h3>Souvenirs enregistrés</h3>
            <strong>{used} <small>sur 100</small></strong>
            <div className="storage-bar"><span style={{ width: `${percent}%` }}/></div>
            <b>{percent}%</b>
          </div>

          <div className="panel suggestions-card">
            <h3>Créer quelque chose</h3>
            <p>MNEMOS donne une nouvelle forme à vos souvenirs.</p>
            {[
              ["▤", "Transformer en BD", "Cases, dialogues et narration."],
              ["▱", "Créer un livre", "Pages organisées par MNEMOS."],
              ["▶", "Créer une vidéo", "Storyboard à partir de vos photos."],
            ].map((x) => <button key={x[1]} onClick={() => setPage("studio")}><span>{x[0]}</span><div><strong>{x[1]}</strong><small>{x[2]}</small></div><b>›</b></button>)}
          </div>
        </aside>
      </div>
    </div>
  );
}
