import 'reflect-metadata';
import { AppDataSource } from '../config/data-source.js';

async function reset() {
  await AppDataSource.initialize();
  console.log('🗑️  Clearing products and assets (CASCADE)...');
  await AppDataSource.query('TRUNCATE TABLE products CASCADE');
  await AppDataSource.query('TRUNCATE TABLE assets CASCADE');
  console.log('✅ Done. Now run: npm run seed');
  await AppDataSource.destroy();
}

reset().catch(console.error);
