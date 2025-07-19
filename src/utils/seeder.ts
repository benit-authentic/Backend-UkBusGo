import bcrypt from 'bcrypt';
import { Student } from '../models/student.model';
import { Driver } from '../models/driver.model';
import { Admin } from '../models/admin.model';
import { Validation } from '../models/validation.model';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Démarrage du seeding de la base de données...');

    // Effacer toutes les données existantes
    console.log('🗑️ Suppression de toutes les données existantes...');
    await Student.deleteMany({});
    await Driver.deleteMany({});
    await Admin.deleteMany({});
    await Validation.deleteMany({});
    console.log('✅ Base de données nettoyée');

    const saltRounds = 12;

    // Créer un admin
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const admin = new Admin({
      firstName: 'Admin',
      lastName: 'Principal',
      phone: '+22890000000',
      password: adminPassword,
    });
    await admin.save();
    console.log('👑 Admin créé: phone=+22890000000, password=admin123');

    // Créer deux chauffeurs
    const driver1Password = await bcrypt.hash('driver1', saltRounds);
    const driver1 = new Driver({
      firstName: 'Kofi',
      lastName: 'Mensah',
      phone: '+22891111111',
      password: driver1Password,
    });
    await driver1.save();
    console.log('🚗 Chauffeur 1 créé: phone=+22891111111, password=driver1');

    const driver2Password = await bcrypt.hash('driver2', saltRounds);
    const driver2 = new Driver({
      firstName: 'Ama',
      lastName: 'Asante',
      phone: '+22892222222',
      password: driver2Password,
    });
    await driver2.save();
    console.log('🚗 Chauffeur 2 créé: phone=+22892222222, password=driver2');

    // Créer deux étudiants
    // Étudiant 1 avec solde et tickets
    const student1Password = await bcrypt.hash('student33', saltRounds);
    const student1 = new Student({
      firstName: 'Kwame',
      lastName: 'Adjei',
      phone: '+22893333333',
      password: student1Password,
      balance: 10000,
      tickets: 20,
      history: [
        {
          type: 'purchase',
          amount: 3000,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Il y a 1 jour
        },
        {
          type: 'validation',
          amount: 500,
          date: new Date(Date.now() - 12 * 60 * 60 * 1000), // Il y a 12 heures
        },
      ],
    });
    await student1.save();
    console.log('🎓 Étudiant 1 créé: phone=+22893333333, password=student33, balance=10000F, tickets=20');

    // Étudiant 2 sans solde ni tickets
    const student2Password = await bcrypt.hash('student44', saltRounds);
    const student2 = new Student({
      firstName: 'Akosua',
      lastName: 'Osei',
      phone: '+22894444444',
      password: student2Password,
      balance: 0,
      tickets: 0,
      history: [],
    });
    await student2.save();
    console.log('🎓 Étudiant 2 créé: phone=+22894444444, password=student44, balance=0F, tickets=0');

    // Créer des validations entre l'étudiant 1 et le chauffeur 1
    console.log('📊 Création des validations de test...');
    
    const validations = [];
    const now = new Date();
    
    // Validation réussie il y a 2 heures
    validations.push(new Validation({
      student: student1._id,
      driver: driver1._id,
      amount: 150,
      date: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      isValid: true,
    }));
    
    // Validation réussie il y a 4 heures
    validations.push(new Validation({
      student: student1._id,
      driver: driver1._id,
      amount: 150,
      date: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      isValid: true,
    }));
    
    // Validation échouée il y a 1 heure (étudiant sans tickets)
    validations.push(new Validation({
      student: student2._id,
      driver: driver1._id,
      amount: 0,
      date: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      isValid: false,
    }));
    
    // Validation réussie hier
    validations.push(new Validation({
      student: student1._id,
      driver: driver1._id,
      amount: 150,
      date: new Date(now.getTime() - 25 * 60 * 60 * 1000),
      isValid: true,
    }));
    
    // Validation réussie avant-hier
    validations.push(new Validation({
      student: student1._id,
      driver: driver1._id,
      amount: 150,
      date: new Date(now.getTime() - 49 * 60 * 60 * 1000),
      isValid: true,
    }));

    await Validation.insertMany(validations);
    console.log(`✅ ${validations.length} validations créées`);
    console.log('   - 4 validations réussies (Kwame + Kofi)');
    console.log('   - 1 validation échouée (Akosua + Kofi)');

    console.log('✅ Seeding terminé avec succès !');
    console.log('📱 Comptes de test disponibles:');
    console.log('   Admin: +22890000000 / admin123');
    console.log('   Chauffeur 1: +22891111111 / driver1');
    console.log('   Chauffeur 2: +22892222222 / driver2');
    console.log('   Étudiant riche: +22893333333 / student33');
    console.log('   Étudiant pauvre: +22894444444 / student44');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  }
};
