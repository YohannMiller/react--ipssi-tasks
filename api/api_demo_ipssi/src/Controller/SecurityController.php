<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Controller pour l'authentification (inscription et login)
 *
 * Endpoints :
 * - POST /api/register : Inscription d'un nouvel utilisateur
 * - POST /api/login    : Connexion (geree automatiquement par LexikJWTBundle)
 */
#[Route('/api', name: 'api_')]
class SecurityController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher
    ) {
    }

    /**
     * POST /api/register
     * Inscription d'un nouvel utilisateur
     *
     * Body JSON attendu :
     * {
     *   "email": "user@example.com",
     *   "password": "motdepasse",
     *   "firstname": "Prenom",    // optionnel
     *   "lastname": "Nom"         // optionnel
     * }
     *
     * Note : Par defaut, les nouveaux utilisateurs ont le role ROLE_USER
     * Pour creer un admin, il faut le faire via les fixtures ou en BDD
     */
    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validation des champs obligatoires
        if (empty($data['email'])) {
            return $this->json([
                'success' => false,
                'message' => 'L\'email est obligatoire',
            ], Response::HTTP_BAD_REQUEST);
        }

        if (empty($data['password'])) {
            return $this->json([
                'success' => false,
                'message' => 'Le mot de passe est obligatoire',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Validation du format email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->json([
                'success' => false,
                'message' => 'Format d\'email invalide',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Validation de la longueur du mot de passe
        if (strlen($data['password']) < 6) {
            return $this->json([
                'success' => false,
                'message' => 'Le mot de passe doit contenir au moins 6 caracteres',
            ], Response::HTTP_BAD_REQUEST);
        }

        // Verification que l'email n'est pas deja utilise
        $existingUser = $this->userRepository->findByEmail($data['email']);
        if ($existingUser) {
            return $this->json([
                'success' => false,
                'message' => 'Cet email est deja utilise',
            ], Response::HTTP_CONFLICT);
        }

        // Creation du nouvel utilisateur
        $user = new User();
        $user->setEmail($data['email']);
        $user->setCreatedAt(new \DateTime());

        // Hashage du mot de passe (TRES IMPORTANT pour la securite !)
        // Ne JAMAIS stocker un mot de passe en clair en base de donnees
        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        // Champs optionnels
        if (isset($data['firstname'])) {
            $user->setFirstname($data['firstname']);
        }

        if (isset($data['lastname'])) {
            $user->setLastname($data['lastname']);
        }

        // Sauvegarde en base de donnees
        $this->userRepository->save($user);

        $userData = method_exists($user, 'toArray') ? $user->toArray() : ['id' => $user->getId(), 'email' => $user->getEmail()];

        return $this->json([
            'success' => true,
            'message' => 'Utilisateur cree avec succes',
            'data' => $userData,
        ], Response::HTTP_CREATED);
    }

    /**
     * POST /api/login
     *
     * Cette route est geree automatiquement par LexikJWTAuthenticationBundle
     * grace a la configuration dans security.yaml (firewall "login")
     *
     * Body JSON attendu :
     * {
     *   "email": "user@example.com",
     *   "password": "motdepasse"
     * }
     *
     * Reponse en cas de succes :
     * {
     *   "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
     * }
     *
     * Ce token doit etre envoye dans le header Authorization pour les requetes protegees :
     * Authorization: Bearer <token>
     */
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        // Cette methode ne sera jamais executee car le firewall "login"
        // intercepte la requete et la traite via json_login
        // Elle est ici uniquement pour la documentation et pour eviter une erreur 404

        return $this->json([
            'message' => 'Cette route est geree par le firewall json_login',
        ]);
    }

    /**
     * GET /api/me
     * Retourne les informations de l'utilisateur connecte
     *
     * Necessite un token JWT valide dans le header :
     * Authorization: Bearer <token>
     */
    #[Route('/me', name: 'me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        // getUser() retourne l'utilisateur connecte grace au token JWT
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'success' => false,
                'message' => 'Non authentifie',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $userData = $user->toArray();

        return $this->json([
            'success' => true,
            'data' => $userData,
        ]);
    }
}
