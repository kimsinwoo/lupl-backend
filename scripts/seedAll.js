const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.portfolioCategory.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.category.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('admin123456', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@lupl.kr',
      password: hashedPassword,
      name: 'Admin',
      phone: '010-0000-0000',
      role: 'admin',
    },
  });

  const userPassword = await bcrypt.hash('user123456', 10);
  const testUser = await prisma.user.create({
    data: {
      email: 'user@lupl.kr',
      password: userPassword,
      name: 'Test User',
      phone: '010-1234-5678',
      role: 'user',
    },
  });

  console.log(`✅ Created ${2} users`);

  // 3. Create Categories
  console.log('📁 Creating categories...');
  const categories = [
    { name: '상의', slug: 'tops', description: 'Shirts, T-shirts, and tops' },
    { name: '하의', slug: 'bottoms', description: 'Pants, skirts, and bottoms' },
    { name: '아우터', slug: 'outerwear', description: 'Coats, jackets, and outerwear' },
    { name: '악세서리', slug: 'accessories', description: 'Bags, hats, and accessories' },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const category = await prisma.category.create({ data: cat });
    createdCategories.push(category);
  }
  console.log(`✅ Created ${createdCategories.length} categories`);

  // 4. Create Artists
  console.log('🎨 Creating artists...');
  const artists = [
    {
      name: '김아트',
      nameEn: 'Kim Art',
      bio: '한국 현대 미술의 선구자로서 다양한 매체를 통해 포용적 예술을 추구합니다.',
      bioEn: 'A pioneer of Korean contemporary art, pursuing inclusive art through various media.',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      portfolio: [],
      exhibitions: [
        { year: '2023', title: 'Modern Art Exhibition', location: 'Seoul' },
        { year: '2022', title: 'Inclusive Fashion Show', location: 'Busan' },
      ],
    },
    {
      name: '이디자인',
      nameEn: 'Lee Design',
      bio: '패션과 예술의 경계를 허무는 창의적인 작품 활동을 하고 있습니다.',
      bioEn: 'Creative works that blur the boundaries between fashion and art.',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      portfolio: [],
      exhibitions: [
        { year: '2024', title: 'Fashion Art Festival', location: 'Seoul' },
      ],
    },
    {
      name: '박크리에이티브',
      nameEn: 'Park Creative',
      bio: '미디어 아트와 전통 예술을 결합한 독특한 작품으로 유명합니다.',
      bioEn: 'Known for unique works that combine media art and traditional art.',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      portfolio: [],
      exhibitions: [],
    },
  ];

  const createdArtists = [];
  for (const artist of artists) {
    const created = await prisma.artist.create({
      data: {
        ...artist,
        portfolio: JSON.stringify(artist.portfolio),
        exhibitions: JSON.stringify(artist.exhibitions),
      },
    });
    createdArtists.push(created);
  }
  console.log(`✅ Created ${createdArtists.length} artists`);

  // 5. Create Products
  console.log('🛍️  Creating products...');
  const products = [
    {
      name: 'Minimalist Black Blazer',
      nameEn: 'Minimalist Black Blazer',
      description: 'Tailored blazer with clean lines and minimal detailing. Perfect for layering.',
      price: 289,
      sku: 'BLZ-001',
      slug: 'minimalist-black-blazer',
      status: 'active',
      images: ['https://images.unsplash.com/photo-1629922949137-e236a5ab497d?w=800'],
      categorySlug: 'outerwear',
      artistId: createdArtists[0].id,
      variants: [
        { size: 'S', color: 'Black', stock: 15 },
        { size: 'M', color: 'Black', stock: 20 },
        { size: 'L', color: 'Black', stock: 15 },
        { size: 'S', color: 'Cream', stock: 12 },
        { size: 'M', color: 'Cream', stock: 18 },
        { size: 'L', color: 'Cream', stock: 12 },
      ],
    },
    {
      name: 'Editorial Coat',
      nameEn: 'Editorial Coat',
      description: 'Oversized coat with dramatic silhouette. Statement piece for any wardrobe.',
      price: 445,
      sku: 'COT-002',
      slug: 'editorial-coat',
      status: 'active',
      images: ['https://images.unsplash.com/photo-1611702817465-8dedb5de2103?w=800'],
      categorySlug: 'outerwear',
      artistId: createdArtists[1].id,
      variants: [
        { size: 'S', color: 'Black', stock: 10 },
        { size: 'M', color: 'Black', stock: 15 },
        { size: 'L', color: 'Black', stock: 10 },
      ],
    },
    {
      name: 'Modern Art T-Shirt',
      nameEn: 'Modern Art T-Shirt',
      description: 'Limited edition t-shirt featuring exclusive artwork from our artists.',
      price: 89,
      sku: 'TSH-003',
      slug: 'modern-art-t-shirt',
      status: 'active',
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
      categorySlug: 'tops',
      artistId: createdArtists[0].id,
      variants: [
        { size: 'S', color: 'White', stock: 25 },
        { size: 'M', color: 'White', stock: 30 },
        { size: 'L', color: 'White', stock: 25 },
        { size: 'XL', color: 'White', stock: 20 },
      ],
    },
    {
      name: 'Designer Accessory Bag',
      nameEn: 'Designer Accessory Bag',
      description: 'Handcrafted bag featuring unique design elements.',
      price: 199,
      sku: 'BAG-004',
      slug: 'designer-accessory-bag',
      status: 'active',
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
      categorySlug: 'accessories',
      artistId: createdArtists[2].id,
      variants: [
        { size: 'One Size', color: 'Black', stock: 15 },
        { size: 'One Size', color: 'Brown', stock: 12 },
      ],
    },
    {
      name: 'Artistic Denim Jeans',
      nameEn: 'Artistic Denim Jeans',
      description: 'Premium denim jeans with artistic detailing.',
      price: 159,
      sku: 'JEA-005',
      slug: 'artistic-denim-jeans',
      status: 'active',
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'],
      categorySlug: 'bottoms',
      artistId: createdArtists[1].id,
      variants: [
        { size: '28', color: 'Blue', stock: 20 },
        { size: '30', color: 'Blue', stock: 25 },
        { size: '32', color: 'Blue', stock: 20 },
      ],
    },
  ];

  const createdProducts = [];
  for (const product of products) {
    const category = createdCategories.find(c => c.slug === product.categorySlug);
    const { categorySlug, variants, ...productData } = product;
    
    const created = await prisma.product.create({
      data: {
        ...productData,
        images: JSON.stringify(product.images),
        categoryId: category?.id,
      },
    });

    // Create variants
    for (const variant of variants) {
      await prisma.productVariant.create({
        data: {
          ...variant,
          productId: created.id,
        },
      });
    }

    createdProducts.push(created);
  }
  console.log(`✅ Created ${createdProducts.length} products with variants`);

  // 6. Create Portfolio Categories
  console.log('📂 Creating portfolio categories...');
  const portfolioCategories = [
    { name: '미디어 아트', slug: 'media-art', description: 'Media art projects' },
    { name: '전시', slug: 'exhibition', description: 'Exhibition works' },
    { name: '패션', slug: 'fashion', description: 'Fashion projects' },
    { name: '콘테스트', slug: 'contest', description: 'Art contests' },
    { name: '점자', slug: 'braille', description: 'Braille art projects' },
  ];

  const createdPortfolioCategories = [];
  for (const cat of portfolioCategories) {
    const category = await prisma.portfolioCategory.create({ data: cat });
    createdPortfolioCategories.push(category);
  }
  console.log(`✅ Created ${createdPortfolioCategories.length} portfolio categories`);

  // 7. Create Portfolio Items
  console.log('🎨 Creating portfolio items...');
  const portfolioItems = [
    {
      title: 'Inclusive Art for Everyone',
      description: 'A groundbreaking project that combines art and accessibility.',
      year: 2024,
      images: ['https://images.unsplash.com/photo-1681235014294-588fea095706?w=1200'],
      featured: true,
      categorySlug: 'media-art',
    },
    {
      title: 'Fashion Art Exhibition 2023',
      description: 'An exhibition showcasing the intersection of fashion and art.',
      year: 2023,
      images: ['https://images.unsplash.com/photo-1611702817465-8dedb5de2103?w=1200'],
      featured: true,
      categorySlug: 'exhibition',
    },
    {
      title: 'Accessible Design Project',
      description: 'Creating fashion that is accessible to everyone.',
      year: 2023,
      images: ['https://images.unsplash.com/photo-1629922949137-e236a5ab497d?w=1200'],
      featured: false,
      categorySlug: 'fashion',
    },
    {
      title: 'Art Contest Winners',
      description: 'Showcasing the winners of our annual art contest.',
      year: 2024,
      images: ['https://images.unsplash.com/photo-1645997098653-ed4519760b10?w=1200'],
      featured: false,
      categorySlug: 'contest',
    },
    {
      title: 'Braille Art Collection',
      description: 'Beautiful art accessible through braille.',
      year: 2024,
      images: ['https://images.unsplash.com/photo-1715541448446-3369e1cc0ee9?w=1200'],
      featured: true,
      categorySlug: 'braille',
    },
  ];

  for (const item of portfolioItems) {
    const category = createdPortfolioCategories.find(c => c.slug === item.categorySlug);
    const { categorySlug, ...itemData } = item;
    
    await prisma.portfolioItem.create({
      data: {
        ...itemData,
        images: JSON.stringify(item.images),
        categoryId: category.id,
      },
    });
  }
  console.log(`✅ Created ${portfolioItems.length} portfolio items`);

  // 8. Create Reviews
  console.log('⭐ Creating reviews...');
  const reviews = [
    {
      userId: testUser.id,
      productId: createdProducts[0].id,
      rating: 5,
      comment: 'Amazing quality and design!',
    },
    {
      userId: testUser.id,
      productId: createdProducts[1].id,
      rating: 4,
      comment: 'Love the style, very comfortable.',
    },
  ];

  for (const review of reviews) {
    await prisma.review.create({ data: review });
  }
  console.log(`✅ Created ${reviews.length} reviews`);

  // 9. Create Orders
  console.log('📦 Creating orders...');
  const order1 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}-001`,
      status: 'pending',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      userId: testUser.id,
      shippingName: 'Test User',
      shippingPhone: '010-1234-5678',
      shippingAddress1: '123 Test Street',
      shippingCity: 'Seoul',
      shippingZip: '12345',
      shippingCountry: 'KR',
      subtotal: 289,
      shipping: 15,
      tax: 30.45,
      total: 334.45,
    },
  });

  // Create order items
  const variant1 = await prisma.productVariant.findFirst({
    where: { productId: createdProducts[0].id },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: createdProducts[0].id,
      variantId: variant1?.id,
      quantity: 1,
      price: 289,
    },
  });

  console.log(`✅ Created ${1} order with items`);

  // 10. Create Announcements
  console.log('📢 Creating announcements...');
  const announcements = [
    {
      title: 'Welcome to Lupl Art Agency',
      content: 'We are excited to launch our new platform for inclusive art and fashion.',
      type: 'notice',
      featured: true,
    },
    {
      title: 'New Artist Collection',
      content: 'Check out our latest collection from featured artists.',
      type: 'update',
      featured: false,
    },
  ];

  for (const announcement of announcements) {
    await prisma.announcement.create({ data: announcement });
  }
  console.log(`✅ Created ${announcements.length} announcements`);

  // 11. Create Partners
  console.log('🤝 Creating partners...');
  const partners = [
    {
      name: 'Art Foundation',
      logo: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200',
      link: 'https://example.com',
      description: 'Leading art foundation supporting inclusive art projects.',
    },
    {
      name: 'Fashion Institute',
      logo: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
      link: 'https://example.com',
      description: 'Premier fashion institute promoting accessible design.',
    },
  ];

  for (const partner of partners) {
    await prisma.partner.create({ data: partner });
  }
  console.log(`✅ Created ${partners.length} partners`);

  // 12. Create Contacts
  console.log('📧 Creating contacts...');
  const contacts = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '010-1111-2222',
      subject: 'Inquiry about products',
      message: 'I would like to know more about your products.',
      status: 'pending',
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      subject: 'Partnership opportunity',
      message: 'We are interested in partnering with your agency.',
      status: 'pending',
    },
  ];

  for (const contact of contacts) {
    await prisma.contact.create({ data: contact });
  }
  console.log(`✅ Created ${contacts.length} contacts`);

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${2}`);
  console.log(`   - Categories: ${createdCategories.length}`);
  console.log(`   - Artists: ${createdArtists.length}`);
  console.log(`   - Products: ${createdProducts.length}`);
  console.log(`   - Portfolio Categories: ${createdPortfolioCategories.length}`);
  console.log(`   - Portfolio Items: ${portfolioItems.length}`);
  console.log(`   - Reviews: ${reviews.length}`);
  console.log(`   - Orders: ${1}`);
  console.log(`   - Announcements: ${announcements.length}`);
  console.log(`   - Partners: ${partners.length}`);
  console.log(`   - Contacts: ${contacts.length}`);
  console.log('\n🔑 Login Credentials:');
  console.log('   Admin: admin@lupl.kr / admin123456');
  console.log('   User: user@lupl.kr / user123456');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

