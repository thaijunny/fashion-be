import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source.js';
import { SystemSetting } from '../entities/SystemSetting.js';

const settingRepo = () => AppDataSource.getRepository(SystemSetting);

export const getAllSettings = async (req: Request, res: Response) => {
    try {
        const settings = await settingRepo().find();
        // Convert array of [{key, value}] to object { [key]: value }
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);
        res.json(settingsMap);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    const settingsData = req.body; // Expecting { key: value, key2: value2 }
    try {
        const entries = Object.entries(settingsData);
        for (const [key, value] of entries) {
            let setting = await settingRepo().findOneBy({ key });
            if (setting) {
                setting.value = String(value);
                await settingRepo().save(setting);
            } else {
                setting = settingRepo().create({ key, value: String(value) });
                await settingRepo().save(setting);
            }
        }
        const updated = await settingRepo().find();
        const settingsMap = updated.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);
        res.json(settingsMap);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
