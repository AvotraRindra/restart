import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Download,
  Feather,
  Image as ImageIcon,
  LayoutGrid,
  MessageSquareText,
  Palette,
  PenLine,
  Plus,
  RefreshCcw,
  Save,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";
import friends from "../assets/friends.jpg";
import mountains from "../assets/mountains.jpg";
import city from "../assets/city.jpg";
import road from "../assets/road.jpg";
import workspace from "../assets/workspace.jpg";

const demoMemories = [
  { id: "creative-1", title: "Coucher de soleil avec mes amis", emotion: "Joie", date: "12 août 2026", image: friends, text: "Une soirée simple où le temps semblait s'arrêter." },
  { id: "creative-2", title: "Le chemin vers les montagnes", emotion: "Nostalgie", date: "3 juillet 2026", image: mountains, text: "Le calme, l'air frais et cette sensation d'être exactement au bon endroit." },
  { id: "creative-3", title: "Une ville pleine de lumière", emotion: "Fierté", date: "1 septembre 2026", image: city, text: "Une journée remplie de petites victoires que je veux garder longtemps." },
];

const creationTypes = [
  {
    id: "comic",
    eyebrow: "RACONTER EN IMAGES",
    title: "Bande dessinée",
    description: "Transformez un souvenir en scènes, personnages, dialogues et cases illustrées.",
    icon: WandSparkles,
    accent: "#ff3f55",
    action: "Créer ma BD",
  },
  {
    id: "book",
    eyebrow: "RACONTER EN CHAPITRES",
    title: "Livre souvenir",
    description: "Assemblez plusieurs moments dans un livre personnel avec couverture et chapitres.",
    icon: BookOpen,
    accent: "#ff7a48",
    action: "Créer mon livre",
  },
  {
    id: "poem",
    eyebrow: "RACONTER EN MOTS",
    title: "Poésie",
    description: "Donnez une forme littéraire aux émotions de votre souvenir, en quelques vers ou en slam.",
    icon: Feather,
    accent: "#e74468",
    action: "Écrire ma poésie",
  },
];

const menus = {
  comic: [
    ["memory", ImageIcon, "Souvenir"],
    ["style", Palette, "Style"],
    ["characters", Users, "Personnages"],
    ["layout", LayoutGrid, "Mise en page"],
    ["dialogues", MessageSquareText, "Dialogues"],
    ["cover", BookOpen, "Couverture"],
    ["export", Download, "Exporter"],
  ],
  book: [
    ["memory", ImageIcon, "Souvenirs"],
    ["structure", LayoutGrid, "Organisation"],
    ["style", Palette, "Style"],
    ["cover", BookOpen, "Couverture"],
    ["chapters", PenLine, "Chapitres"],
    ["photos", ImageIcon, "Photos"],
    ["text", MessageSquareText, "Texte"],
    ["export", Download, "Exporter"],
  ],
  poem: [
    ["memory", ImageIcon, "Souvenir"],
    ["style", Feather, "Style"],
    ["tone", Sparkles, "Ton"],
    ["length", PenLine, "Longueur"],
    ["layout", LayoutGrid, "Mise en page"],
    ["export", Download, "Exporter"],
  ],
};

const styleSets = {
  comic: [
    { id: "manga", name: "Manga", note: "Contrastes forts, expressions marquées et rythme dynamique." },
    { id: "comic", name: "Comic", note: "Couleurs franches, contours nets et narration énergique." },
    { id: "soft", name: "Illustration douce", note: "Ambiance cinématique, sensible et chaleureuse." },
  ],
  book: [
    { id: "album", name: "Album souvenir", note: "Grandes photos, légendes courtes et mise en page aérienne." },
    { id: "journal", name: "Journal intime", note: "Dates, notes manuscrites et détails très personnels." },
    { id: "novel", name: "Roman", note: "Texte plus narratif, chapitres et rythme littéraire." },
  ],
  poem: [
    { id: "free", name: "Poème libre", note: "Des vers naturels sans contrainte de forme." },
    { id: "slam", name: "Slam", note: "Un texte rythmé, direct et très émotionnel." },
    { id: "classic", name: "Classique", note: "Une poésie plus structurée, élégante et intemporelle." },
  ],
};

export default function CreativeStudioPage({ memories = [], user, setPage }) {
  const [mode, setMode] = useState("home");
  const [section, setSection] = useState("memory");
  const [selectedMemory, setSelectedMemory] = useState("creative-1");
  const [selectedStyle, setSelectedStyle] = useState({ comic: "soft", book: "album", poem: "free" });
  const [saved, setSaved] = useState(false);
  const [bookTitle, setBookTitle] = useState("Fragments de vie");
  const [poemTitle, setPoemTitle] = useState("Ce que le temps garde");

  const memoryOptions = useMemo(() => {
    if (!Array.isArray(memories) || memories.length === 0) return demoMemories;
    const normalized = memories.slice(0, 6).map((m, index) => ({
      id: String(m.id ?? `memory-${index}`),
      title: m.title || `Souvenir ${index + 1}`,
      emotion: m.emotion || "Souvenir",
      date: m.date || "Date inconnue",
      image: m.image || m.image_url || demoMemories[index % demoMemories.length].image,
      text: m.text_content || m.text || "Un moment qui mérite d'être raconté autrement.",
    }));
    return normalized.length ? normalized : demoMemories;
  }, [memories]);

  const memory = memoryOptions.find((item) => item.id === selectedMemory) || memoryOptions[0];

  const openStudio = (type) => {
    setMode(type);
    setSection("memory");
    setSaved(false);
  };

  const backToHome = () => {
    setMode("home");
    setSection("memory");
    setSaved(false);
  };

  const saveCreation = () => {
    const item = {
      id: `creation-${Date.now()}`,
      type: mode,
      memoryId: memory.id,
      style: selectedStyle[mode],
      title: mode === "book" ? bookTitle : mode === "poem" ? poemTitle : `BD — ${memory.title}`,
      createdAt: new Date().toISOString(),
    };
    const previous = JSON.parse(localStorage.getItem("memories-creations") || "[]");
    localStorage.setItem("memories-creations", JSON.stringify([item, ...previous]));
    setSaved(true);
    setTimeout(() => setSaved(false), 2600);
  };

  if (mode === "home") {
    return (
      <section className="creative-home page-shell">
        <div className="creative-hero">
          <div className="creative-hero-copy">
            <span className="creative-kicker"><Sparkles size={14}/> ATELIER CRÉATIF</span>
            <h1>Donnez une <em>nouvelle vie</em> à vos souvenirs.</h1>
            <p>Un souvenir n'a pas besoin de rester une simple photo ou quelques lignes. Faites-en une histoire illustrée, un livre ou une poésie.</p>
            <div className="creative-hero-actions">
              <button className="primary-btn" onClick={() => openStudio("comic")}>Commencer à créer <ChevronRight size={17}/></button>
              <button className="creative-ghost" onClick={() => setPage?.("memories")}>Voir mes souvenirs</button>
            </div>
          </div>
          <CreativeHeroArtwork />
        </div>

        <div className="creative-section-heading">
          <div><span>CHOISISSEZ UNE FORME</span><h2>Comment voulez-vous raconter ce moment ?</h2></div>
          <p>Vous pourrez modifier chaque détail avant d'enregistrer votre création.</p>
        </div>

        <div className="creative-type-grid">
          {creationTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <article className={`creative-type-card creative-type-card--${type.id}`} key={type.id} style={{ "--creative-delay": `${index * 90}ms`, "--creative-accent": type.accent }}>
                <div className="creative-card-preview">
                  {type.id === "comic" && <MiniComic />}
                  {type.id === "book" && <MiniBook />}
                  {type.id === "poem" && <MiniPoem />}
                </div>
                <div className="creative-card-body">
                  <span className="creative-card-icon"><Icon size={20}/></span>
                  <small>{type.eyebrow}</small>
                  <h3>{type.title}</h3>
                  <p>{type.description}</p>
                  <button onClick={() => openStudio(type.id)}>{type.action}<ChevronRight size={17}/></button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="creative-flow panel">
          <div><span>1</span><strong>Choisissez un souvenir</strong><small>Un moment déjà enregistré dans Memories.</small></div>
          <i/>
          <div><span>2</span><strong>Personnalisez</strong><small>Style, structure, texte, couverture et détails.</small></div>
          <i/>
          <div><span>3</span><strong>Gardez votre création</strong><small>Enregistrez ou exportez votre nouvelle histoire.</small></div>
        </div>
      </section>
    );
  }

  const activeType = creationTypes.find((item) => item.id === mode);
  const ActiveIcon = activeType.icon;

  return (
    <section className={`creative-editor creative-editor--${mode} page-shell`}>
      <div className="creative-editor-top">
        <button className="creative-back" onClick={backToHome}><ArrowLeft size={17}/> Atelier</button>
        <div>
          <span>{activeType.eyebrow}</span>
          <strong>{activeType.title}</strong>
        </div>
        <div className="creative-top-actions">
          <button className="creative-ghost" onClick={() => setSection("export")}><Download size={16}/> Exporter</button>
          <button className="primary-btn" onClick={saveCreation}><Save size={16}/> Enregistrer</button>
        </div>
      </div>

      <div className="creative-workspace">
        <aside className="creative-tools panel">
          <div className="creative-tools-title"><ActiveIcon size={18}/><span>Mon {activeType.title.toLowerCase()}</span></div>
          <nav>
            {menus[mode].map(([id, Icon, label], index) => (
              <button key={id} className={section === id ? "active" : ""} onClick={() => setSection(id)}>
                <span>{String(index + 1).padStart(2, "0")}</span><Icon size={17}/><b>{label}</b><ChevronRight size={15}/>
              </button>
            ))}
          </nav>
          <div className="creative-tools-memory">
            <img src={memory.image} alt=""/>
            <div><small>Souvenir source</small><strong>{memory.title}</strong></div>
          </div>
        </aside>

        <section className="creative-control panel">
          <StudioControls
            type={mode}
            section={section}
            memories={memoryOptions}
            selectedMemory={selectedMemory}
            setSelectedMemory={setSelectedMemory}
            styles={styleSets[mode]}
            selectedStyle={selectedStyle[mode]}
            setSelectedStyle={(style) => setSelectedStyle((current) => ({ ...current, [mode]: style }))}
            memory={memory}
            bookTitle={bookTitle}
            setBookTitle={setBookTitle}
            poemTitle={poemTitle}
            setPoemTitle={setPoemTitle}
            saveCreation={saveCreation}
          />
        </section>

        <section className="creative-preview-zone">
          <div className="creative-preview-head">
            <div><span>APERÇU EN DIRECT</span><strong>{memory.title}</strong></div>
            <button title="Régénérer l'aperçu"><RefreshCcw size={16}/></button>
          </div>
          <div className="creative-preview-canvas panel">
            {mode === "comic" && <ComicPreview memory={memory} style={selectedStyle.comic}/>} 
            {mode === "book" && <BookPreview memory={memory} style={selectedStyle.book} title={bookTitle}/>} 
            {mode === "poem" && <PoemPreview memory={memory} style={selectedStyle.poem} title={poemTitle}/>} 
          </div>
          <div className="creative-preview-note"><Sparkles size={15}/><span>L'aperçu est une simulation frontend. La génération finale sera reliée au backend plus tard.</span></div>
        </section>
      </div>

      {saved && <div className="creative-toast"><Check size={18}/> Création enregistrée dans votre atelier</div>}
    </section>
  );
}

function StudioControls({ type, section, memories, selectedMemory, setSelectedMemory, styles, selectedStyle, setSelectedStyle, memory, bookTitle, setBookTitle, poemTitle, setPoemTitle, saveCreation }) {
  const heading = getSectionHeading(type, section);
  return <div className="creative-control-content" key={`${type}-${section}`}>
    <span className="creative-control-kicker">{heading.kicker}</span>
    <h2>{heading.title}</h2>
    <p>{heading.description}</p>

    {section === "memory" && <div className="creative-memory-picker">
      {memories.map(item => <button key={item.id} className={selectedMemory===item.id?"selected":""} onClick={()=>setSelectedMemory(item.id)}>
        <img src={item.image} alt=""/><div><strong>{item.title}</strong><small>{item.emotion} · {item.date}</small></div>{selectedMemory===item.id&&<Check size={17}/>} 
      </button>)}
    </div>}

    {section === "style" && <div className="creative-style-options">
      {styles.map(style => <button key={style.id} className={selectedStyle===style.id?"selected":""} onClick={()=>setSelectedStyle(style.id)}>
        <span className={`style-swatch style-swatch--${style.id}`}><i/><i/><i/></span><div><strong>{style.name}</strong><small>{style.note}</small></div>{selectedStyle===style.id&&<Check size={17}/>} 
      </button>)}
    </div>}

    {type === "comic" && section === "characters" && <div className="creator-form-stack">
      <label><span>Personnage principal</span><input defaultValue="Moi"/></label>
      <label><span>Deuxième personnage</span><input defaultValue="Mon ami"/></label>
      <button className="creator-add"><Plus size={16}/> Ajouter un personnage</button>
    </div>}

    {type === "comic" && section === "layout" && <div className="layout-choices">
      {["4 cases", "6 cases", "Cinématique"].map((label,i)=><button className={i===0?"selected":""} key={label}><span className={`layout-icon layout-icon-${i+1}`}>{Array.from({length:i===1?6:4}).map((_,x)=><i key={x}/>)}</span><strong>{label}</strong></button>)}
    </div>}

    {type === "comic" && section === "dialogues" && <div className="dialogue-editor">
      <label><span>Case 1 · Narration</span><textarea defaultValue="Ce soir-là, on ne savait pas encore que ce moment deviendrait un souvenir précieux."/></label>
      <label><span>Case 2 · Dialogue</span><input defaultValue="Tu te souviendras de cette soirée ?"/></label>
      <label><span>Case 3 · Réponse</span><input defaultValue="Toujours."/></label>
    </div>}

    {section === "cover" && <div className="creator-form-stack">
      <label><span>Titre de la couverture</span><input value={type==="book"?bookTitle:`${memory.title}`} onChange={type==="book"?e=>setBookTitle(e.target.value):undefined}/></label>
      <label><span>Sous-titre</span><input defaultValue={type==="comic"?"Une histoire inspirée d'un vrai souvenir":"Les moments que je ne veux jamais oublier"}/></label>
      <div className="cover-color-row"><span>Accent</span>{["#ff3349","#ff7a48","#151d2b"].map(c=><button key={c} style={{background:c}} aria-label={c}/>)}</div>
    </div>}

    {type === "book" && section === "structure" && <div className="chapter-list">
      {["Avant ce jour", "Le moment", "Ce que j'en garde"].map((x,i)=><div key={x}><span>{i+1}</span><div><strong>{x}</strong><small>{i===1?memory.title:"Chapitre suggéré"}</small></div><b>•••</b></div>)}
      <button className="creator-add"><Plus size={16}/> Ajouter un chapitre</button>
    </div>}

    {type === "book" && section === "chapters" && <div className="creator-form-stack">
      <label><span>Titre du livre</span><input value={bookTitle} onChange={e=>setBookTitle(e.target.value)}/></label>
      <label><span>Introduction</span><textarea defaultValue="Il existe des moments minuscules qui prennent une place immense dans notre mémoire..."/></label>
    </div>}

    {type === "book" && section === "photos" && <div className="photo-strip">{[memory.image, friends, mountains, workspace].map((src,i)=><button className={i<3?"selected":""} key={i}><img src={src} alt=""/>{i<3&&<Check size={15}/>}</button>)}</div>}

    {type === "book" && section === "text" && <div className="creator-form-stack"><label><span>Texte du chapitre</span><textarea defaultValue={memory.text}/></label><label><span>Légende de la photo</span><input defaultValue="Un moment que je veux garder longtemps."/></label></div>}

    {type === "poem" && section === "tone" && <div className="pill-choices">{["Émouvant", "Lumineux", "Nostalgique"].map((x,i)=><button className={i===0?"selected":""} key={x}>{x}</button>)}</div>}

    {type === "poem" && section === "length" && <div className="length-control"><div><span>Court</span><span>Long</span></div><input type="range" min="1" max="3" defaultValue="2"/><small>Environ 12 à 16 vers</small></div>}

    {type === "poem" && section === "layout" && <div className="layout-choices poem-layouts">{["Minimal", "Éditorial", "Carte souvenir"].map((x,i)=><button className={i===0?"selected":""} key={x}><span className={`poem-layout-swatch p${i+1}`}>Aa</span><strong>{x}</strong></button>)}</div>}

    {type === "poem" && section === "memory" && null}

    {type === "poem" && section === "export" && null}

    {type === "poem" && section === "style" && <label className="poem-title-field"><span>Titre du poème</span><input value={poemTitle} onChange={e=>setPoemTitle(e.target.value)}/></label>}

    {section === "export" && <div className="export-panel">
      <div className="export-icon"><Download size={27}/></div><h3>Votre création est prête à être conservée.</h3><p>Pour cette maquette frontend, l'enregistrement est local. Les exports PDF/image seront reliés au backend lors de l'intégration.</p>
      <div><button className="primary-btn" onClick={saveCreation}><Save size={16}/> Enregistrer</button><button disabled><Download size={16}/> Export PDF bientôt</button></div>
    </div>}
  </div>;
}

function getSectionHeading(type, section) {
  const generic = {
    memory: ["01 · SOURCE", type === "book" ? "Choisissez vos souvenirs" : "Choisissez votre souvenir", "La création restera liée au moment d'origine."],
    style: ["STYLE VISUEL", "Choisissez une direction", "Trois styles seulement pour garder l'expérience simple et rapide."],
    cover: ["IDENTITÉ", "Créez une couverture", "Choisissez le titre et les détails qui donneront le ton dès la première page."],
    export: ["DERNIÈRE ÉTAPE", "Gardez votre création", "Enregistrez votre travail avant de quitter l'atelier."],
  };
  const specific = {
    comic: {
      characters:["03 · CASTING","Définissez vos personnages","Nommez les personnes qui apparaîtront dans votre histoire."],
      layout:["04 · CASES","Composez votre page","Choisissez un rythme visuel pour raconter votre souvenir."],
      dialogues:["05 · TEXTE","Écrivez les dialogues","Ajustez les bulles et la narration avant la génération finale."],
    },
    book: {
      structure:["02 · STRUCTURE","Organisez votre histoire","Découpez vos souvenirs en une progression claire."],
      chapters:["05 · CHAPITRES","Donnez un rythme au livre","Écrivez ou ajustez chaque partie de votre histoire."],
      photos:["06 · IMAGES","Choisissez les photos","Gardez seulement les images qui renforcent réellement votre récit."],
      text:["07 · RÉDACTION","Travaillez le texte","Affinez le récit et les légendes avant la mise en page finale."],
    },
    poem: {
      tone:["03 · ÉMOTION","Choisissez le ton","Donnez une couleur émotionnelle au texte."],
      length:["04 · RYTHME","Choisissez la longueur","Un poème court frappe vite ; un texte long laisse respirer le souvenir."],
      layout:["05 · PRÉSENTATION","Habillez les mots","Choisissez comment la poésie sera présentée visuellement."],
    },
  };
  const value = specific[type]?.[section] || generic[section] || ["ATELIER","Personnalisez votre création","Ajustez les détails de votre création."];
  return { kicker:value[0], title:value[1], description:value[2] };
}

function CreativeHeroArtwork(){return <div className="creative-artwork" aria-hidden="true"><div className="art-book"><i/><i/><span>MEMORIES</span></div><div className="art-polaroid a"><img src={friends}/><b>été</b></div><div className="art-polaroid b"><img src={mountains}/><b>ailleurs</b></div><div className="art-paper"><span>“</span><p>Ce que nous vivons devient une histoire.</p></div><i className="art-spark s1">✦</i><i className="art-spark s2">✦</i></div>}
function MiniComic(){return <div className="mini-comic">{[friends,mountains,city,road].map((src,i)=><div key={i} style={{backgroundImage:`url(${src})`}}>{i===0&&<span>On y est !</span>}</div>)}</div>}
function MiniBook(){return <div className="mini-book"><div><small>FRAGMENTS</small><strong>de vie</strong><img src={mountains}/></div><div><p>Il existe des moments que l'on voudrait garder entre deux pages...</p><img src={friends}/><i>12.08.26</i></div></div>}
function MiniPoem(){return <div className="mini-poem"><small>CE QUE LE TEMPS GARDE</small><strong>Entre deux lumières,<br/>le soir a gardé<br/>nos rires.</strong><span>✦</span></div>}

function ComicPreview({memory,style}){return <div className={`comic-page comic-style-${style}`}><header><small>UNE HISTOIRE VRAIE</small><h3>{memory.title}</h3></header><div className="comic-panels"><div className="comic-panel p1" style={{backgroundImage:`url(${memory.image})`}}><span>Ce soir-là...</span></div><div className="comic-panel p2" style={{backgroundImage:`url(${friends})`}}><b>Tu t'en souviendras ?</b></div><div className="comic-panel p3" style={{backgroundImage:`url(${road})`}}/><div className="comic-panel p4" style={{backgroundImage:`url(${mountains})`}}><b>Toujours.</b></div></div><footer>{memory.date} · {memory.emotion}</footer></div>}
function BookPreview({memory,style,title}){return <div className={`book-spread book-style-${style}`}><div className="book-page book-cover"><small>UN LIVRE DE SOUVENIRS</small><h3>{title}</h3><img src={memory.image}/><span>par Memories</span></div><div className="book-page book-story"><small>CHAPITRE 01</small><h4>{memory.title}</h4><p>{memory.text} Chaque détail semblait ordinaire, mais c'est souvent ainsi que commencent les souvenirs qui restent.</p><img src={friends}/><i>{memory.date}</i></div></div>}
function PoemPreview({memory,style,title}){return <div className={`poem-page poem-style-${style}`}><small>{memory.emotion.toUpperCase()}</small><h3>{title}</h3><i>✦</i><p>Entre deux lumières,<br/>le temps s'est assis près de nous.<br/><br/>Il a gardé nos rires,<br/>le silence après les mots,<br/>et ce morceau de ciel<br/>que personne d'autre n'a vu.<br/><br/>Je n'ai rien emporté,<br/>sauf ce moment<br/>qui refuse de partir.</p><footer>{memory.title} · {memory.date}</footer></div>}
