import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source.js';
import { Project } from '../entities/Project.js';

const projectRepo = () => AppDataSource.getRepository(Project);

export const createProject = async (req: any, res: Response) => {
  const { product_id, name, preview_front, preview_back, design_data, garment_color, garment_size } = req.body;
  const user_id = req.user.id;

  try {
    const project = projectRepo().create({
      user_id, product_id, name, preview_front, preview_back, design_data, garment_color, garment_size,
    });
    await projectRepo().save(project);
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProjects = async (req: any, res: Response) => {
  const user_id = req.user.id;

  try {
    const projects = await projectRepo().find({
      where: { user_id },
      select: ['id', 'product_id', 'name', 'preview_front', 'preview_back', 'garment_color', 'garment_size', 'created_at'],
      order: { created_at: 'DESC' },
    });
    res.status(200).json(projects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req: any, res: Response) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const project = await projectRepo().findOneBy({ id, user_id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req: any, res: Response) => {
  const { id } = req.params;
  const { name, preview_front, preview_back, design_data, garment_color, garment_size } = req.body;
  const user_id = req.user.id;

  try {
    const project = await projectRepo().findOneBy({ id, user_id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    projectRepo().merge(project, { name, preview_front, preview_back, design_data, garment_color, garment_size });
    const updated = await projectRepo().save(project);
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req: any, res: Response) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const result = await projectRepo().delete({ id, user_id });
    if (result.affected === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
