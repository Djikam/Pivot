/**
 * PIVOT — Types Supabase (22 tables)
 * Généré manuellement — peut être remplacé par `supabase gen types typescript`
 */

export type DisciplineType = 'avertissement' | 'carton_jaune' | 'suspension_2min' | 'carton_rouge' | 'carton_bleu'
export type Fiabilite = 1 | 2 | 3 | 4
export type Genre = 'masculin' | 'feminin' | 'mixte'
export type TypeCompetition = 'regional' | 'national' | 'universitaire' | 'coupe' | 'international'
export type StatutMatch = 'programme' | 'en_cours' | 'termine' | 'reporte' | 'annule'
export type RoleUser = 'admin' | 'saisie' | 'viewer'
export type TypeLicence = 'club' | 'universite' | 'les_deux'
export type CategorieNationale = 'senior' | 'u20' | 'u17' | 'beach'
export type StatutSelection = 'preselectione' | 'finaliste' | 'titulaire'
export type TypeBut = 'normal' | 'penalty' | '7m'
export type StatutDocument = 'actif' | 'archive'
export type CategorieDocument = 'regles' | 'droits_joueur' | 'droits_club' | 'arbitrage' | 'officiel' | 'pedagogue'
export type FormatDocument = 'pdf' | 'xlsx' | 'csv' | 'html'

export interface User {
  id: string
  role: RoleUser
  created_at: string
}

export interface Universite {
  id: string
  nom: string
  ville: string
  abrev: string
  created_at: string
}

export interface Club {
  id: string
  nom: string
  acronyme: string
  region: string
  ville: string
  gymnase?: string
  couleur_principale?: string
  universitaire: boolean
  universite_id?: string
  actif: boolean
  logo_cloudinary_id?: string
  created_at: string
  // Joins
  universite?: Universite
}

export interface Joueur {
  id: string
  prenom: string
  nom: string
  poste_principal: string
  poste_secondaire?: string
  bras_fort: 'droitier' | 'gaucher' | 'ambidextre'
  taille_estimee?: number
  statut_univ: boolean
  date_naissance_approx?: string
  verifie: boolean
  score_ia: number
  badge_talent: boolean
  photo_cloudinary_id?: string
  created_at: string
  updated_at: string
  // Joins
  licences?: LicenceSaison[]
  distinctions?: Distinction[]
}

export interface LicenceSaison {
  id: string
  joueur_id: string
  club_id: string
  universite_id?: string
  saison: string // ex: "2025-2026"
  type_licence: TypeLicence
  numero_maillot?: number
  actif: boolean
  // Joins
  joueur?: Joueur
  club?: Club
}

export interface Arbitre {
  id: string
  prenom: string
  nom: string
  niveau: 'regional' | 'national' | 'international'
  region: string
  verifie: boolean
  photo_cloudinary_id?: string
  created_at: string
}

export interface EquipeNationale {
  id: string
  nom: string
  categorie: CategorieNationale
  genre: Genre
  selectionneur?: string
  saison_active: string
  created_at: string
}

export interface SelectionJoueur {
  id: string
  joueur_id: string
  equipe_nationale_id: string
  statut: StatutSelection
  saison: string
  appel_date?: string
  // Joins
  joueur?: Joueur
  equipe_nationale?: EquipeNationale
}

export interface Competition {
  id: string
  nom: string
  slug: string
  type: TypeCompetition
  saison: string
  region?: string
  genre: Genre
  statut: 'a_venir' | 'en_cours' | 'termine'
  niveau: 'club' | 'national' | 'international'
  created_at: string
}

export interface Phase {
  id: string
  competition_id: string
  nom: string
  ordre: number
  type: 'poule' | 'knockout' | 'finale'
  // Joins
  competition?: Competition
}

export interface Match {
  id: string
  phase_id: string
  club_domicile_id: string
  club_exterieur_id: string
  date_match: string
  score_dom?: number
  score_ext?: number
  mi_temps_dom?: number
  mi_temps_ext?: number
  statut: StatutMatch
  journee: number
  created_at: string
  // Joins
  phase?: Phase
  club_domicile?: Club
  club_exterieur?: Club
  buts?: But[]
  discipline?: Discipline[]
}

export interface MatchInternational {
  id: string
  equipe_nationale_id: string
  adversaire: string
  date: string
  score_cam?: number
  score_adv?: number
  competition: string
  type: 'can' | 'qualification' | 'amical'
  statut: StatutMatch
  // Joins
  equipe_nationale?: EquipeNationale
}

export interface But {
  id: string
  match_id: string
  joueur_id: string
  minute?: number
  type: TypeBut
  equipe: 'domicile' | 'exterieur'
  // Joins
  joueur?: Joueur
}

export interface Discipline {
  id: string
  match_id: string
  joueur_id: string
  type: DisciplineType
  minute?: number
  cumul_suspensions?: number // Nb total suspensions 2min dans ce match
  rapport_envoye: boolean    // Pour les cartons bleus
  // Joins
  joueur?: Joueur
}

export interface Classement {
  id: string
  phase_id: string
  club_id: string
  mj: number
  v: number
  n: number
  d: number
  bp: number
  bc: number
  db: number // différence de buts
  pts: number
  updated_at: string
  // Joins
  club?: Club
}

export interface Transfert {
  id: string
  joueur_id: string
  club_origine_id?: string
  club_destination_id?: string
  date_transfert?: string
  fiabilite: Fiabilite
  type: 'transfert' | 'pret' | 'fin_contrat' | 'suspension'
  motif?: string
  source?: string
  created_at: string
  // Joins
  joueur?: Joueur
  club_origine?: Club
  club_destination?: Club
}

export interface SessionVote {
  id: string
  titre: string
  type: string
  tarif_fcfa: number
  date_debut: string
  date_fin: string
  statut: 'brouillon' | 'actif' | 'termine'
  payant: boolean
  created_at: string
}

export interface Distinction {
  id: string
  joueur_id?: string
  club_id?: string
  type: string
  saison: string
  competition_id?: string
  periode?: string
  created_at: string
  // Joins
  joueur?: Joueur
  club?: Club
}

export interface Article {
  id: string
  titre: string
  slug: string
  contenu: string
  categorie: string
  genere_par_ia: boolean
  fournisseur_ia?: 'groq' | 'gemini'
  auteur?: string
  competition_id?: string
  publie_le: string
  created_at: string
}

export interface DocumentEducation {
  id: string
  titre: string
  description?: string
  categorie: CategorieDocument
  fichier_url: string
  format: FormatDocument
  version: string
  publie_le: string
  actif: boolean
  created_at: string
  updated_at: string
}

export interface CrowdsourcingQueue {
  id: string
  joueur_id?: string
  type_demande: 'correction' | 'suppression' | 'ajout' | 'reclamation'
  telephone_contact?: string
  contenu: string
  statut: 'en_attente' | 'traite' | 'rejete'
  traite_le?: string
  created_at: string
}

// ─── Type global Database pour createClient<Database> ─────────────────────────
export interface Database {
  public: {
    Tables: {
      users:                { Row: User; Insert: Partial<User>; Update: Partial<User> }
      universites:         { Row: Universite; Insert: Partial<Universite>; Update: Partial<Universite> }
      clubs:               { Row: Club; Insert: Partial<Club>; Update: Partial<Club> }
      joueurs:             { Row: Joueur; Insert: Partial<Joueur>; Update: Partial<Joueur> }
      licences_saison:     { Row: LicenceSaison; Insert: Partial<LicenceSaison>; Update: Partial<LicenceSaison> }
      arbitres:            { Row: Arbitre; Insert: Partial<Arbitre>; Update: Partial<Arbitre> }
      equipes_nationales:  { Row: EquipeNationale; Insert: Partial<EquipeNationale>; Update: Partial<EquipeNationale> }
      selections_joueurs:  { Row: SelectionJoueur; Insert: Partial<SelectionJoueur>; Update: Partial<SelectionJoueur> }
      competitions:        { Row: Competition; Insert: Partial<Competition>; Update: Partial<Competition> }
      phases:              { Row: Phase; Insert: Partial<Phase>; Update: Partial<Phase> }
      matchs:              { Row: Match; Insert: Partial<Match>; Update: Partial<Match> }
      matchs_internationaux: { Row: MatchInternational; Insert: Partial<MatchInternational>; Update: Partial<MatchInternational> }
      buts:                { Row: But; Insert: Partial<But>; Update: Partial<But> }
      discipline:          { Row: Discipline; Insert: Partial<Discipline>; Update: Partial<Discipline> }
      classements:         { Row: Classement; Insert: Partial<Classement>; Update: Partial<Classement> }
      transferts:          { Row: Transfert; Insert: Partial<Transfert>; Update: Partial<Transfert> }
      sessions_vote:       { Row: SessionVote; Insert: Partial<SessionVote>; Update: Partial<SessionVote> }
      distinctions:        { Row: Distinction; Insert: Partial<Distinction>; Update: Partial<Distinction> }
      articles:            { Row: Article; Insert: Partial<Article>; Update: Partial<Article> }
      documents_education: { Row: DocumentEducation; Insert: Partial<DocumentEducation>; Update: Partial<DocumentEducation> }
      crowdsourcing_queue: { Row: CrowdsourcingQueue; Insert: Partial<CrowdsourcingQueue>; Update: Partial<CrowdsourcingQueue> }
    }
  }
}
