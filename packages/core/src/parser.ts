import type { Spec, SpecConfig, ValidationResult, ValidationError } from './types.js';

/**
 * Parse a spec from markdown content
 */
export function parseSpec(content: string, id: string, path: string): Spec {
  const lines = content.split('\n');
  
  // Extract title from first heading
  const titleMatch = lines.find(line => line.startsWith('# '));
  const title = titleMatch ? titleMatch.replace('# ', '').trim() : 'Untitled Spec';
  
  // Extract description (paragraph after title)
  let description = '';
  let inDescription = false;
  for (const line of lines) {
    if (line.startsWith('# ')) {
      inDescription = true;
      continue;
    }
    if (inDescription && line.trim()) {
      if (line.startsWith('## ')) break;
      description += line + ' ';
    }
  }
  description = description.trim();
  
  // Extract status from frontmatter or section
  const statusMatch = content.match(/status:\s*(\w+)/i);
  const status = (statusMatch?.[1] as Spec['status']) || 'draft';
  
  return {
    id,
    title,
    description,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
    path,
  };
}

/**
 * Validate a spec structure
 */
export function validateSpec(spec: Partial<Spec>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  if (!spec.id) {
    errors.push({ field: 'id', message: 'Spec ID is required', severity: 'error' });
  }
  
  if (!spec.title || spec.title.trim() === '') {
    errors.push({ field: 'title', message: 'Spec title is required', severity: 'error' });
  }
  
  if (!spec.description || spec.description.trim() === '') {
    warnings.push({ field: 'description', message: 'Spec description is recommended', severity: 'warning' });
  }
  
  const validStatuses = ['draft', 'proposed', 'approved', 'in-progress', 'completed', 'archived'];
  if (spec.status && !validStatuses.includes(spec.status)) {
    errors.push({ field: 'status', message: `Invalid status: ${spec.status}`, severity: 'error' });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Extract requirements from markdown content
 */
export function extractRequirements(content: string): string[] {
  const requirements: string[] = [];
  const lines = content.split('\n');
  let inRequirements = false;
  
  for (const line of lines) {
    if (line.match(/^##?\s*Requirements/i)) {
      inRequirements = true;
      continue;
    }
    if (inRequirements && line.match(/^##\s/)) {
      break;
    }
    if (inRequirements && line.match(/^-\s+(.+)$/)) {
      requirements.push(line.replace(/^-\s+/, '').trim());
    }
  }
  
  return requirements;
}

/**
 * Load spec configuration from file
 */
export async function loadConfig(path: string = './speccraft.json'): Promise<SpecConfig> {
  try {
    const file = Bun.file(path);
    if (await file.exists()) {
      const content = await file.text();
      const config = JSON.parse(content);
      return {
        specsDir: config.specsDir || './specs',
        defaultTemplate: config.defaultTemplate,
        git: config.git,
        ai: config.ai,
      };
    }
  } catch {
    // Config file doesn't exist or is invalid
  }
  
  return {
    specsDir: './specs',
  };
}

/**
 * Save spec configuration to file
 */
export async function saveConfig(config: SpecConfig, path: string = './speccraft.json'): Promise<void> {
  await Bun.write(path, JSON.stringify(config, null, 2));
}
