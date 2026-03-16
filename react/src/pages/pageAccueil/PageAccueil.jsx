import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import Header from "../../components/Header";
import { JwtContext } from "../../contexts/JwtContext";

// Page d'accueil : formulaire de connexion utilisateur
const PageAccueil = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { jwt, setJwt } = useContext(JwtContext);
  const navigate = useNavigate();

  const handleChangeEmail = (event) => {
    setEmail(event.target.value);
  };

  const handleChangePassword = (event) => {
    setPassword(event.target.value);
  };

  // Fonction de gestion du login : vérifie les champs, envoie la requête à l'API, gère la redirection et les erreurs
  const handleLogin = async (event) => {
    event.preventDefault();
    setError(null);
    // Vérification basique du mot de passe
    if (password === "") {
      setError("Merci de saisir votre mot de passe");
      return;
    } else if (password.length < 6) {
      setError("Pas assez de caractères a votre MDP !");
      return;
    }
    try {
      const request = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const response = await request.json();
      // Si le token est reçu, on connecte et on redirige
      if (response.token) {
        setJwt(response.token);
        navigate("/tasks");
      } else {
        setError("Connexion impossible : identifiants invalides ou erreur serveur.");
      }
    } catch (error) {
      setError("Erreur réseau ou serveur");
    }
  };
  // Affichage conditionnel selon l'état de connexion
  return (
    <>
      <h1>Page Accueil</h1>
      <Header />
      {jwt ? (
        <div style={{textAlign: "center", marginBottom: "2rem"}}>
          <p>Vous êtes déjà connecté !</p>
          <button className="form-button" onClick={() => { setJwt(null); navigate("/"); }}>Déconnexion</button>
        </div>
      ) : (
        <>
          {/* Formulaire de connexion utilisateur */}
          <form className="form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Merci de saisir votre email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={handleChangeEmail}
                autoComplete="email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">
                Merci de saisir votre mot de passe
              </label>
              <input
                type="password"
                name="password"
                id="password"
                onChange={handleChangePassword}
                value={password}
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit">Se connecter</button>
          </form>
          {/* Affichage des erreurs éventuelles */}
          {error !== null ? <div className="error">{error}</div> : null}
        </>
      )}
    </>
  );
};

export default PageAccueil;
