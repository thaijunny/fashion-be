import 'reflect-metadata';
import { AppDataSource } from '../config/data-source.js';
import { User } from '../entities/User.js';
import { Product } from '../entities/Product.js';
import { Asset } from '../entities/Asset.js';
import { StudioColor } from '../entities/StudioColor.js';
import { GarmentTemplate } from '../entities/GarmentTemplate.js';
import { Category } from '../entities/Category.js';
import { Size } from '../entities/Size.js';
import { Color } from '../entities/Color.js';
import { Material } from '../entities/Material.js';
import { ProductSize } from '../entities/ProductSize.js';
import { ProductColor } from '../entities/ProductColor.js';
import { ProductMaterial } from '../entities/ProductMaterial.js';
import { SystemSetting } from '../entities/SystemSetting.js';
import bcrypt from 'bcryptjs';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'products');

// ── Helper: follow redirects and download image ──
function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      return resolve();
    }

    const request = (currentUrl: string) => {
      https.get(currentUrl, (response) => {
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return request(response.headers.location);
        }

        if (response.statusCode !== 200) {
          return reject(new Error(`Failed to download ${currentUrl}: HTTP ${response.statusCode}`));
        }

        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
        file.on('error', (err) => {
          fs.unlinkSync(filepath);
          reject(err);
        });
      }).on('error', reject);
    };

    request(url);
  });
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ── Shared Attribute Data ──
const categorySeed = [
  { name: 'Áo Thun', slug: 'ao-thun' },
  { name: 'Áo Hoodie', slug: 'ao-hoodie' },
  { name: 'Áo Khoác', slug: 'ao-khoac' },
  { name: 'Quần', slug: 'quan' },
  { name: 'Phụ Kiện', slug: 'phu-kien' },
];

const sizeSeed = [
  { name: 'S', measurements: { realWidth: 48, realHeight: 66, printArea: { width: 28, height: 35 } } },
  { name: 'M', measurements: { realWidth: 50, realHeight: 69, printArea: { width: 30, height: 38 } } },
  { name: 'L', measurements: { realWidth: 53, realHeight: 72, printArea: { width: 32, height: 40 } } },
  { name: 'XL', measurements: { realWidth: 56, realHeight: 75, printArea: { width: 34, height: 42 } } },
  { name: 'XXL', measurements: { realWidth: 59, realHeight: 78, printArea: { width: 36, height: 44 } } },
  { name: 'One Size', measurements: { realWidth: 55, realHeight: 73, printArea: { width: 33, height: 41 } } },
  { name: '28', measurements: { waist: 71, length: 100, printArea: { width: 20, height: 30 } } },
  { name: '30', measurements: { waist: 76, length: 102, printArea: { width: 22, height: 32 } } },
  { name: '32', measurements: { waist: 81, length: 104, printArea: { width: 24, height: 34 } } },
  { name: '34', measurements: { waist: 86, length: 106, printArea: { width: 26, height: 36 } } },
];

const colorSeed = [
  { name: 'Đen', hex_code: '#000000' },
  { name: 'Trắng', hex_code: '#ffffff' },
  { name: 'Đỏ', hex_code: '#e60012' },
  { name: 'Xám', hex_code: '#2a2a2a' },
  { name: 'Xám đậm', hex_code: '#1a1a1a' },
  { name: 'Xanh Navy', hex_code: '#1a1a3a' },
  { name: 'Vàng Neon', hex_code: '#f0ff00' },
  { name: 'Xanh lá', hex_code: '#1a3a1a' },
  { name: 'Nâu', hex_code: '#3a3a2a' },
  { name: 'Bạc', hex_code: '#C0C0C0' },
  { name: 'Vàng Kim', hex_code: '#FFD700' },
];

const materialSeed = [
  'Cotton 100%', 'Cotton Premium', 'Heavyweight Fleece', 'Cotton Standard',
  'Cool-Air Fabric', 'CVC 65/35', 'Cotton Pima', 'French Terry 380GSM',
  'Cotton Nỉ', 'Nỉ Bông Premium', 'Nỉ Cotton 350GSM', 'Nylon Chống Nước',
  'Polyester Premium', 'Tactical Windbreaker', 'Gore-Tex Tech',
  'French Terry 300GSM', 'Cotton Ripstop', 'Kaki Wash', 'Cotton Twill',
  'Khaki', 'Canvas 16oz', 'Denim Wash', 'Thép Không Gỉ 316L', 'Acrylic Soft-Rib'
];

// ── Studio Color Data ──
const studioColorSeed = [
  { name: 'Red Urban', hex_code: '#e60012' },
  { name: 'Neon Yellow', hex_code: '#f0ff00' },
  { name: 'Pure White', hex_code: '#ffffff' },
  { name: 'Deep Black', hex_code: '#000000' },
  { name: 'Dark Grey', hex_code: '#1a1a1a' },
  { name: 'Orange Peel', hex_code: '#ff6b00' },
  { name: 'Mint Spring', hex_code: '#00ff88' },
  { name: 'Electric Blue', hex_code: '#0088ff' },
  { name: 'Cyber Pink', hex_code: '#ff00ff' },
  { name: 'Deep Purple', hex_code: '#8b00ff' },
  { name: 'Cyan Blue', hex_code: '#00ffff' },
];

// ── Studio Asset Data ──
const studioAssetSeed = [
  // Stickers
  { name: 'Fire', type: 'sticker', url: '🔥' },
  { name: 'Lightning', type: 'sticker', url: '⚡' },
  { name: 'Skull', type: 'sticker', url: '💀' },
  { name: 'Guitar', type: 'sticker', url: '🎸' },
  { name: 'Mic', type: 'sticker', url: '🎤' },
  { name: 'Basketball', type: 'sticker', url: '🏀' },
  { name: 'Target', type: 'sticker', url: '🎯' },
  { name: 'Diamond', type: 'sticker', url: '💎' },
  { name: 'Eagle', type: 'sticker', url: '🦅' },
  { name: 'Dragon', type: 'sticker', url: '🐉' },
  { name: 'Star', type: 'sticker', url: '🌟' },
  { name: 'Boom', type: 'sticker', url: '💥' },
  { name: 'Palette', type: 'sticker', url: '🎨' },
  { name: 'Theater', type: 'sticker', url: '🎭' },
  { name: 'Circus', type: 'sticker', url: '🎪' },
  { name: 'Dice', type: 'sticker', url: '🎲' },
  // Shapes
  { name: 'Square', type: 'shape', url: 'rect' },
  { name: 'Circle', type: 'shape', url: 'circle' },
  { name: 'Triangle', type: 'shape', url: 'triangle' },
  // Fonts
  { name: 'Be Vietnam Pro', type: 'font', url: "'Be Vietnam Pro', sans-serif" },
  { name: 'Roboto', type: 'font', url: "'Roboto', sans-serif" },
  { name: 'Montserrat', type: 'font', url: "'Montserrat', sans-serif" },
  { name: 'Oswald', type: 'font', url: "'Oswald', sans-serif" },
  { name: 'Playfair Display', type: 'font', url: "'Playfair Display', serif" },
  { name: 'Dancing Script', type: 'font', url: "'Dancing Script', cursive" },
  { name: 'Permanent Marker', type: 'font', url: "'Permanent Marker', cursive" },
  { name: 'Bangers', type: 'font', url: "'Bangers', cursive" },
  { name: 'Archivo Black', type: 'font', url: "'Archivo Black', sans-serif" },
  { name: 'Anton', type: 'font', url: "'Anton', sans-serif" },
  { name: 'Righteous', type: 'font', url: "'Righteous', cursive" },
  { name: 'Russo One', type: 'font', url: "'Russo One', sans-serif" },
];

// ── Product Data ──
const productsData = [
  {
    name: 'URBAN CHAOS TEE',
    category: 'ao-thun',
    price: 450000,
    original_price: 550000,
    imageUrls: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#000000', '#ffffff', '#e60012'],
    materials: ['Cotton 100%', 'Cotton Premium', 'Heavyweight Fleece'],
    description: 'Áo thun oversize 100% cotton 250GSM, in DTG graphic street art phong cách đường phố Sài Gòn.',
    is_new: true,
    is_on_sale: true,
    variants: [
      { material: 'Heavyweight Fleece', price: 550000 },
      { material: 'Cotton Premium', price: 480000 },
      { size: 'XL', price: 475000 },
    ],
  },
  {
    name: 'NEON NIGHTS TEE',
    category: 'ao-thun',
    price: 490000,
    imageUrls: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['#000000', '#f0ff00'],
    materials: ['Cotton 100%', 'Cool-Air Fabric'],
    description: 'Áo thun phản quang với họa tiết Neon Cyberpunk nổi bật dưới ánh đèn đêm.',
    is_new: true,
    variants: [
      { material: 'Cool-Air Fabric', price: 520000 },
    ],
  },
  {
    name: 'CYBERPUNK OVERSIZE TEE',
    category: 'ao-thun',
    price: 550000,
    imageUrls: [
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&q=80',
    ],
    sizes: ['L', 'XL', 'XXL'],
    colors: ['#000000', '#1a1a3a', '#1a1a1a'],
    materials: ['Heavyweight Fleece', 'Cotton Premium'],
    description: 'Phom dáng rộng rãi, chất liệu vải dày dặn, in hình graphic tương lai.',
    is_best_seller: true,
  },
  {
    name: 'VINTAGE WASH TEE',
    category: 'ao-thun',
    price: 390000,
    original_price: 450000,
    imageUrls: [
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L'],
    colors: ['#2a2a2a', '#3a3a2a'],
    materials: ['Cotton Standard', 'Cotton Pima'],
    description: 'Vải cotton wash bụi bặm, tạo cảm giác vintage thời thượng.',
    is_on_sale: true,
  },
  {
    name: 'REBEL HOODIE',
    category: 'ao-hoodie',
    price: 750000,
    imageUrls: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
      'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&q=80',
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['#1a1a1a', '#000000'],
    materials: ['French Terry 380GSM', 'Cotton Nỉ'],
    description: 'Hoodie oversize French Terry 380GSM dày dặn. Mũ 2 lớp, dây rút kim loại, túi kangaroo lớn.',
    is_best_seller: true,
    variants: [
      { material: 'French Terry 380GSM', price: 790000 },
    ],
  },
  {
    name: 'STREET LEGEND HOODIE',
    category: 'ao-hoodie',
    price: 820000,
    imageUrls: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80',
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['#e60012', '#000000'],
    materials: ['Nỉ Bông Premium', 'Cotton Nỉ'],
    description: 'Hoodie premium Limited Edition vải nỉ bông 400GSM.',
    is_new: true,
  },
  {
    name: 'TECHWEAR UTILITY HOODIE',
    category: 'ao-hoodie',
    price: 890000,
    imageUrls: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['#000000', '#1a1a1a'],
    materials: ['Nylon Chống Nước', 'Nỉ Bông Premium'],
    description: 'Hoodie phong cách Techwear với nhiều túi hộp và khóa kéo chống nước.',
    is_new: true,
    variants: [
      { material: 'Nylon Chống Nước', price: 950000 },
    ],
  },
  {
    name: 'MINIMALIST GREY HOODIE',
    category: 'ao-hoodie',
    price: 680000,
    imageUrls: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#2a2a2a'],
    materials: ['Cotton Nỉ', 'Cotton Standard'],
    description: 'Thiết kế tối giản, dễ dàng phối hợp với nhiều trang phục khác nhau.',
  },
  {
    name: 'OVERSIZE LOGO HOODIE',
    category: 'ao-hoodie',
    price: 720000,
    original_price: 850000,
    imageUrls: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80',
    ],
    sizes: ['L', 'XL', 'XXL'],
    colors: ['#e60012', '#000000', '#ffffff'],
    materials: ['Nỉ Cotton 350GSM', 'French Terry 300GSM'],
    description: 'In logo thương hiệu bản lớn trước ngực, phong cách b-boy năng động.',
    is_on_sale: true,
  },
  {
    name: 'WIND BREAKER X',
    category: 'ao-khoac',
    price: 950000,
    imageUrls: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['#1a1a1a', '#1a3a1a'],
    materials: ['Tactical Windbreaker', 'Gore-Tex Tech'],
    description: 'Áo khoác gió nhẹ, chống thấm nước, phù hợp cho các hoạt động ngoài trời.',
    is_new: true,
    variants: [
      { material: 'Gore-Tex Tech', price: 1200000 },
    ],
  },
  {
    name: 'DENIM TRUCKER JACKET',
    category: 'ao-khoac',
    price: 1100000,
    imageUrls: [
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800&q=80',
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['#1a1a3a', '#2a2a2a'],
    materials: ['Denim Wash', 'Cotton Ripstop'],
    description: 'Áo khoác denim cổ điển, wash nhẹ tạo điểm nhấn bụi bặm.',
    is_best_seller: true,
  },
  {
    name: 'TECH VARSITY JACKET',
    category: 'ao-khoac',
    price: 1350000,
    imageUrls: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    ],
    sizes: ['L', 'XL'],
    colors: ['#000000', '#ffffff'],
    materials: ['Polyester Premium', 'Nylon Chống Nước'],
    description: 'Sự kết hợp giữa phong cách Varsity truyền thống và chất liệu kĩ thuật hiện đại.',
    is_new: true,
  },
  {
    name: 'GRAFFITI BOMBER',
    category: 'ao-khoac',
    price: 1200000,
    original_price: 1500000,
    imageUrls: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['#000000', '#1a1a3a'],
    materials: ['Nylon Chống Nước', 'Polyester Premium'],
    description: 'Bomber jacket MA-1 vải nylon chống nước nhẹ.',
    is_best_seller: true,
    is_on_sale: true,
  },
  {
    name: 'CARGO TECH PANTS',
    category: 'quan',
    price: 650000,
    imageUrls: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#000000', '#1a1a1a', '#1a3a1a'],
    materials: ['Cotton Ripstop', 'Tactical Windbreaker'],
    description: 'Quần túi hộp phong cách quân đội, chất liệu bền bỉ, nhiều ngăn chứa đồ.',
    is_new: true,
    variants: [
      { size: 'XL', price: 680000 },
    ],
  },
  {
    name: 'DISTRESSED SKATE JEANS',
    category: 'quan',
    price: 780000,
    imageUrls: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
    ],
    sizes: ['28', '30', '32', '34'],
    colors: ['#1a1a3a', '#2a2a2a'],
    materials: ['Denim Wash', 'Kaki Wash'],
    description: 'Quần jeans rách gối, phom baggy thoải mái cho các hoạt động trượt ván.',
    is_best_seller: true,
  },
  {
    name: 'CHILL SWEATPANTS',
    category: 'quan',
    price: 450000,
    original_price: 550000,
    imageUrls: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['#2a2a2a', '#000000'],
    materials: ['French Terry 300GSM', 'Cotton Standard'],
    description: 'Quần nỉ bo gấu, thích hợp mặc ở nhà hoặc đi dạo phố.',
    is_on_sale: true,
  },
  {
    name: 'STREET RUNNER JOGGER',
    category: 'quan',
    price: 580000,
    imageUrls: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#000000', '#2a2a2a', '#1a3a1a'],
    materials: ['French Terry 300GSM', 'Cotton Ripstop'],
    description: 'Jogger pants vải French Terry 300GSM, co giãn 4 chiều.',
    is_new: true,
  },
  {
    name: 'METAL CHAIN WALLET',
    category: 'phu-kien',
    price: 350000,
    imageUrls: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
    ],
    sizes: ['One Size'],
    colors: ['#000000', '#C0C0C0'],
    materials: ['Canvas 16oz', 'Thép Không Gỉ 316L'],
    description: 'Ví canvas kèm xích kim loại phong cách punk rock.',
    is_new: true,
  },
  {
    name: 'STREET BEANIE',
    category: 'phu-kien',
    price: 220000,
    imageUrls: [
      'https://images.unsplash.com/photo-1576872405352-785868307db7?w=800&q=80',
    ],
    sizes: ['One Size'],
    colors: ['#000000', '#e60012', '#f0ff00'],
    materials: ['Acrylic Soft-Rib'],
    description: 'Mũ len bo sát, giữ ấm và tạo điểm nhấn cho outfit.',
    is_best_seller: true,
  },
  {
    name: 'LOGO SOCKS PACK',
    category: 'phu-kien',
    price: 150000,
    imageUrls: [
      'https://images.unsplash.com/photo-1582966298431-440ef42d6f07?w=800&q=80',
    ],
    sizes: ['One Size'],
    colors: ['#ffffff', '#000000'],
    materials: ['Cotton Standard'],
    description: 'Set 3 đôi tất cotton in logo thương hiệu.',
    is_new: true,
  },
  {
    name: 'UNDERGROUND CAP',
    category: 'phu-kien',
    price: 280000,
    imageUrls: [
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&q=80',
    ],
    sizes: ['One Size'],
    colors: ['#000000', '#e60012', '#ffffff'],
    materials: ['Cotton Twill'],
    description: 'Nón snapback 6 panel với logo thêu nổi 3D.',
  }
];

async function seed() {
  try {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    console.log('📦 Database connected. Starting consolidated seed...\n');

    // ──────────────── 1. SEED ADMIN USER ────────────────
    const userRepo = AppDataSource.getRepository(User);
    const existingAdmin = await userRepo.findOneBy({ email: 'admin@fashtion.vn' });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      const admin = userRepo.create({
        email: 'admin@fashtion.vn',
        password: hashedPassword,
        full_name: 'Admin Fashtion',
        role: 'admin',
      });
      await userRepo.save(admin);
      console.log('✅ Admin user created');
    }

    // ──────────────── 2. SEED CATEGORIES ────────────────
    const categoryRepo = AppDataSource.getRepository(Category);
    const categoryMap: Record<string, Category> = {};
    for (const c of categorySeed) {
      let cat = await categoryRepo.findOneBy({ slug: c.slug });
      if (!cat) {
        cat = await categoryRepo.save(categoryRepo.create(c));
        console.log(`  ✓ Category: ${c.name}`);
      }
      categoryMap[c.slug] = cat;
    }

    // ──────────────── 3. SEED ATTRIBUTES ────────────────
    const sizeRepo = AppDataSource.getRepository(Size);
    const sizeMap: Record<string, Size> = {};
    for (const s of sizeSeed) {
      let item = await sizeRepo.findOneBy({ name: s.name });
      if (!item) {
        item = await sizeRepo.save(sizeRepo.create({ name: s.name, measurements: s.measurements }));
        console.log(`  ✓ Size: ${s.name}`);
      } else if (!item.measurements) {
        item.measurements = s.measurements;
        item = await sizeRepo.save(item);
        console.log(`  ↻ Size updated: ${s.name}`);
      }
      sizeMap[s.name] = item;
    }

    const colorRepo = AppDataSource.getRepository(Color);
    const colorMap: Record<string, Color> = {};
    for (const c of colorSeed) {
      let item = await colorRepo.findOneBy({ hex_code: c.hex_code });
      if (!item) {
        item = await colorRepo.save(colorRepo.create(c));
        console.log(`  ✓ Color: ${c.name}`);
      }
      colorMap[c.hex_code] = item;
    }

    const materialRepo = AppDataSource.getRepository(Material);
    const materialMap: Record<string, Material> = {};
    for (const name of materialSeed) {
      let item = await materialRepo.findOneBy({ name });
      if (!item) {
        item = await materialRepo.save(materialRepo.create({ name }));
        console.log(`  ✓ Material: ${name}`);
      }
      materialMap[name] = item;
    }

    // ──────────────── 4. SEED PRODUCTS & JUNCTIONS ────────────────
    const productRepo = AppDataSource.getRepository(Product);
    const psRepo = AppDataSource.getRepository(ProductSize);
    const pcRepo = AppDataSource.getRepository(ProductColor);
    const pmRepo = AppDataSource.getRepository(ProductMaterial);

    fs.mkdirSync(UPLOADS_DIR, { recursive: true });

    for (const data of productsData) {
      let product = await productRepo.findOneBy({ name: data.name });
      if (!product) {
        const slug = slugify(data.name);
        const images: string[] = [];
        for (let i = 0; i < data.imageUrls.length; i++) {
          const filename = `${slug}-${i + 1}.jpg`;
          const filepath = path.join(UPLOADS_DIR, filename);
          await downloadImage(data.imageUrls[i], filepath).catch(() => { });
          images.push(`/uploads/products/${filename}`);
        }

        product = productRepo.create({
          name: data.name,
          category_id: categoryMap[data.category]?.id,
          price: data.price,
          original_price: data.original_price,
          images: images,
          description: data.description,
          is_new: data.is_new || false,
          is_best_seller: data.is_best_seller || false,
          is_on_sale: data.is_on_sale || false,
        });
        product = await productRepo.save(product);
        console.log(`✅ Product: ${data.name}`);

        // Seed Junctions
        if (data.sizes) {
          for (const sName of data.sizes) {
            const v = data.variants?.find((v: any) => v.size === sName);
            await psRepo.save(psRepo.create({
              product_id: product.id,
              size_id: sizeMap[sName].id,
              price_adjustment: v ? (v as any).price - data.price : 0
            }));
          }
        }
        if (data.colors) {
          for (const cHex of data.colors) {
            const v = data.variants?.find((v: any) => v.color === cHex);
            await pcRepo.save(pcRepo.create({
              product_id: product.id,
              color_id: colorMap[cHex].id,
              price_adjustment: v ? (v as any).price - data.price : 0
            }));
          }
        }
        if (data.materials) {
          for (const mName of data.materials) {
            const v = data.variants?.find((v: any) => v.material === mName);
            await pmRepo.save(pmRepo.create({
              product_id: product.id,
              material_id: materialMap[mName].id,
              price_adjustment: v ? (v as any).price - data.price : 0
            }));
          }
        }
      }
    }

    // ──────────────── 5. SEED STUDIO COLORS ────────────────
    const studioColorRepo = AppDataSource.getRepository(StudioColor);
    for (const c of studioColorSeed) {
      let item = await studioColorRepo.findOneBy({ hex_code: c.hex_code });
      if (!item) {
        await studioColorRepo.save(studioColorRepo.create(c));
        console.log(`  ✓ Studio Color: ${c.name}`);
      }
    }

    // ──────────────── 6. SEED STUDIO ASSETS ────────────────
    const assetRepo = AppDataSource.getRepository(Asset);
    for (const a of studioAssetSeed) {
      let item = await assetRepo.findOneBy({ name: a.name, type: a.type });
      if (!item) {
        await assetRepo.save(assetRepo.create(a));
        console.log(`  ✓ Studio Asset (${a.type}): ${a.name}`);
      }
    }

    // ──────────────── 7. SEED GARMENT TEMPLATES ────────────────
    const templateRepo = AppDataSource.getRepository(GarmentTemplate);
    const garmentTemplates = [
      {
        name: 'Áo Thun Cổ Tròn',
        icon: '👕',
        width: 400,
        height: 500,
        front_image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
        back_image: 'https://images.unsplash.com/photo-1622445275576-721325763148?w=800&q=80',
        front_design_area: { left: 25, top: 20, right: 25, bottom: 30 },
        back_design_area: { left: 25, top: 15, right: 25, bottom: 25 },
      },
      {
        name: 'Áo Hoodie',
        icon: '🧥',
        width: 420,
        height: 520,
        front_image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
        back_image: 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&q=80',
        front_design_area: { left: 27, top: 25, right: 27, bottom: 30 },
        back_design_area: { left: 25, top: 20, right: 25, bottom: 25 },
      },
      {
        name: 'Áo Tank Top',
        icon: '🎽',
        width: 380,
        height: 480,
        front_image: 'https://images.unsplash.com/photo-1503341504253-dff4f3657f37?w=800&q=80',
        back_image: 'https://images.unsplash.com/photo-1503341504253-dff4f3657f37?w=800&q=80',
        front_design_area: { left: 22, top: 15, right: 22, bottom: 30 },
        back_design_area: { left: 22, top: 10, right: 22, bottom: 25 },
      },
      {
        name: 'Áo Polo',
        icon: '👔',
        width: 400,
        height: 500,
        front_image: 'https://images.unsplash.com/photo-1625910513413-5fc67b6cd000?w=800&q=80',
        back_image: 'https://images.unsplash.com/photo-1625910513413-5fc67b6cd000?w=800&q=80',
        front_design_area: { left: 28, top: 25, right: 28, bottom: 30 },
        back_design_area: { left: 25, top: 15, right: 25, bottom: 25 },
      },
    ];
    for (const t of garmentTemplates) {
      let item = await templateRepo.findOneBy({ name: t.name });
      if (!item) {
        await templateRepo.save(templateRepo.create(t));
        console.log(`  ✓ Garment Template: ${t.name}`);
      }
    }

    // ──────────────── 8. SEED SYSTEM SETTINGS ────────────────
    const settingRepo = AppDataSource.getRepository(SystemSetting);
    const defaultSettings = [
      { key: 'marquee_content', value: '🔥 FREESHIP CHO ĐƠN HÀNG TỪ 500K • GIẢM 10% CHO THÀNH VIÊN MỚI • THIẾT KẾ RIÊNG TẠI DESIGN STUDIO 🔥' },
      { key: 'phone_number', value: '0901 234 567' },
      { key: 'email', value: 'hello@untyped.vn' },
      { key: 'address', value: '123 Nguyễn Huệ, Q.1, TP.HCM' },
      { key: 'facebook_link', value: 'https://facebook.com/untyped' },
      { key: 'youtube_link', value: 'https://youtube.com/@untyped' },
      { key: 'instagram_link', value: 'https://instagram.com/untyped' },
      { key: 'banner_image', value: '' },
    ];

    for (const s of defaultSettings) {
      let item = await settingRepo.findOneBy({ key: s.key });
      if (!item) {
        await settingRepo.save(settingRepo.create(s));
        console.log(`  ✓ System Setting: ${s.key}`);
      }
    }

    console.log('\n🎉 Consolidated seed completed successfully!');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
