import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { EntityService } from '../services/entityService';


export const createEntity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, type, parent_id, address, phone, email } = req.body;

    if (!name || !type) {
      res.status(400).json({
        success: false,
        error: 'Nom et type requis',
      });
      return;
    }

    const entity = await EntityService.createEntity(
      name,
      type,
      parent_id,
      address,
      phone,
      email
    );

    res.status(201).json({
      success: true,
      data: entity,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getEntity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const entity = await EntityService.getEntityWithHierarchy(id);

    if (!entity) {
      res.status(404).json({
        success: false,
        error: 'Entité non trouvée',
      });
      return;
    }

    res.json({
      success: true,
      data: entity,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getEntityTree = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const tree = await EntityService.getEntityTree(id);

    res.json({
      success: true,
      data: tree,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getAllEntities = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { type } = req.query;

    let entities;
    if (type) {
      entities = await EntityService.getEntitiesByType(type as string);
    } else {
      entities = await EntityService.getAllEntities();
    }

    res.json({
      success: true,
      data: entities,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const updateEntity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, type, parent_id, address, phone, email } = req.body;

    const entity = await EntityService.updateEntity(
      id,
      name,
      type,
      parent_id,
      address,
      phone,
      email
    );

    res.json({
      success: true,
      data: entity,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const deleteEntity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await EntityService.deleteEntity(id);

    res.json({
      success: true,
      message: 'Entité supprimée avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};










