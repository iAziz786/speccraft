import type { Spec, SpecConfig, ValidationResult } from './types.js';

export type { 
  Spec, 
  SpecStatus, 
  SpecMetadata,
  Requirement, 
  Task, 
  TaskStatus,
  SpecConfig, 
  SpecChange, 
  ValidationError, 
  ValidationResult 
} from './types.js';

export { 
  parseSpec, 
  validateSpec, 
  extractRequirements, 
  loadConfig, 
  saveConfig 
} from './parser.js';

export { 
  DEFAULT_SPEC_TEMPLATE,
  createSpecFromTemplate, 
  specToMarkdown, 
  generateProposalTemplate,
  generateDesignTemplate,
  generateTasksTemplate,
  createRequirement,
  createTask,
} from './templates.js';

/**
 * SpecCraft Core Library
 * 
 * Core functionality for spec-driven development
 */
export const version = '0.1.0';

/**
 * Initialize a new spec project
 */
export async function initProject(config: SpecConfig): Promise<void> {
  // Create specs directory
  await Bun.$`mkdir -p ${config.specsDir}`;
  
  // Create config file
  await Bun.write('speccraft.json', JSON.stringify(config, null, 2));
  
  // Create .gitignore if it doesn't exist
  const gitignorePath = '.gitignore';
  const gitignoreContent = await Bun.file(gitignorePath).text().catch(() => '');
  
  if (!gitignoreContent.includes('speccraft.json')) {
    const newContent = gitignoreContent + '\n# SpecCraft local config\nspeccraft.local.json\n';
    await Bun.write(gitignorePath, newContent);
  }
}

/**
 * List all specs in the project
 */
export async function listSpecs(config: SpecConfig): Promise<Spec[]> {
  const specs: Spec[] = [];
  const specsDir = config.specsDir;
  
  try {
    const entries = await Array.fromAsync(Bun.file(specsDir).stream());
    // TODO: Implement proper directory listing
    // For now, return empty array
    console.log(entries);
  } catch {
    // Directory doesn't exist
  }
  
  return specs;
}

/**
 * Get a spec by ID
 */
export async function getSpec(config: SpecConfig, id: string): Promise<Spec | null> {
  const specPath = `${config.specsDir}/${id}/spec.md`;
  
  try {
    const file = Bun.file(specPath);
    if (await file.exists()) {
      const content = await file.text();
      const { parseSpec } = await import('./parser.js');
      return parseSpec(content, id, specPath);
    }
  } catch {
    // Spec doesn't exist
  }
  
  return null;
}

/**
 * Save a spec
 */
export async function saveSpec(config: SpecConfig, spec: Spec): Promise<void> {
  const specDir = `${config.specsDir}/${spec.id}`;
  await Bun.$`mkdir -p ${specDir}`;
  
  const { specToMarkdown } = await import('./templates.js');
  const content = specToMarkdown(spec);
  await Bun.write(`${specDir}/spec.md`, content);
}

/**
 * Archive a completed spec
 */
export async function archiveSpec(config: SpecConfig, id: string): Promise<void> {
  const specDir = `${config.specsDir}/${id}`;
  const archiveDir = `${config.specsDir}/archive/${id}`;
  
  await Bun.$`mkdir -p ${config.specsDir}/archive`;
  await Bun.$`mv ${specDir} ${archiveDir}`;
}
