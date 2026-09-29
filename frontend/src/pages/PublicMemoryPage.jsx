import { useNavigate, useParams } from "react-router-dom";
import MemoryViewerPage from "./MemoryViewerPage.jsx";
export default function PublicMemoryPage(){
  const { id } = useParams();
  const navigate = useNavigate();
  return <div className="public-memory-shell"><MemoryViewerPage memoryId={id} publicMode onBack={() => navigate(-1)}/></div>;
}
