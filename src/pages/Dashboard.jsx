import friends from "../assets/friends.jpg";
import mountains from "../assets/mountains.jpg";
import workspace from "../assets/workspace.jpg";
import dog from "../assets/dog.jpg";
import city from "../assets/city.jpg";
import road from "../assets/road.jpg";

const demo = [
  [friends,"Coucher de soleil inoubliable avec des amis ❤️","Andry R.","2 h"],
  [mountains,"Un endroit paisible 🌿","Miora T.","1 j"],
  [workspace,"Mon espace préféré ✨","Hery S.","2 j"],
  [dog,"Mon compagnon pour toujours 🐶","Sabrina K.","3 j"],
  [city,"Perdu dans de belles rues ✨","Neha K.","5 j"],
  [road,"Un moment pour respirer 🌅","Arjun N.","3 sem"],
];

export default function Dashboard({ user, memories, setPage }) {
  const cards = memories?.length
    ? memories.slice(0,6).map((m,i)=>[m.image_url || demo[i%demo.length][0], m.title || "Souvenir", user.name, "récemment"])
    : demo;
  return <div className="dashboard-page">
    <section className="welcome-banner">
      <div><small>BIENVENUE,</small><h1>Ravi de vous revoir, <span>{user.name}</span> </h1><p>Revivez vos meilleurs moments et continuez à en créer de nouveaux.</p></div>
      <button onClick={()=>setPage("new-memory")}>+ Ajouter un souvenir</button>
    </section>

    <section className="quick-menu">
      <button onClick={()=>setPage("new-memory")}><span className="qm red">＋</span><div><strong>Créer un souvenir</strong><small>Texte ou vocal</small></div></button>
      <button onClick={()=>setPage("memories")}><span className="qm blue">▧</span><div><strong>Mes souvenirs</strong><small>Retrouvez vos moments</small></div></button>
      <button onClick={()=>setPage("shared")}><span className="qm green">◎</span><div><strong>Partagés</strong><small>Souvenirs publics</small></div></button>
      <button onClick={()=>setPage("messages")}><span className="qm purple">◌</span><div><strong>Messages</strong><small>Discutez avec vos proches</small></div></button>
    </section>

    <div className="dashboard-grid">
      <section className="panel recent-section">
        <div className="section-title"><div><h2>Souvenirs récents</h2><p>Vos derniers moments</p></div><button onClick={()=>setPage("memories")}>Voir tout →</button></div>
        <div className="memory-feed">{cards.map((c,i)=><article className="memory-post" key={i}>
          <img src={c[0]} alt="Souvenir"/>
          <div className="memory-post-body"><div className="post-author"><span>{c[2][0]}</span><div><strong>{c[2]}</strong><small>il y a {c[3]}</small></div><button>•••</button></div><p>{c[1]}</p><div className="post-reactions"><span>♥ {18+i*3}</span><span>▢ {i+2}</span></div></div>
        </article>)}</div>
      </section>

      <aside className="dashboard-right">
        <div className="panel storage-card"><h3>Stockage utilisé</h3><strong>12,4 GB <small>sur 50 GB</small></strong><div className="storage-bar"><span/></div><b>25%</b></div>
        <div className="panel suggestions-card"><h3>Créer quelque chose</h3><p>Donnez une nouvelle forme à vos souvenirs.</p>
          {[["▤","Transformer en BD","Créez une histoire illustrée."],["▱","Créer un livre","Rassemblez vos meilleurs moments."],["✎","Écrire un poème","Une poésie inspirée de votre histoire."],["▶","Créer une vidéo","Montez vos souvenirs en vidéo."],["◉","Enregistrer un souvenir","Ajoutez une voix ou un texte."]].map(x=><button key={x[1]} onClick={x[1].startsWith("Enregistrer")?()=>setPage("new-memory"):undefined}><span>{x[0]}</span><div><strong>{x[1]}</strong><small>{x[2]}</small></div><b>›</b></button>)}
        </div>
      </aside>
    </div>
  </div>;
}
