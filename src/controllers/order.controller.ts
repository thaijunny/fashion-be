import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source.js';
import { Order } from '../entities/Order.js';
import { OrderItem } from '../entities/OrderItem.js';
import { CartItem } from '../entities/CartItem.js';

const orderRepo = () => AppDataSource.getRepository(Order);
const orderItemRepo = () => AppDataSource.getRepository(OrderItem);
const cartRepo = () => AppDataSource.getRepository(CartItem);

export const createOrder = async (req: any, res: Response) => {
  const { shipping_address, full_name, phone_number, payment_method, total_amount } = req.body;
  const user_id = req.user.id;

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Get cart items with product details
    const cartItems = await cartRepo().find({
      where: { user_id },
      relations: ['product'],
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
      const orderItem = orderItemRepo().create({
        order_id: savedOrder.id,
        project_id: item.project_id,
        quantity: item.quantity,
        unit_price: item.product?.price || 0,
      });
      await queryRunner.manager.save(orderItem);
    }

    // 4. Clear cart
    await queryRunner.manager.delete(CartItem, { user_id });

    await queryRunner.commitTransaction();
    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      order_id: savedOrder.id
    });
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
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
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req: any, res: Response) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const order = await orderRepo().findOne({
      where: { id, user_id },
      relations: ['items'],
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
