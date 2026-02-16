import { query } from '../config/database';

export interface Permission {
  resource: string;
  actions: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}


export class RBACService {
  
  static async hasPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    try {
      
      const userResult = await query(
        `SELECT role, entity_id FROM users WHERE id = $1 AND is_active = TRUE`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        return false;
      }

      const userRole = userResult.rows[0].role;

      
      if (userRole === 'admin' || userRole === 'super_admin') {
        return true;
      }

      
      const roleResult = await query(
        `SELECT permissions FROM roles WHERE name = $1`,
        [userRole]
      );

      if (roleResult.rows.length === 0) {
        return false;
      }

      const permissions: Permission[] = roleResult.rows[0].permissions || [];

      
      const hasPermission = permissions.some(
        (perm) =>
          perm.resource === resource &&
          (perm.actions.includes(action) || perm.actions.includes('*'))
      );

      return hasPermission;
    } catch (error) {
      console.error('Erreur vérification permission:', error);
      return false;
    }
  }

  
  static async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const userResult = await query(
        `SELECT role FROM users WHERE id = $1 AND is_active = TRUE`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        return [];
      }

      const userRole = userResult.rows[0].role;

      if (userRole === 'admin' || userRole === 'super_admin') {
        
        return this.getAllPermissions();
      }

      const roleResult = await query(
        `SELECT permissions FROM roles WHERE name = $1`,
        [userRole]
      );

      if (roleResult.rows.length === 0) {
        return [];
      }

      return roleResult.rows[0].permissions || [];
    } catch (error) {
      console.error('Erreur récupération permissions:', error);
      return [];
    }
  }

  
  static async createRole(
    name: string,
    description: string,
    permissions: Permission[]
  ): Promise<Role> {
    const result = await query(
      `INSERT INTO roles (name, description, permissions)
       VALUES ($1, $2, $3::jsonb)
       RETURNING *`,
      [name, description, JSON.stringify(permissions)]
    );

    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description,
      permissions: result.rows[0].permissions,
    };
  }

  
  static async updateRole(
    roleId: string,
    name: string,
    description: string,
    permissions: Permission[]
  ): Promise<Role> {
    const result = await query(
      `UPDATE roles 
       SET name = $1, description = $2, permissions = $3::jsonb
       WHERE id = $4
       RETURNING *`,
      [name, description, JSON.stringify(permissions), roleId]
    );

    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description,
      permissions: result.rows[0].permissions,
    };
  }

  
  static async getAllRoles(): Promise<Role[]> {
    const result = await query(`SELECT * FROM roles ORDER BY name`);
    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      permissions: row.permissions || [],
    }));
  }

  
  static getAllPermissions(): Permission[] {
    return [
      
      { resource: 'production', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { resource: 'formulas', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { resource: 'production_orders', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      
      
      { resource: 'quality', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { resource: 'quality_controls', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'non_conformities', actions: ['create', 'read', 'update', 'delete', 'resolve'] },
      
      
      { resource: 'inventory', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'stock_movements', actions: ['create', 'read', 'update'] },
      
      
      { resource: 'sales', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { resource: 'quotes', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { resource: 'orders', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { resource: 'customers', actions: ['create', 'read', 'update', 'delete'] },
      
      
      { resource: 'costs', actions: ['read', 'update'] },
      { resource: 'reports', actions: ['read', 'export'] },
      
      
      { resource: 'maintenance', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'equipment', actions: ['create', 'read', 'update', 'delete'] },
      
      
      { resource: 'deliveries', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'vehicles', actions: ['create', 'read', 'update', 'delete'] },
      
      
      { resource: 'agropole', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'sites', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'parcels', actions: ['create', 'read', 'update', 'delete'] },
      
      
      { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'roles', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'entities', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'settings', actions: ['read', 'update'] },
    ];
  }

  
  static async initializeDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        name: 'super_admin',
        description: 'Super administrateur avec tous les accès',
        permissions: this.getAllPermissions().map(p => ({
          ...p,
          actions: ['*'] 
        }))
      },
      {
        name: 'admin',
        description: 'Administrateur',
        permissions: this.getAllPermissions().map(p => ({
          ...p,
          actions: ['*']
        }))
      },
      {
        name: 'production_manager',
        description: 'Responsable de production',
        permissions: [
          { resource: 'production', actions: ['*'] },
          { resource: 'formulas', actions: ['*'] },
          { resource: 'production_orders', actions: ['*'] },
          { resource: 'quality', actions: ['read', 'update'] },
          { resource: 'inventory', actions: ['read'] },
          { resource: 'reports', actions: ['read', 'export'] },
        ]
      },
      {
        name: 'quality_controller',
        description: 'Contrôleur qualité',
        permissions: [
          { resource: 'quality', actions: ['*'] },
          { resource: 'quality_controls', actions: ['*'] },
          { resource: 'non_conformities', actions: ['*'] },
          { resource: 'production', actions: ['read'] },
          { resource: 'reports', actions: ['read', 'export'] },
        ]
      },
      {
        name: 'sales_manager',
        description: 'Responsable commercial',
        permissions: [
          { resource: 'sales', actions: ['*'] },
          { resource: 'quotes', actions: ['*'] },
          { resource: 'orders', actions: ['*'] },
          { resource: 'customers', actions: ['*'] },
          { resource: 'deliveries', actions: ['read'] },
          { resource: 'reports', actions: ['read', 'export'] },
        ]
      },
      {
        name: 'operator',
        description: 'Opérateur de production',
        permissions: [
          { resource: 'production', actions: ['read', 'update'] },
          { resource: 'production_orders', actions: ['read', 'update'] },
          { resource: 'quality_controls', actions: ['create', 'read'] },
          { resource: 'inventory', actions: ['read'] },
        ]
      },
    ];

    for (const role of defaultRoles) {
      const existing = await query(`SELECT id FROM roles WHERE name = $1`, [role.name]);
      if (existing.rows.length === 0) {
        await this.createRole(role.name, role.description, role.permissions);
      }
    }
  }
}










