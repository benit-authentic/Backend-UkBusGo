// Script d'initialisation MongoDB pour UK Bus GO
// Ce script s'exécute automatiquement lors du premier démarrage

// Créer la base de données et les collections
db = db.getSiblingDB('bus-tickets');

// Créer les collections avec validation
db.createCollection('students', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstName", "lastName", "phone", "password"],
      properties: {
        firstName: {
          bsonType: "string",
          description: "Prénom requis"
        },
        lastName: {
          bsonType: "string", 
          description: "Nom requis"
        },
        phone: {
          bsonType: "string",
          description: "Numéro de téléphone requis"
        },
        password: {
          bsonType: "string",
          description: "Mot de passe hashé requis"
        },
        balance: {
          bsonType: "number",
          minimum: 0,
          description: "Solde en FCFA"
        }
      }
    }
  }
});

db.createCollection('drivers', {
  validator: {
    $jsonSchema: {
      bsonType: "object", 
      required: ["firstName", "lastName", "phone", "password"],
      properties: {
        firstName: { bsonType: "string" },
        lastName: { bsonType: "string" },
        phone: { bsonType: "string" },
        password: { bsonType: "string" }
      }
    }
  }
});

db.createCollection('admins');
db.createCollection('transactions'); 
db.createCollection('validations');

// Créer les index pour performance
db.students.createIndex({ "phone": 1 }, { unique: true });
db.drivers.createIndex({ "phone": 1 }, { unique: true });
db.admins.createIndex({ "phone": 1 }, { unique: true });
db.transactions.createIndex({ "identifier": 1 }, { unique: true });
db.transactions.createIndex({ "student": 1 });
db.validations.createIndex({ "student": 1 });
db.validations.createIndex({ "driver": 1 });
db.validations.createIndex({ "date": -1 });

print('✅ Base de données UK Bus GO initialisée avec succès !');
print('📊 Collections créées : students, drivers, admins, transactions, validations');
print('🔍 Index de performance créés');
print('🚌 Prêt pour l\'application !');
