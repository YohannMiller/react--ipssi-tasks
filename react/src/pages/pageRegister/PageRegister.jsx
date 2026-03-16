import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import Header from "../../components/Header";
import { JwtContext } from "../../contexts/JwtContext";

// Page d'inscription : création d'un nouvel utilisateur
const PageRegister = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [error, setError] = useState(null);
  const { setJwt } = useContext(JwtContext);
  const navigate = useNavigate();

  // Fonction de gestion de l'inscription : envoie les infos à l'API, auto-login et redirection
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const resp = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstname, lastname }),
      });
      const data = await resp.json();
      if (!data.success) {
        setError(data.message || "Erreur");
        return;
      }
      // Auto-login après inscription
      const loginReq = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginReq.json();
      setJwt(loginData.token);
      navigate("/tasks");
    } catch (err) {
      setError("Erreur réseau");
    }
  };

  // Affichage du formulaire d'inscription et gestion des erreurs
  return (
    <div className="page-container">
      <Header />
      <h2>Inscription</h2>
      {/* Formulaire d'inscription utilisateur */}
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
        </div>
        <div className="form-group">
          <label htmlFor="firstname">Prénom</label>
          <input value={firstname} onChange={e => setFirstname(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="lastname">Nom</label>
          <input value={lastname} onChange={e => setLastname(e.target.value)} required />
        </div>
        <button type="submit">S'inscrire</button>
      </form>
      {/* Affichage des erreurs éventuelles */}
      {error ? <div className="error">{error}</div> : null}
    </div>
  );
};

export default PageRegister;
