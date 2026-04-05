import { test, expect } from "bun:test";
import { validateSpec, extractRequirements, loadConfig } from "./parser.js";
import { createSpecFromTemplate, specToMarkdown, createRequirement, createTask } from "./templates.js";
import type { Spec } from "./types.js";

test("validateSpec validates required fields", () => {
  const result = validateSpec({ id: "test-1", title: "Test Spec" });
  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
});

test("validateSpec requires id field", () => {
  const result = validateSpec({ title: "Test Spec" });
  expect(result.valid).toBe(false);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0]?.field).toBe("id");
});

test("validateSpec requires title field", () => {
  const result = validateSpec({ id: "test-1" });
  expect(result.valid).toBe(false);
  expect(result.errors.some(e => e.field === "title")).toBe(true);
});

test("validateSpec warns about missing description", () => {
  const result = validateSpec({ id: "test-1", title: "Test" });
  expect(result.warnings.length).toBeGreaterThan(0);
  expect(result.warnings[0]?.field).toBe("description");
});

test("extractRequirements finds requirements section", () => {
  const content = `# Test Spec

## Requirements

- Must have authentication
- Should support dark mode
- Could have export feature

## Design

Some design content
`;
  const reqs = extractRequirements(content);
  expect(reqs).toHaveLength(3);
  expect(reqs[0]).toBe("Must have authentication");
  expect(reqs[1]).toBe("Should support dark mode");
  expect(reqs[2]).toBe("Could have export feature");
});

test("createSpecFromTemplate creates a valid spec", () => {
  const spec = createSpecFromTemplate("feat-123", "New Feature", "Description");
  expect(spec.id).toBe("feat-123");
  expect(spec.title).toBe("New Feature");
  expect(spec.description).toBe("Description");
  expect(spec.status).toBe("draft");
  expect(spec.path).toBe("./specs/feat-123");
});

test("specToMarkdown generates markdown", () => {
  const spec: Spec = {
    id: "test",
    title: "Test Spec",
    description: "A test specification",
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
    path: "./specs/test",
    requirements: [
      { id: "r1", description: "Requirement 1", type: "functional", priority: "must" }
    ],
    tasks: [
      { id: "t1", description: "Task 1", status: "todo" }
    ]
  };
  
  const markdown = specToMarkdown(spec);
  expect(markdown).toContain("# Test Spec");
  expect(markdown).toContain("A test specification");
  expect(markdown).toContain("- Requirement 1");
  expect(markdown).toContain("- [ ] Task 1");
});

test("createRequirement creates a requirement with defaults", () => {
  const req = createRequirement("Must work offline");
  expect(req.description).toBe("Must work offline");
  expect(req.type).toBe("functional");
  expect(req.priority).toBe("must");
  expect(req.satisfied).toBe(false);
  expect(req.id).toContain("req-");
});

test("createTask creates a task", () => {
  const task = createTask("Implement feature", ["req-1"], "2h");
  expect(task.description).toBe("Implement feature");
  expect(task.status).toBe("todo");
  expect(task.requirementIds).toEqual(["req-1"]);
  expect(task.estimate).toBe("2h");
});
