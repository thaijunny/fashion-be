import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source.js';
import { User } from '../entities/User.js';

const userRepo = () => AppDataSource.getRepository(User);

// ─── ADMIN: List all users ─────────────────────────────────────────
export const getAllUsers = async (_req: Request, res: Response) => {
    try {
        const users = await userRepo().find({
            select: ['id', 'email', 'full_name', 'avatar_url', 'role', 'is_blocked', 'created_at'],
            order: { created_at: 'DESC' },
        });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── ADMIN: Toggle block/unblock user ──────────────────────────────
export const toggleBlockUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const user = await userRepo().findOneBy({ id });
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Không thể khóa tài khoản admin' });

        user.is_blocked = !user.is_blocked;
        await userRepo().save(user);
        res.json({ message: user.is_blocked ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản', is_blocked: user.is_blocked });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ─── ADMIN: Update user role ───────────────────────────────────────
export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Role không hợp lệ' });

        const user = await userRepo().findOneBy({ id });
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        user.role = role;
        await userRepo().save(user);
        res.json({ message: 'Cập nhật role thành công', role: user.role });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
