import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source.js';
import { Asset } from '../entities/Asset.js';

const assetRepo = () => AppDataSource.getRepository(Asset);

export const getAllAssets = async (req: Request, res: Response) => {
  try {
    const assets = await assetRepo().find({ order: { created_at: 'DESC' } });
    res.status(200).json(assets);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createAsset = async (req: Request, res: Response) => {
  const { name, type, url } = req.body;
  try {
    const asset = assetRepo().create({ name, type, url });
    await assetRepo().save(asset);
    res.status(201).json(asset);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAsset = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await assetRepo().delete(id);
    if (result.affected === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.status(200).json({ message: 'Asset deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
