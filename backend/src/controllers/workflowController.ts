import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { WorkflowService } from '../services/workflowService';


export const createWorkflow = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, entity_type, steps } = req.body;

    if (!name || !entity_type || !steps) {
      res.status(400).json({
        success: false,
        error: 'Nom, type d\'entité et étapes requis',
      });
      return;
    }

    const workflow = await WorkflowService.createWorkflow(name, entity_type, steps);

    res.status(201).json({
      success: true,
      data: workflow,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getWorkflow = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { entityType } = req.params;

    const workflow = await WorkflowService.getWorkflowForEntity(entityType);

    if (!workflow) {
      res.status(404).json({
        success: false,
        error: 'Workflow non trouvé',
      });
      return;
    }

    res.json({
      success: true,
      data: workflow,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const submitForApproval = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { entityId, entityType } = req.body;

    if (!entityId || !entityType) {
      res.status(400).json({
        success: false,
        error: 'ID et type d\'entité requis',
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const validationId = await WorkflowService.submitForApproval(
      entityId,
      entityType,
      req.user.id
    );

    res.json({
      success: true,
      data: { validation_id: validationId },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const approveStep = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { validationId, stepId } = req.params;
    const { comments } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    const result = await WorkflowService.approveStep(
      validationId,
      stepId,
      req.user.id,
      comments
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const rejectStep = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { validationId, stepId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({
        success: false,
        error: 'Raison du rejet requise',
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    await WorkflowService.rejectStep(validationId, stepId, req.user.id, reason);

    res.json({
      success: true,
      message: 'Étape rejetée avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};










