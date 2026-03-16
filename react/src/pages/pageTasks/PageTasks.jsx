
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Header from "../../components/Header";
import { JwtContext } from "../../contexts/JwtContext";

// Page d'affichage des tâches (protégée)
const PageTasks = () => {
  const { jwt, setJwt } = useContext(JwtContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Effet : récupère les tâches à chaque changement de JWT (connexion/déconnexion)
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/tasks", {
          headers: jwt
            ? { Authorization: `Bearer ${jwt}` }
            : { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (data.success) setTasks(data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [jwt]);

  // Déconnexion gérée désormais sur la page d'accueil

  // Affichage de la liste des tâches et des boutons d'action
  return (
    <div className="page-container">
      <Header />
      <div className="tasks-header">
        <h1>Tasks</h1>
        {/* Bouton pour créer une nouvelle tâche */}
        <div className="tasks-btn-group">
          <button className="form-button tasks-btn" onClick={() => navigate("/nouvelle-task")}>Nouvelle tâche</button>
        </div>
      </div>
      {/* Affichage de la liste ou du chargement */}
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <ul className="tasks-list">
          {tasks.map((t) => (
            <li key={t.id} className="task-card">
              <h3>{t.title}</h3>
              {t.description ? <p>{t.description}</p> : null}
              <div className="task-meta">
                <span>Status: {t.status}</span>
                <span>Créée: {t.createdAt}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PageTasks;
