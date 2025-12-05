# ✍️ Writing App – Tableau de Bord d’Analyse de l’Écriture

Application React Native / Expo permettant d’analyser l’écriture manuscrite en temps réel à partir des mouvements du doigt (ou stylet) sur une zone de dessin, avec un retour auditif (mélodie) synchronisé à la vitesse d’écriture.

---

## ✨ Fonctionnalités principales

- **Zone d’écriture interactive**
  - Dessin au doigt / stylet dans une zone centrale.
  - Tracé affiché en temps réel via `react-native-svg`.

- **Analyse cinétique et cinématique**
  - Calcul en temps quasi réel d’un ensemble de métriques :
    - **Cinétique** : force appliquée, temps de pause, nombre de pauses, changements brusques de vitesse, fluidité globale de l’écriture.
    - **Cinématique** : vitesse moyenne, direction globale, longueur du tracé, amplitude verticale, nombre de corrections (changements de direction), longueur du mot.

- **Retour auditif dynamique**
  - Choix d’une mélodie parmi 6 ambiances pré-définies.
  - **Pré-écoute** de la mélodie avant d’écrire.
  - Pendant l’écriture :
    - la mélodie sélectionnée est jouée en boucle,
    - sa vitesse est adaptée en fonction de la vitesse d’écriture.

- **Dashboard complet**
  - Cartes dédiées aux métriques cinétiques et cinématiques.
  - Tableau récapitulatif global (summary) des valeurs de la session.

---

## 🧱 Stack technique

- **React Native** `0.81.x`
- **Expo SDK** `54`
- **TypeScript** `~5.9`
- **expo-router** pour la navigation
- **expo-av** pour l’audio (avec une future migration prévue vers `expo-audio`)
- **react-native-svg** pour le dessin du tracé
- **react-native-safe-area-context** pour la gestion des zones sûres
- **expo** (image, haptics, fonts, etc.) selon la configuration du projet

---

## 📁 Architecture du projet

### Racine simplifiée :

```txt
.
├── app/
│   ├── _layout.tsx        # Layout racine expo-router (Stack + SafeAreaProvider)
│   └── index.tsx          # Écran principal : HomeScreen (header + main layout + summary)
├── src/
│   ├── controllers/
│   │   └── useWritingController.ts  # Hook de contrôle (état global écriture + métriques + mélodie)
│   ├── models/
│   │   ├── audio.ts        # Interface WritingAudioPort
│   │   ├── melodies.ts     # Données des 6 mélodies (audio + images)
│   │   ├── melodyPlayer.ts # Implémentation concrète de l’audio via expo-av
│   │   ├── metrics.ts      # Calcul des métriques à partir des tracés (strokes)
│   │   └── types.ts        # Types des métriques + emptyMetrics
│   ├── views/
│   │   ├── AppHeader.tsx       # Header (titre + boutons Démarrer / Terminé)
│   │   ├── MainLayout.tsx      # Layout principal (zone écriture + mélodies + métriques)
│   │   ├── WritingArea.tsx     # Zone de dessin + logique de capture + audio
│   │   ├── MelodySelector.tsx  # Sélecteur de mélodies (pré-écoute, sélection)
│   │   ├── KineticMetrics.tsx  # Affichage des métriques cinétiques
│   │   ├── KinematicMetrics.tsx# Affichage des métriques cinématiques
│   │   └── SummaryTable.tsx    # Tableau récapitulatif des métriques
│   └── theme.ts            # Thème global (couleurs, etc.)
├── assets/
│   ├── audios/             # Fichiers audio des mélodies
│   └── images/             # Illustrations des mélodies
├── app.json                # Configuration Expo
├── package.json
├── tsconfig.json
└── README.md
  ...
```
## 🚦 Logique fonctionnelle
1. Contrôleur : useWritingController
 * Le hook useWritingController centralise l’état global :
  * metrics: WritingMetrics – dernière version des métriques calculées.
  * isRecording: boolean – session en cours ou non.
  * selectedMelodyId: string – mélodie active pour l’écriture.

 * Actions exposées :
  * startRecording() :
   - remet les métriques à zéro,
   - passe isRecording à true.

  * stopRecording() :
   - passe isRecording à false (sans remettre les métriques à zéro).

  * changeMelody(id) :
   - met à jour la mélodie sélectionnée (uniquement possible quand on n’écrit pas).

  * updateMetrics(metrics) :
   - met à jour l’état global des métriques à partir des calculs de WritingArea.

2. Zone d’écriture : WritingArea
 * Responsabilités :
  - Gérer les interactions tactiles (down / move / up).
  - Construire les strokes (tableau de points { x, y, t, force }).
  - Appeler computeMetrics(strokes) pour obtenir un WritingMetrics.
  - Appeler onMetricsChange (fourni par le contrôleur) pour propager les valeurs.

 * Piloter l’audio via WritingAudioPort :
  - playLoop(melodyId) au premier trait,
  - updateRate(speedPxPerSec) en fonction du mouvement,
  - pause() lorsque le doigt se lève,
  - stop() au démontage du composant.

 * Optimisations :

  - Recalcul des métriques throttlé : au maximum toutes les 50ms pendant le mouvement, ce qui limite le travail CPU tout en conservant une sensation de temps réel.

3. Audio : WritingAudioPort + MelodyPlayer
 * WritingAudioPort est une interface abstraite consommée par la vue :
  - playLoop(melodyId)
  - playPreview(melodyId)
  - updateRate(speedPxPerSec)
  - pause()
  - stop()

 * melodyPlayer est l’implémentation concrète basée sur expo-av :
  - charge et joue les fichiers audio déclarés dans melodies.ts,
  - ajuste le rate en fonction de la vitesse d’écriture,
  - gère proprement stop / unload.

** Remarque : expo-av est déprécié dans les versions récentes d’Expo.
Une future migration vers expo-audio est prévue (architecture déjà adaptée via WritingAudioPort). ** 

4. Sélection de mélodie : MelodySelector
Affiche une grille de 6 tuiles (images + textes).

 * Permet de :
  - pré-écouter une mélodie (hors session d’écriture),
  - sélectionner la mélodie pour la prochaine session.

 * Important :
  - Quand isRecording === true :
  - la grille est verrouillée :
  - pas de clic,
  - pas de pré-écoute,
  - pas de changement de mélodie.
  - Cela garantit que la mélodie reste constante pendant la session → métriques non faussées.

## 🧑‍💻 Installation
Prérequis :

- Node.js (version recommandée par Expo pour SDK 54)
- npm, yarn ou pnpm
- Expo CLI (npx expo fonctionne sans installation globale)

1. Cloner le repo
bash
Copier le code
git clone <url-du-repo>
cd writing-app
2. Installer les dépendances
bash
Copier le code
npm install
# ou
yarn
# ou
pnpm install

▶️ Lancer le projet
Expo (mode développement)
bash
Copier le code
npm run start
# ou
yarn start
# ou
pnpm start
Puis :

- Scanner le QR code avec l’application Expo Go sur mobile, ou

* Ouvrir le projet sur :
 - Android : a dans le terminal (ou npm run android)
 - iOS (Mac + Xcode) : i dans le terminal (ou npm run ios)
 - Web : w dans le terminal (ou npm run web)

## 📜 Scripts npm
Dans package.json :

npm run start : démarre Expo en mode dev.
npm run android : démarre Expo et lance l’app sur un device/simulateur Android.
npm run ios : démarre Expo et lance l’app sur un simulateur iOS (macOS requis).
npm run web : démarre l’app sur le web.
npm run lint : lance ESLint avec la config Expo.