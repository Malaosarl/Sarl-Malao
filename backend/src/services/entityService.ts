import { query } from '../config/database';

export interface Entity {
  id: string;
  name: string;
  type: string;
  parent_id?: string;
  address?: string;
  phone?: string;
  email?: string;
  children?: Entity[];
}


export class EntityService {
  
  static async createEntity(
    name: string,
    type: string,
    parentId?: string,
    address?: string,
    phone?: string,
    email?: string
  ): Promise<Entity> {
    const result = await query(
      `INSERT INTO entities (name, type, parent_id, address, phone, email)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, type, parentId || null, address, phone, email]
    );

    return this.mapEntity(result.rows[0]);
  }

  
  static async getEntityWithHierarchy(entityId: string): Promise<Entity | null> {
    const result = await query(
      `SELECT * FROM entities WHERE id = $1`,
      [entityId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const entity = this.mapEntity(result.rows[0]);

    
    entity.children = await this.getChildren(entityId);

    
    
    
    
    

    return entity;
  }

  
  static async getChildren(parentId: string): Promise<Entity[]> {
    const result = await query(
      `SELECT * FROM entities WHERE parent_id = $1 ORDER BY name`,
      [parentId]
    );

    return result.rows.map((row) => this.mapEntity(row));
  }

  
  static async getEntitiesByType(type: string): Promise<Entity[]> {
    const result = await query(
      `SELECT * FROM entities WHERE type = $1 ORDER BY name`,
      [type]
    );

    return result.rows.map((row) => this.mapEntity(row));
  }

  
  static async getEntityTree(entityId: string): Promise<Entity> {
    const entity = await this.getEntityWithHierarchy(entityId);
    if (!entity) {
      throw new Error('Entité non trouvée');
    }

    
    if (entity.children && entity.children.length > 0) {
      for (const child of entity.children) {
        child.children = await this.getChildren(child.id);
        if (child.children && child.children.length > 0) {
          for (const grandChild of child.children) {
            grandChild.children = await this.getChildren(grandChild.id);
          }
        }
      }
    }

    return entity;
  }

  
  static async updateEntity(
    entityId: string,
    name?: string,
    type?: string,
    parentId?: string,
    address?: string,
    phone?: string,
    email?: string
  ): Promise<Entity> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (name) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (type) {
      updates.push(`type = $${paramIndex++}`);
      params.push(type);
    }
    if (parentId !== undefined) {
      updates.push(`parent_id = $${paramIndex++}`);
      params.push(parentId || null);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      params.push(address);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      params.push(phone);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(email);
    }

    updates.push(`updated_at = NOW()`);
    params.push(entityId);

    const result = await query(
      `UPDATE entities 
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      params
    );

    return this.mapEntity(result.rows[0]);
  }

  
  static async deleteEntity(entityId: string): Promise<void> {
    
    const children = await this.getChildren(entityId);
    if (children.length > 0) {
      throw new Error('Impossible de supprimer une entité avec des enfants');
    }

    await query(`DELETE FROM entities WHERE id = $1`, [entityId]);
  }

  
  static async getAllEntities(): Promise<Entity[]> {
    const result = await query(
      `SELECT * FROM entities ORDER BY type, name`
    );

    return result.rows.map((row) => this.mapEntity(row));
  }

  
  private static mapEntity(row: any): Entity {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      parent_id: row.parent_id,
      address: row.address,
      phone: row.phone,
      email: row.email,
    };
  }
}





