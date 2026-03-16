import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import Header from "../../components/Header";
import { JwtContext } from "../../contexts/JwtContext";

// Page de création d'une nouvelle tâche (protégée)
const PageNouvelleTask = () => {
  const { jwt } = useContext(JwtContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fonction de gestion de la création de tâche : envoie à l'API, redirige après succès
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ title, description, status }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Erreur lors de la création");
        return;
      }
      navigate("/tasks");
    } catch (err) {
      setError("Erreur réseau");
    }
  };

  // Affichage du formulaire de création de tâche et gestion des erreurs
  return (
    <div className="page-container">
      <Header />
      <h2>Créer une nouvelle tâche</h2>
      {/* Formulaire de création de tâche */}
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Titre</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea className="task-textarea" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </div>
        <div className="form-group">
          <label htmlFor="status">Statut</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="pending">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminée</option>
          </select>
        </div>
        <button type="submit">Créer</button>
      </form>
      {/* Affichage des erreurs éventuelles */}
      {error ? <div className="error">{error}</div> : null}
    </div>
  );
};

export default PageNouvelleTask;
