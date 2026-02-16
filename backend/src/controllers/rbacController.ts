import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { RBACService } from '../services/rbacService';


export const getMyPermissions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const permissions = await RBACService.getUserPermissions(req.user.id);

    res.json({
      success: true,
      data: permissions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getAllRoles = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const roles = await RBACService.getAllRoles();

    res.json({
      success: true,
      data: roles,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const createRole = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, description, permissions } = req.body;

    if (!name || !permissions) {
      res.status(400).json({
        success: false,
        error: 'Nom et permissions requis',
      });
      return;
    }

    const role = await RBACService.createRole(name, description, permissions);

    res.status(201).json({
      success: true,
      data: role,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const updateRole = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const role = await RBACService.updateRole(id, name, description, permissions);

    res.json({
      success: true,
      data: role,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const initializeRoles = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    await RBACService.initializeDefaultRoles();

    res.json({
      success: true,
      message: 'Rôles initialisés avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};










