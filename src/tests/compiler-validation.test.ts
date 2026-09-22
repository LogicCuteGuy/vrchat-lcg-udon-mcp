import { describe, expect, it } from 'vitest';
import type { DocsRepository } from '../repositories/docs-repository.js';
import { ValidationService } from '../services/validation-service.js';
import type { ValidationRule } from '../types/index.js';

const rules: ValidationRule[] = [
  {
    id: 'async',
    name: 'constraint:async/await',
    pattern: /\basync\b|\bawait\b/,
    severity: 'error',
    message: 'async/await not supported',
    sourcePath: 'constraints.md',
    sourceLine: 1,
    category: 'constraint',
  },
  {
    id: 'try',
    name: 'constraint:try/catch/finally/throw',
    pattern: /\btry\b|\bcatch\b/,
    severity: 'error',
    message: 'try/catch/finally not supported',
    sourcePath: 'constraints.md',
    sourceLine: 2,
    category: 'constraint',
  },
  {
    id: 'interface',
    name: 'constraint:interface',
    pattern: /\binterface\b/,
    severity: 'error',
    message: 'interface is not supported',
    sourcePath: 'constraints.md',
    sourceLine: 3,
    category: 'constraint',
  },
  {
    id: 'list',
    name: 'constraint:List<T>',
    pattern: /List<[^>]+>/,
    severity: 'error',
    message: 'List<T> is not supported',
    sourcePath: 'constraints.md',
    sourceLine: 4,
    category: 'constraint',
  },
  {
    id: 'hook-interface',
    name: 'hook:validate-udonsharp.ps1',
    pattern: /\binterface\b/,
    severity: 'error',
    message: 'Interfaces not supported. Use base class inheritance.',
    sourcePath: 'validate-udonsharp.ps1',
    sourceLine: 5,
    category: 'hook',
  },
];

const docsRepo = {
  getRules: () => rules,
} as unknown as DocsRepository;

describe('LCGUdonSharp validation profile', () => {
  it('accepts a source-defined interface without requiring a behaviour wrapper', () => {
    const validator = new ValidationService(docsRepo, 'lcgudonsharp');
    const result = validator.validate('public interface IOperation { int Apply(int value); }');

    expect(result.valid).toBe(true);
  });

  it('accepts supported async and synchronous exception syntax', () => {
    const validator = new ValidationService(docsRepo, 'lcgudonsharp');
    const code = `
using UdonSharp;
public class Test : UdonSharpBehaviour {
  public async void RunAsync() { await System.Threading.Tasks.Task.Yield(); }
  public void RunGuarded() { try { Work(); } catch (System.Exception e) { Log(e.Message); } }
}`;

    const result = validator.validate(code);
    expect(result.valid).toBe(true);
  });

  it('keeps rejecting List<T>', () => {
    const validator = new ValidationService(docsRepo, 'lcgudonsharp');
    const result = validator.validate(
      'using UdonSharp; public class Test : UdonSharpBehaviour { List<int> values; }',
    );

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes('List'))).toBe(true);
  });

  it('adds LCG-specific diagnostics for unsupported async signatures', () => {
    const validator = new ValidationService(docsRepo, 'lcgudonsharp');
    const result = validator.validate(
      'using UdonSharp; public class Test : UdonSharpBehaviour { async Task<int> Run(int value) { return value; } }',
    );

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes('must return void'))).toBe(true);
  });

  it('allows await after a completed try block but rejects await inside it', () => {
    const validator = new ValidationService(docsRepo, 'lcgudonsharp');
    const outside = validator.validate(`
using UdonSharp;
public class Test : UdonSharpBehaviour {
  async void Run() { try { Work(); } catch { Recover(); } await WorkAsync(); }
}`);
    const inside = validator.validate(`
using UdonSharp;
public class Test : UdonSharpBehaviour {
  async void Run() { try { await WorkAsync(); } catch { Recover(); } }
}`);

    expect(outside.valid).toBe(true);
    expect(inside.issues.some((issue) => issue.message.includes('await inside try'))).toBe(true);
  });

  it('preserves upstream validation behavior', () => {
    const validator = new ValidationService(docsRepo, 'upstream');
    const result = validator.validate(
      'using UdonSharp; public class Test : UdonSharpBehaviour { async void Run() { await Work(); } }',
    );

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.ruleId === 'async')).toBe(true);
  });
});
