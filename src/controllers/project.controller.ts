import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source.js';
import { Project } from '../entities/Project.js';

const projectRepo = () => AppDataSource.getRepository(Project);

export const createProject = async (req: any, res: Response) => {
  const { product_id, garment_template_id, name, preview_front, preview_back, design_data, garment_color, garment_size } = req.body;
  const user_id = req.user.id;

  try {
    const project = projectRepo().create({
      user_id, product_id, garment_template_id, name, preview_front, preview_back, design_data, garment_color, garment_size,
    });
    const saved = await projectRepo().save(project);
    res.status(201).json(saved);
  } catch (error: any) {
    console.error('createProject error:', error);
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
  const { name, preview_front, preview_back, design_data, garment_color, garment_size, garment_template_id } = req.body;
  const user_id = req.user.id;

  try {
    const project = await projectRepo().findOneBy({ id, user_id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    projectRepo().merge(project, { name, preview_front, preview_back, design_data, garment_color, garment_size, garment_template_id });
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

// ── ADMIN METHODS ───────────────────────────────────────────────────

export const getAllProjectsAdmin = async (req: Request, res: Response) => {
  try {
    const projects = await projectRepo()
      .createQueryBuilder('project')
      .select([
        'project.id', 'project.user_id', 'project.product_id', 'project.garment_template_id',
        'project.name', 'project.design_data', 'project.garment_color', 'project.garment_size',
        'project.garment_material', 'project.created_at',
      ])
      .leftJoinAndSelect('project.user', 'user')
      .leftJoinAndSelect('project.product', 'product')
      .orderBy('project.created_at', 'DESC')
      .getMany();
    res.status(200).json(projects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderedProjectsAdmin = async (req: Request, res: Response) => {
  try {
    // Projects that exist in OrderItems
    const projects = await projectRepo()
      .createQueryBuilder('project')
      .innerJoin('order_items', 'item', 'item.project_id = project.id')
      .leftJoinAndSelect('project.user', 'user')
      .leftJoinAndSelect('project.product', 'product')
      .orderBy('project.created_at', 'DESC')
      .getMany();

    res.status(200).json(projects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectByIdAdmin = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const project = await projectRepo().findOne({
      where: { id },
      relations: ['user', 'garment_template'],
    });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProjectAdmin = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { name, preview_front, preview_back, design_data, garment_color, garment_size, garment_template_id } = req.body;

  try {
    const project = await projectRepo().findOneBy({ id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    projectRepo().merge(project, { name, preview_front, preview_back, design_data, garment_color, garment_size, garment_template_id });
    const updated = await projectRepo().save(project);
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
