# ![Wooow quel beau logo](https://www.fablabs.io/media/W1siZiIsIjIwMTcvMTAvMjUvMTMvNDgvMjQvZTQzZDgxMGUtM2ZiMy00MjZjLTlhNzYtOGFlYzg1ZWY1OGNjL0xPR08gREVWSU5DSSBGQUJMQUIucG5nIl0sWyJwIiwidGh1bWIiLCIzMDB4MzAwIl1d/LOGO%20DEVINCI%20FABLAB.png?sha=9ae18eebf0e6ea56)MyFab - Backend
Bonjour ! Vous vous trouvez actuellement sur le respository de MyFab mais côté backend. Le back est basé sur du nodejs en utilisant `express` pour gérer les endpoints et `swagger` pour faire une belle documentation 😁. Ce README ressemble beaucoup au README du [Front](https://github.com/MathieuSchl/MyFabUltimate_Front) ? Et oui j'ai fait un copié collé sans aucune forme de respect, mais bon c'est le même projet ¯\\_(ツ)_/¯

### Installation:
 1. Cloner le repo
 2. Avoir npm et node d'installer sur votre ordinateur --> google
 3. Exécuter dans le dossier du répertoire `npm install`
 4. Créer le fichier `./config.json`, de cette manière:
```
{
    "db": {
        "host": "localhost",
        "user": "root",
        "password": "",
        "database": "myFabUltimate"
    },
    "url": "http://localhost:",
    "port": 5000,
    "showSwagger": true,
    "ghost_key": "test"
}
```
 6. Créer la base de donnée `myFabUltimate`.
 7. Pour importer les tables et les valeurs par défaut exécutez la commande `npm run prepareDb`
 8. Et voilà c'est prêt ! Il vous suffit d'exécuter ensuite `npm run start` pour lancer le back (la documentation sera visible ici => http://localhost:5000/api-docs/).
 
