import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User.js';
import { Product } from '../entities/Product.js';
import { Category } from '../entities/Category.js';
import { Size } from '../entities/Size.js';
import { Color } from '../entities/Color.js';
import { Material } from '../entities/Material.js';
import { ProductSize } from '../entities/ProductSize.js';
import { ProductColor } from '../entities/ProductColor.js';
import { ProductMaterial } from '../entities/ProductMaterial.js';
import { Project } from '../entities/Project.js';
import { Order } from '../entities/Order.js';
import { OrderItem } from '../entities/OrderItem.js';
import { CartItem } from '../entities/CartItem.js';
import { Asset } from '../entities/Asset.js';
import { StudioColor } from '../entities/StudioColor.js';
import { GarmentTemplate } from '../entities/GarmentTemplate.js';
import { DesignOrder } from '../entities/DesignOrder.js';
import { SystemSetting } from '../entities/SystemSetting.js';
import { AiGeneration } from '../entities/AiGeneration.js';

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
  entities: [
    User, Product, Category,
    Size, Color, Material,
    ProductSize, ProductColor, ProductMaterial,
    Project, Order, OrderItem, CartItem, Asset, StudioColor, GarmentTemplate,
    DesignOrder, SystemSetting, AiGeneration,
  ],
});
