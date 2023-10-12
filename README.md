# ECV 2023 - M1 - Cours d'Algorithmie et Javascript

## Pré-recquis
Nécessite d'avoir [Bun](https://bun.sh/) >= 1.0.5

## Quickstart
Les commandes suivantes sont a exécuter à partir de la racine du projet.

Pour installer les dépendances:
```sh
$ bun install
```

Pour lancer la compilation à chaud du front:
```sh
$ bun run dev:front
```

* Si le watching de fichiers fonctionne mal (pour les gens sous Windows), vous devrez lancer manuellement le build du front après avoir enregistré vos changements dans le code source du front:
	```sh
	$ bun run build:front
	```

Pour lancer la compilation à chaud du back:
```sh
$ bun run dev:backend
```
* Si le watching de fichiers fonctionne mal (pour les gens sous Windows), vous devrez relancer manuellement l'exécution du back après avoir enregistré vos changements:
	```sh
	$ bun run start:backend
	```
