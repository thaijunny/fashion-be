import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User.js';
import { Product } from '../entities/Product.js';
import { Project } from '../entities/Project.js';
import { Order } from '../entities/Order.js';
import { OrderItem } from '../entities/OrderItem.js';
import { CartItem } from '../entities/CartItem.js';
import { Asset } from '../entities/Asset.js';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'fashtion',
  synchronize: true, // Auto-create tables from entities
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Product, Project, Order, OrderItem, CartItem, Asset],
});
