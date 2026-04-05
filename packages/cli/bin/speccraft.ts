#!/usr/bin/env bun
import { Command } from 'commander';
import {
  initProject,
  loadConfig,
  saveSpec,
  archiveSpec,
  createSpecFromTemplate,
  specToMarkdown,
  generateProposalTemplate,
  generateDesignTemplate,
  generateTasksTemplate,
  createRequirement,
  createTask,
  version as coreVersion,
} from '@speccraft/core';

const program = new Command();

program
  .name('speccraft')
  .description('Spec-driven development for AI coding assistants')
  .version('0.1.0');

// Init command
program
  .command('init')
  .description('Initialize SpecCraft in your project')
  .option('-d, --dir <directory>', 'Specs directory', './specs')
  .option('--git', 'Enable Git integration', true)
  .action(async (options) => {
    console.log('🚀 Initializing SpecCraft...');
    
    const config = {
      specsDir: options.dir,
      git: {
        enabled: options.git,
      },
    };
    
    await initProject(config);
    console.log(`✅ Created specs directory: ${options.dir}`);
    console.log('✅ Created speccraft.json config file');
    console.log('\n🎉 SpecCraft initialized! Get started with:');
    console.log('   speccraft propose <name>   - Create a new spec');
  });

// Propose command
program
  .command('propose <name>')
  .description('Create a new spec proposal')
  .option('-d, --description <desc>', 'Spec description')
  .option('-t, --template <template>', 'Template to use', 'default')
  .action(async (name, options) => {
    const config = await loadConfig();
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const description = options.description || `Proposal for ${name}`;
    
    console.log(`📝 Creating spec proposal: ${name}`);
    
    const spec = createSpecFromTemplate(id, name, description);
    await saveSpec(config, spec);
    
    console.log(`✅ Created spec at: ${config.specsDir}/${id}/spec.md`);
    console.log('\nNext steps:');
    console.log(`  1. Edit ${config.specsDir}/${id}/spec.md to add requirements`);
    console.log(`  2. Run: speccraft design ${id}  (add technical design)`);
    console.log(`  3. Run: speccraft tasks ${id}   (generate task list)`);
  });

// Design command
program
  .command('design <id>')
  .description('Add design document to a spec')
  .action(async (id) => {
    const config = await loadConfig();
    const designTemplate = generateDesignTemplate(id);
    const designPath = `${config.specsDir}/${id}/design.md`;
    
    await Bun.write(designPath, designTemplate);
    console.log(`✅ Created design document: ${designPath}`);
  });

// Tasks command
program
  .command('tasks <id>')
  .description('Generate or update tasks for a spec')
  .action(async (id) => {
    const config = await loadConfig();
    const { getSpec } = await import('@speccraft/core');
    const spec = await getSpec(config, id);
    
    if (!spec) {
      console.error(`❌ Spec not found: ${id}`);
      process.exit(1);
    }
    
    // Add some default tasks if none exist
    if (!spec.tasks || spec.tasks.length === 0) {
      spec.tasks = [
        createTask('Review spec requirements', [], '30m'),
        createTask('Implement core functionality', spec.requirements?.map((r: {id: string}) => r.id) ?? [], '2h'),
        createTask('Write tests', [], '1h'),
        createTask('Update documentation', [], '30m'),
      ];
    }
    
    const tasksContent = generateTasksTemplate(spec);
    const tasksPath = `${config.specsDir}/${id}/tasks.md`;
    
    await Bun.write(tasksPath, tasksContent);
    console.log(`✅ Created tasks file: ${tasksPath}`);
  });

// List command
program
  .command('list')
  .alias('ls')
  .description('List all specs')
  .option('-s, --status <status>', 'Filter by status')
  .action(async (options) => {
    const config = await loadConfig();
    const specsDir = config.specsDir;
    
    console.log('📋 Specs in this project:\n');
    
    try {
      const glob = new Bun.Glob(`${specsDir}/*/spec.md`);
      let count = 0;
      
      for (const file of glob.scanSync('.')) {
        const specId = file.split('/')[1];
        const content = await Bun.file(file).text();
        
        // Extract title and status
        const titleMatch = content.match(/^# (.+)$/m);
        const statusMatch = content.match(/\*\*Status:\*\* (\w+)/);
        
        const title = titleMatch?.[1] || specId;
        const status = statusMatch?.[1] || 'unknown';
        
        if (!options.status || status === options.status) {
          console.log(`  • ${title} (${specId}) - ${status}`);
          count++;
        }
      }
      
      if (count === 0) {
        console.log('  No specs found.');
        console.log(`  Run 'speccraft propose <name>' to create your first spec.`);
      }
    } catch {
      console.log('  No specs directory found.');
      console.log(`  Run 'speccraft init' first.`);
    }
  });

// Show command
program
  .command('show <id>')
  .description('Display a spec')
  .action(async (id) => {
    const config = await loadConfig();
    const { getSpec } = await import('@speccraft/core');
    const spec = await getSpec(config, id);
    
    if (!spec) {
      console.error(`❌ Spec not found: ${id}`);
      process.exit(1);
    }
    
    console.log(`\n# ${spec.title}\n`);
    console.log(`Status: ${spec.status}`);
    console.log(`\n${spec.description}\n`);
    
    if (spec.requirements && spec.requirements.length > 0) {
      console.log('Requirements:');
      spec.requirements.forEach(req => {
        console.log(`  • ${req.description}`);
      });
    }
    
    console.log('');
  });

// Archive command
program
  .command('archive <id>')
  .description('Archive a completed spec')
  .action(async (id) => {
    const config = await loadConfig();
    await archiveSpec(config, id);
    console.log(`✅ Archived spec: ${id}`);
  });

// Status command
program
  .command('status')
  .description('Show project status')
  .action(async () => {
    const config = await loadConfig();
    console.log('📊 SpecCraft Project Status\n');
    console.log(`Specs directory: ${config.specsDir}`);
    console.log(`Core version: ${coreVersion}`);
    
    // Count specs by status
    const counts = new Map<string, number>();
    
    try {
      const glob = new Bun.Glob(`${config.specsDir}/*/spec.md`);
      let total = 0;
      
      for (const file of glob.scanSync('.')) {
        const content = await Bun.file(file).text();
        const statusMatch = content.match(/\*\*Status:\*\* (\w+)/);
        const status = statusMatch?.[1] || 'unknown';
        counts.set(status, (counts.get(status) || 0) + 1);
        total++;
      }
      
      console.log(`\nTotal specs: ${total}`);
      
      if (total > 0) {
        console.log('\nBy status:');
        for (const [status, count] of counts) {
          console.log(`  ${status}: ${count}`);
        }
      }
    } catch {
      console.log('\nNo specs found.');
    }
  });

// Run the program
program.parse();
