import { query } from '../config/database';

export interface WorkflowStep {
  id: string;
  name: string;
  order: number;
  approver_role: string;
  is_required: boolean;
  can_reject: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  entity_type: string; 
  steps: WorkflowStep[];
  is_active: boolean;
}


export class WorkflowService {
  
  static async createWorkflow(
    name: string,
    entityType: string,
    steps: Omit<WorkflowStep, 'id'>[]
  ): Promise<Workflow> {
    const result = await query(
      `INSERT INTO workflows (name, entity_type, steps, is_active)
       VALUES ($1, $2, $3::jsonb, TRUE)
       RETURNING *`,
      [name, entityType, JSON.stringify(steps)]
    );

    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      entity_type: result.rows[0].entity_type,
      steps: result.rows[0].steps,
      is_active: result.rows[0].is_active,
    };
  }

  
  static async getWorkflowForEntity(entityType: string): Promise<Workflow | null> {
    const result = await query(
      `SELECT * FROM workflows 
       WHERE entity_type = $1 AND is_active = TRUE
       ORDER BY created_at DESC
       LIMIT 1`,
      [entityType]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      entity_type: result.rows[0].entity_type,
      steps: result.rows[0].steps || [],
      is_active: result.rows[0].is_active,
    };
  }

  
  static async submitForApproval(
    entityId: string,
    entityType: string,
    submittedBy: string
  ): Promise<string> {
    const workflow = await this.getWorkflowForEntity(entityType);

    if (!workflow || workflow.steps.length === 0) {
      
      return 'approved';
    }

    
    const validationResult = await query(
      `INSERT INTO workflow_validations 
       (entity_id, entity_type, workflow_id, current_step, status, submitted_by)
       VALUES ($1, $2, $3, $4, 'pending', $5)
       RETURNING id`,
      [
        entityId,
        entityType,
        workflow.id,
        workflow.steps[0].id,
        submittedBy,
      ]
    );

    const validationId = validationResult.rows[0].id;

    
    

    return validationId;
  }

  
  static async approveStep(
    validationId: string,
    stepId: string,
    approvedBy: string,
    comments?: string
  ): Promise<{ status: string; nextStep?: string }> {
    const validationResult = await query(
      `SELECT * FROM workflow_validations WHERE id = $1`,
      [validationId]
    );

    if (validationResult.rows.length === 0) {
      throw new Error('Validation non trouvée');
    }

    const validation = validationResult.rows[0];
    const workflow = await query(
      `SELECT * FROM workflows WHERE id = $1`,
      [validation.workflow_id]
    );

    if (workflow.rows.length === 0) {
      throw new Error('Workflow non trouvé');
    }

    const steps: WorkflowStep[] = workflow.rows[0].steps;
    const currentStepIndex = steps.findIndex((s) => s.id === stepId);

    if (currentStepIndex === -1) {
      throw new Error('Étape non trouvée');
    }

    
    await query(
      `INSERT INTO workflow_approvals 
       (validation_id, step_id, approved_by, comments, approved_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [validationId, stepId, approvedBy, comments]
    );

    
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      await query(
        `UPDATE workflow_validations 
         SET current_step = $1, updated_at = NOW()
         WHERE id = $2`,
        [nextStep.id, validationId]
      );

      
      

      return { status: 'pending', nextStep: nextStep.id };
    } else {
      
      await query(
        `UPDATE workflow_validations 
         SET status = 'approved', approved_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [validationId]
      );

      
      await this.updateEntityStatus(
        validation.entity_id,
        validation.entity_type,
        'approved'
      );

      return { status: 'approved' };
    }
  }

  
  static async rejectStep(
    validationId: string,
    stepId: string,
    rejectedBy: string,
    reason: string
  ): Promise<void> {
    await query(
      `UPDATE workflow_validations 
       SET status = 'rejected', rejected_at = NOW(), rejection_reason = $1, updated_at = NOW()
       WHERE id = $2`,
      [reason, validationId]
    );

    const validationResult = await query(
      `SELECT * FROM workflow_validations WHERE id = $1`,
      [validationId]
    );

    const validation = validationResult.rows[0];

    
    await this.updateEntityStatus(
      validation.entity_id,
      validation.entity_type,
      'rejected'
    );
  }

  
  private static async updateEntityStatus(
    entityId: string,
    entityType: string,
    status: string
  ): Promise<void> {
    let tableName = '';
    switch (entityType) {
      case 'production_order':
        tableName = 'production_orders';
        break;
      case 'quote':
        tableName = 'quotes';
        break;
      case 'quality_control':
        tableName = 'quality_controls';
        break;
      default:
        throw new Error(`Type d'entité non supporté: ${entityType}`);
    }

    await query(
      `UPDATE ${tableName} SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, entityId]
    );
  }
}










