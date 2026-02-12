import 'reflect-metadata';
import { AppDataSource } from '../config/data-source.js';
import { User } from '../entities/User.js';
import { Product } from '../entities/Product.js';
import { Asset } from '../entities/Asset.js';
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
      console.log(`  ⏭️  Already exists: ${path.basename(filepath)}`);
      return resolve();
    }

    const request = (currentUrl: string) => {
      https.get(currentUrl, (response) => {
        // Follow redirects (301, 302, 303, 307, 308)
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
          console.log(`  ✅ Downloaded: ${path.basename(filepath)}`);
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

// ── Product data with Unsplash URLs for downloading ──
const productsData = [
  // ── ÁO THUN (T-shirts) ──
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
    description: 'Áo thun oversize 100% cotton 250GSM, in DTG graphic street art phong cách đường phố Sài Gòn. Form rộng, bo tay áo và cổ áo dày dặn.',
    is_new: true,
    is_on_sale: true,
    configuration: {
      width: 1000, height: 1200,
      variants: {
        front: { image: '/templates/tshirt-front.png', designArea: { top: 20, left: 25, right: 25, bottom: 30 } },
        back: { image: '/templates/tshirt-back.png', designArea: { top: 20, left: 25, right: 25, bottom: 30 } },
      },
    },
  },
  {
    name: 'NEON NIGHTS TEE',
    category: 'ao-thun',
    price: 420000,
    imageUrls: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#000000', '#f0ff00'],
    description: 'Áo thun unisex với mực in phản quang - phát sáng dưới đèn UV. Vải cotton compact 220GSM co giãn nhẹ, mềm mịn.',
    is_new: true,
    configuration: {
      width: 1000, height: 1200,
      variants: {
        front: { image: '/templates/tshirt-front.png', designArea: { top: 20, left: 25, right: 25, bottom: 30 } },
        back: { image: '/templates/tshirt-back.png', designArea: { top: 20, left: 25, right: 25, bottom: 30 } },
      },
    },
  },
  {
    name: 'ANARCHY TEE',
    category: 'ao-thun',
    price: 390000,
    imageUrls: [
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80',
      'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#ffffff', '#000000'],
    description: 'Áo thun basic với graphic minimalist typography. Vải CVC 65/35 mềm mại, thấm hút mồ hôi. In lụa chất lượng cao, không bong tróc sau 50 lần giặt.',
    configuration: {
      width: 1000, height: 1200,
      variants: {
        front: { image: '/templates/tshirt-front.png', designArea: { top: 20, left: 25, right: 25, bottom: 30 } },
        back: { image: '/templates/tshirt-back.png', designArea: { top: 20, left: 25, right: 25, bottom: 30 } },
      },
    },
  },
  {
    name: 'SAIGON SOUL TEE',
    category: 'ao-thun',
    price: 480000,
    imageUrls: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#000000', '#1a3a1a', '#e60012'],
    description: 'Áo thun oversize họa tiết Sài Gòn về đêm - in DTG full color trước sau. Cotton Pima 280GSM cao cấp, form boxy hiện đại.',
    is_new: true,
    is_best_seller: true,
    configuration: {
      width: 1000, height: 1200,
      variants: {
        front: { image: '/templates/tshirt-front.png', designArea: { top: 18, left: 20, right: 20, bottom: 28 } },
        back: { image: '/templates/tshirt-back.png', designArea: { top: 18, left: 20, right: 20, bottom: 28 } },
      },
    },
  },

  // ── HOODIE ──
  {
    name: 'REBEL HOODIE',
    category: 'ao-hoodie',
    price: 750000,
    imageUrls: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
      'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&q=80',
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['#0a0a0a', '#1a1a1a'],
    description: 'Hoodie oversize French Terry 380GSM dày dặn. Mũ 2 lớp, dây rút kim loại, túi kangaroo lớn. In lụa + thêu logo đặc biệt phía trước.',
    is_best_seller: true,
    configuration: {
      width: 1200, height: 1400,
      variants: {
        front: { image: '/templates/hoodie-front.png', designArea: { top: 25, left: 30, right: 30, bottom: 35 } },
        back: { image: '/templates/hoodie-back.png', designArea: { top: 20, left: 25, right: 25, bottom: 30 } },
      },
    },
  },
  {
    name: 'STREET LEGEND HOODIE',
    category: 'ao-hoodie',
    price: 820000,
    imageUrls: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['#e60012', '#000000'],
    description: 'Hoodie premium Limited Edition vải nỉ bông 400GSM. Phối màu bold, in lụa chìm trên vải đỏ. Form oversize drop-shoulder, tay raglan.',
    is_new: true,
    configuration: {
      width: 1200, height: 1400,
      variants: {
        front: { image: '/templates/hoodie-front.png', designArea: { top: 25, left: 30, right: 30, bottom: 35 } },
        back: { image: '/templates/hoodie-back.png', designArea: { top: 20, left: 25, right: 25, bottom: 30 } },
      },
    },
  },
  {
    name: 'MIDNIGHT ZIP-UP HOODIE',
    category: 'ao-hoodie',
    price: 890000,
    original_price: 1050000,
    imageUrls: [
      'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800&q=80',
      'https://images.unsplash.com/photo-1542406775-ade58c52d2e4?w=800&q=80',
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['#000000', '#2a2a2a'],
    description: 'Hoodie zipper full-zip vải nỉ cotton 350GSM. Khóa kéo YKK, 2 túi bên, thêu logo trên ngực trái. Phù hợp layering streetwear.',
    is_on_sale: true,
    is_best_seller: true,
    configuration: {
      width: 1200, height: 1400,
      variants: {
        front: { image: '/templates/hoodie-front.png', designArea: { top: 25, left: 32, right: 32, bottom: 35 } },
        back: { image: '/templates/hoodie-back.png', designArea: { top: 20, left: 25, right: 25, bottom: 30 } },
      },
    },
  },

  // ── ÁO KHOÁC (Jackets) ──
  {
    name: 'GRAFFITI BOMBER',
    category: 'ao-khoac',
    price: 1200000,
    original_price: 1500000,
    imageUrls: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['#000000', '#1a1a3a'],
    description: 'Bomber jacket MA-1 vải nylon chống nước nhẹ. Họa tiết graffiti thêu tay thủ công, lót satin bên trong. Bo cổ, tay và gấu dệt rib giữ form.',
    is_best_seller: true,
    is_on_sale: true,
  },
  {
    name: 'URBAN WARRIOR JACKET',
    category: 'ao-khoac',
    price: 980000,
    imageUrls: [
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80',
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800&q=80',
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['#000000'],
    description: 'Áo khoác dù tactical chống nước 3 lớp. Đường may dán seam-tape, nhiều túi tiện ích, hood có thể tháo rời. Phong cách techwear hiện đại.',
  },

  // ── QUẦN (Pants) ──
  {
    name: 'STREET RUNNER JOGGER',
    category: 'quan',
    price: 580000,
    imageUrls: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#000000', '#2a2a2a', '#1a3a1a'],
    description: 'Jogger pants vải French Terry 300GSM, co giãn 4 chiều. Bo ống chân, lưng thun dây rút, 2 túi chéo + 1 túi sau. Logo thêu nổi bên hông.',
    is_new: true,
  },
  {
    name: 'CHAOS CARGO PANTS',
    category: 'quan',
    price: 680000,
    imageUrls: [
      'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#2a2a2a', '#1a1a1a', '#3a3a2a'],
    description: 'Quần cargo 6 túi vải kaki wash mềm. Form relaxed-fit, dây rút ống quần, khóa nút kim loại. Phong cách utilitarian workwear.',
    is_best_seller: true,
  },
  {
    name: 'RIOT SHORTS',
    category: 'quan',
    price: 420000,
    imageUrls: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80',
      'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#000000', '#2a2a2a'],
    description: 'Quần shorts dáng rộng vải cotton ripstop bền bỉ. Lưng thun co giãn + dây rút, 2 túi bên sâu. Dài qua gối, phù hợp mùa hè Việt Nam.',
    is_new: true,
  },

  // ── PHỤ KIỆN (Accessories) ──
  {
    name: 'UNDERGROUND CAP',
    category: 'phu-kien',
    price: 280000,
    imageUrls: [
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&q=80',
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&q=80',
    ],
    sizes: ['One Size'],
    colors: ['#000000', '#e60012', '#ffffff'],
    description: 'Nón snapback 6 panel với logo thêu nổi 3D. Khóa nhựa điều chỉnh kích thước, vành phẳng structured. Vải cotton twill chắc chắn.',
  },
  {
    name: 'CROSSBODY BAG',
    category: 'phu-kien',
    price: 350000,
    imageUrls: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    ],
    sizes: ['One Size'],
    colors: ['#000000', '#e60012'],
    description: 'Túi đeo chéo mini vải canvas 16oz + denim wash. Khóa kéo SBS, dây đeo chéo có thể điều chỉnh. 2 ngăn chính + 1 ngăn phụ đựng điện thoại.',
    is_best_seller: true,
  },
  {
    name: 'CHAIN NECKLACE SET',
    category: 'phu-kien',
    price: 220000,
    imageUrls: [
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
    ],
    sizes: ['One Size'],
    colors: ['#C0C0C0', '#FFD700'],
    description: 'Bộ 2 dây chuyền xích mắt xích kiểu Cuban link. Chất liệu thép không gỉ 316L, mạ bạc/vàng không gây dị ứng. Dài 50cm + 60cm.',
    is_new: true,
  },
  {
    name: 'BEANIE RIBBED',
    category: 'phu-kien',
    price: 190000,
    imageUrls: [
      'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&q=80',
      'https://images.unsplash.com/photo-1510598969022-c4c6c5d05769?w=800&q=80',
    ],
    sizes: ['One Size'],
    colors: ['#000000', '#e60012', '#1a1a3a'],
    description: 'Mũ len beanie rib dệt kim acrylic mềm mại. Co giãn tốt, ôm đầu thoải mái. Logo tag woven phía trước. Phong cách cold-weather streetwear.',
  },
];

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('📦 Database connected. Starting seed...\n');

    // ──────────────── SEED ADMIN USER ────────────────
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
      console.log('✅ Admin user created: admin@fashtion.vn / admin123');
    } else {
      console.log('⏭️  Admin user already exists, skipping.');
    }

    // ──────────────── DOWNLOAD IMAGES & SEED PRODUCTS ────────────────
    const productRepo = AppDataSource.getRepository(Product);
    const productCount = await productRepo.count();

    if (productCount === 0) {
      // Create uploads directory
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      console.log('\n📸 Downloading product images...');

      const productEntities = [];

      for (const data of productsData) {
        const slug = slugify(data.name);
        const localImages: string[] = [];

        for (let i = 0; i < data.imageUrls.length; i++) {
          const filename = `${slug}-${i + 1}.jpg`;
          const filepath = path.join(UPLOADS_DIR, filename);
          try {
            await downloadImage(data.imageUrls[i], filepath);
            localImages.push(`/uploads/products/${filename}`);
          } catch (err: any) {
            console.warn(`  ⚠️  Failed to download ${filename}: ${err.message}`);
            // fallback to original URL
            localImages.push(data.imageUrls[i]);
          }
        }

        // Build product entity (exclude imageUrls, add images)
        const { imageUrls, ...rest } = data;
        productEntities.push(productRepo.create({ ...rest, images: localImages }));
      }

      await productRepo.save(productEntities);
      console.log(`\n✅ ${productEntities.length} products seeded with local images.`);
    } else {
      console.log(`⏭️  Products already exist (${productCount}), skipping.`);
    }

    // ──────────────── SEED ASSETS ────────────────
    const assetRepo = AppDataSource.getRepository(Asset);
    const assetCount = await assetRepo.count();

    if (assetCount === 0) {
      const assets = assetRepo.create([
        { name: 'Star', type: 'sticker', url: '/assets/stickers/star.png' },
        { name: 'Fire', type: 'sticker', url: '/assets/stickers/fire.png' },
        { name: 'Lightning', type: 'sticker', url: '/assets/stickers/lightning.png' },
        { name: 'Heart', type: 'sticker', url: '/assets/stickers/heart.png' },
        { name: 'Skull', type: 'sticker', url: '/assets/stickers/skull.png' },
        { name: 'Crown', type: 'sticker', url: '/assets/stickers/crown.png' },
        { name: 'Dragon', type: 'sticker', url: '/assets/stickers/dragon.png' },
        { name: 'Rose', type: 'sticker', url: '/assets/stickers/rose.png' },
        { name: 'Stripe Pattern', type: 'pattern', url: '/assets/patterns/stripe.png' },
        { name: 'Camo Pattern', type: 'pattern', url: '/assets/patterns/camo.png' },
        { name: 'Dot Pattern', type: 'pattern', url: '/assets/patterns/dot.png' },
        { name: 'Tie Dye Pattern', type: 'pattern', url: '/assets/patterns/tiedye.png' },
        { name: 'Paisley Pattern', type: 'pattern', url: '/assets/patterns/paisley.png' },
      ]);
      await assetRepo.save(assets);
      console.log(`✅ ${assets.length} assets seeded.`);
    } else {
      console.log(`⏭️  Assets already exist (${assetCount}), skipping.`);
    }

    console.log('\n🎉 Seed completed successfully!');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
