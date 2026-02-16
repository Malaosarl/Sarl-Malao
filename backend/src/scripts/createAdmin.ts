

import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@malao.sn';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
  const lastName = process.env.ADMIN_LAST_NAME || 'MALAO';

  try {
    console.log('🔐 Création de l\'utilisateur admin...');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Nom: ${firstName} ${lastName}`);
    console.log('');

    
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existing.rows.length > 0) {
      console.log('⚠️  Un utilisateur avec cet email existe déjà');
      return;
    }

    
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
       VALUES ($1, $2, $3, $4, 'admin', true)
       RETURNING id, email, first_name, last_name, role`,
      [email, passwordHash, firstName, lastName]
    );

    const user = result.rows[0];

    console.log('✅ Utilisateur admin créé avec succès !');
    console.log('📧 Email:', user.email);
    console.log('👤 Nom:', `${user.first_name} ${user.last_name}`);
    console.log('🔑 Mot de passe:', password);
    console.log('⚠️  N\'oubliez pas de changer le mot de passe en production !');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
    process.exit(1);
  }
}

createAdmin();

