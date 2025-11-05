const { prisma } = require('../config/database');

const getCart = async (userId) => {
  const carts = await prisma.cart.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          category: true,
          artist: true,
        }
      },
      items: {
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Calculate totals
  let subtotal = 0;
  const formattedItems = [];

  carts.forEach(cart => {
    cart.items.forEach(item => {
      const itemPrice = cart.product.price * item.quantity;
      subtotal += itemPrice;

      formattedItems.push({
        id: item.id,
        cartId: cart.id,
        productId: cart.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        product: {
          id: cart.product.id,
          name: cart.product.name,
          nameEn: cart.product.nameEn,
          price: cart.product.price,
          images: cart.product.images,
          category: cart.product.category,
          artist: cart.product.artist,
        },
        variant: {
          id: item.variant.id,
          size: item.variant.size,
          color: item.variant.color,
          stock: item.variant.stock,
        }
      });
    });
  });

  return {
    items: formattedItems,
    subtotal,
    total: subtotal,
    count: formattedItems.length
  };
};

const addToCart = async (userId, productId, variantId, quantity = 1) => {
  console.log('🛒 Cart service addToCart:', { userId, productId, variantId, quantity });
  
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      artist: true,
    }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // variantId가 제공되지 않았거나, variant가 없는 경우 처리
  let variant = null;
  if (variantId) {
    variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true }
    });

    if (!variant) {
      console.warn(`⚠️ Variant ${variantId} not found, will create default variant`);
    } else if (variant.product.id !== productId) {
      throw new Error('Variant does not belong to this product');
    } else if (variant.stock < quantity) {
      throw new Error('Insufficient stock');
    }
  }
  
  // Variant가 없으면 기본 variant 생성 또는 첫 번째 variant 사용
  if (!variant) {
    // 상품의 첫 번째 variant를 찾거나 생성
    const existingVariants = await prisma.productVariant.findMany({
      where: { productId },
      take: 1
    });
    
    if (existingVariants.length > 0) {
      variant = existingVariants[0];
      console.log(`✅ Using first variant: ${variant.id}`);
    } else {
      // 기본 variant 생성
      console.log(`⚠️ No variants found, creating default variant for product ${productId}`);
      variant = await prisma.productVariant.create({
        data: {
          productId,
          size: 'M',
          color: 'Black',
          stock: 100, // 기본 재고
        }
      });
      console.log(`✅ Created default variant: ${variant.id}`);
    }
    
    // variantId 업데이트
    variantId = variant.id;
  }

  // Find or create cart for this user-product combination
  let cart = await prisma.cart.findFirst({
    where: { 
      userId, 
      productId 
    },
    include: { 
      items: {
        include: {
          variant: true
        }
      }
    }
  });

  if (!cart) {
    console.log('✅ Creating new cart');
    cart = await prisma.cart.create({
      data: {
        userId,
        productId
      },
      include: { 
        items: {
          include: {
            variant: true
          }
        }
      }
    });
  }

  // Check if cart item already exists with same variant
  const existingItem = cart.items.find(item => item.variantId === variantId);

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity;
    if (variant.stock < newQuantity) {
      throw new Error('Insufficient stock');
    }
    
    console.log('✅ Updating existing cart item quantity');
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: newQuantity
      }
    });
  } else {
    // Create new cart item
    console.log('✅ Creating new cart item');
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId,
        quantity
      }
    });
  }

  return getCart(userId);
};

const updateCartItem = async (userId, cartItemId, quantity) => {
  if (quantity <= 0) {
    await removeCartItem(userId, cartItemId);
    return getCart(userId);
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { 
      cart: true, 
      variant: true 
    }
  });

  if (!cartItem) {
    throw new Error('Cart item not found');
  }

  if (cartItem.cart.userId !== userId) {
    throw new Error('Unauthorized');
  }

  if (cartItem.variant.stock < quantity) {
    throw new Error('Insufficient stock');
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity }
  });

  return getCart(userId);
};

const removeCartItem = async (userId, cartItemId) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true }
  });

  if (!cartItem) {
    throw new Error('Cart item not found');
  }

  if (cartItem.cart.userId !== userId) {
    throw new Error('Unauthorized');
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId }
  });

  // Check if this was the last item in the cart
  const remainingItems = await prisma.cartItem.count({
    where: { cartId: cartItem.cart.id }
  });

  if (remainingItems === 0) {
    await prisma.cart.delete({
      where: { id: cartItem.cart.id }
    });
  }

  return getCart(userId);
};

const clearCart = async (userId) => {
  await prisma.cart.deleteMany({
    where: { userId }
  });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};

