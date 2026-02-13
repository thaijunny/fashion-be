import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source.js';
import { Order } from '../entities/Order.js';
import { OrderItem } from '../entities/OrderItem.js';
import { CartItem } from '../entities/CartItem.js';

const orderRepo = () => AppDataSource.getRepository(Order);
const orderItemRepo = () => AppDataSource.getRepository(OrderItem);
const cartRepo = () => AppDataSource.getRepository(CartItem);

export const getAllOrders = async (req: any, res: Response) => {
  try {
    const orders = await orderRepo().find({
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
    res.json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: any, res: Response) => {
  const { id } = req.params;
  const { status: newStatus } = req.body;

  try {
    const order = await orderRepo().findOneBy({ id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const currentStatus = order.status;

    // 1. Logic for moving from processing back to pending
    if (currentStatus === 'processing' && newStatus === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Không thể chuyển đơn hàng đang xử lý về trạng thái chờ xác nhận'
      });
    }

    // 2. Logic for terminal states
    if (['delivered', 'cancelled'].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã hoàn thành hoặc đã hủy, không thể thay đổi trạng thái'
      });
    }

    // 3. Prevent logic flow going backwards generally for higher statuses
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = statusOrder.indexOf(newStatus);

    if (newIndex !== -1 && currentIndex !== -1 && newIndex < currentIndex) {
      return res.status(400).json({
        success: false,
        message: 'Không thể quay lại trạng thái trước đó'
      });
    }

    order.status = newStatus;
    await orderRepo().save(order);

    res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrder = async (req: any, res: Response) => {
  const user_id = req.user.id;
  const { total_amount, shipping_address, full_name, phone_number, payment_method } = req.body;

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Get cart items with product details and junction attributes
    const cartItems = await cartRepo().find({
      where: { user_id },
      relations: [
        'product',
        'product.productSizes',
        'product.productSizes.size',
        'product.productColors',
        'product.productColors.color',
        'product.productMaterials',
        'product.productMaterials.material'
      ],
    });

    if (cartItems.length === 0) {
      throw new Error('Giỏ hàng của bạn đang trống');
    }

    // 2. Create order
    const order = orderRepo().create({
      user_id,
      total_amount,
      shipping_address,
      full_name,
      phone_number,
      payment_method: payment_method || 'cod',
      status: 'pending',
    });
    const savedOrder = await queryRunner.manager.save(order);

    // 3. Create order items
    for (const item of cartItems) {
      if (!item.product) continue;

      let unitPrice = Number(item.product.price);

      // Calculate adjusted unit price
      if (item.size) {
        const sizeAdj = item.product.productSizes?.find(ps => ps.size?.name === item.size);
        if (sizeAdj) unitPrice += Number(sizeAdj.price_adjustment);
      }
      if (item.color) {
        const colorAdj = item.product.productColors?.find(pc => pc.color?.hex_code === item.color);
        if (colorAdj) unitPrice += Number(colorAdj.price_adjustment);
      }
      if (item.material) {
        const matAdj = item.product.productMaterials?.find(pm => pm.material?.name === item.material);
        if (matAdj) unitPrice += Number(matAdj.price_adjustment);
      }

      const orderItem = orderItemRepo().create({
        order_id: savedOrder.id,
        project_id: item.project_id,
        product_id: item.product_id,
        size: item.size,
        color: item.color,
        material: item.material,
        quantity: item.quantity,
        unit_price: unitPrice,
      });
      await queryRunner.manager.save(orderItem);
    }

    // 4. Clear cart - ensure it's deleted within transaction
    await queryRunner.manager.delete(CartItem, { user_id });

    await queryRunner.commitTransaction();
    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      order_id: savedOrder.id
    });
  } catch (error: any) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    res.status(400).json({ success: false, message: error.message });
  } finally {
    await queryRunner.release();
  }
};

export const getUserOrders = async (req: any, res: Response) => {
  const user_id = req.user.id;
  try {
    const orders = await orderRepo().find({
      where: { user_id },
      order: { created_at: 'DESC' },
    });
    res.json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: any, res: Response) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const role = req.user.role;

  try {
    const order = await orderRepo().findOne({
      where: role === 'admin' ? { id } : { id, user_id },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
