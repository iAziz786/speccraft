/**
 * Core types for SpecVibe spec-driven development
 */

export interface Spec {
  /** Unique identifier for the spec */
  id: string;
  /** Human-readable title */
  title: string;
  /** Spec description/goal */
  description: string;
  /** Current status of the spec */
  status: SpecStatus;
  /** When the spec was created */
  createdAt: Date;
  /** When the spec was last updated */
  updatedAt: Date;
  /** Path to the spec directory */
  path: string;
  /** Spec metadata */
  metadata?: SpecMetadata;
  /** Requirements */
  requirements?: Requirement[];
  /** Implementation tasks */
  tasks?: Task[];
}

export type SpecStatus = 
  | 'draft' 
  | 'proposed' 
  | 'approved' 
  | 'in-progress' 
  | 'completed' 
  | 'archived';

export interface SpecMetadata {
  /** Who proposed the spec */
  author?: string;
  /** Related issues/PRs */
  references?: string[];
  /** Labels/tags */
  tags?: string[];
  /** Priority level */
  priority?: 'low' | 'medium' | 'high' | 'critical';
  /** Estimated effort */
  estimate?: string;
  /** Additional notes */
  notes?: string;
}

export interface Requirement {
  /** Requirement ID */
  id: string;
  /** Requirement description */
  description: string;
  /** Requirement type */
  type: 'functional' | 'non-functional' | 'constraint';
  /** Whether this is a must-have or nice-to-have */
  priority: 'must' | 'should' | 'could';
  /** Acceptance criteria */
  acceptanceCriteria?: string[];
  /** Is this requirement satisfied */
  satisfied?: boolean;
}

export interface Task {
  /** Task ID */
  id: string;
  /** Task description */
  description: string;
  /** Task status */
  status: TaskStatus;
  /** Related requirement IDs */
  requirementIds?: string[];
  /** Sub-tasks */
  subtasks?: Task[];
  /** Estimated time */
  estimate?: string;
}

export type TaskStatus = 
  | 'todo' 
  | 'in-progress' 
  | 'blocked' 
  | 'review' 
  | 'done';

export interface SpecConfig {
  /** Directory where specs are stored */
  specsDir: string;
  /** Default spec template */
  defaultTemplate?: string;
  /** Git integration settings */
  git?: {
    /** Enable git integration */
    enabled: boolean;
    /** Auto-create branches */
    autoBranch?: boolean;
  };
  /** AI integration settings */
  ai?: {
    /** AI model preference */
    model?: string;
    /** Custom system prompt */
    systemPrompt?: string;
  };
}

export interface SpecChange {
  /** Change type */
  type: 'create' | 'update' | 'delete';
  /** Spec ID */
  specId: string;
  /** What changed */
  changes: string[];
  /** Timestamp */
  timestamp: Date;
}

export interface ValidationError {
  /** Field with error */
  field: string;
  /** Error message */
  message: string;
  /** Error severity */
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  /** Is the spec valid */
  valid: boolean;
  /** Validation errors */
  errors: ValidationError[];
  /** Warnings */
  warnings: ValidationError[];
}
