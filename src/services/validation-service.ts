import type { DocsRepository } from '../repositories/docs-repository.js';
import type {
  CompilerProfile,
  ValidationIssue,
  ValidationResult,
  ValidationRule,
} from '../types/index.js';

/**
 * Validates UdonSharp code using rules parsed from the repository.
 */
export class ValidationService {
  constructor(
    private readonly docsRepo: DocsRepository,
    private readonly compilerProfile: CompilerProfile = 'upstream',
  ) {}

  validate(
    code: string,
    _sdkVersion?: string,
    compilerProfile: CompilerProfile = this.compilerProfile,
  ): ValidationResult {
    const rules = this.docsRepo.getRules();
    const issues: ValidationIssue[] = [];
    const lines = code.split('\n');
    const isLcgInterfaceOnly =
      compilerProfile === 'lcgudonsharp' &&
      /\binterface\s+\w+/.test(code) &&
      !/\bclass\s+\w+/.test(code);

    if (!isLcgInterfaceOnly && !/using\s+UdonSharp/.test(code)) {
      issues.push(
        this.structuralIssue(
          'Missing UdonSharp using directive',
          'Add: using UdonSharp;',
          'code-quality',
          'skills/unity-vrc-udon-sharp/rules/udonsharp-constraints.md',
          52,
        ),
      );
    }

    if (!isLcgInterfaceOnly && !/UdonSharpBehaviour/.test(code)) {
      issues.push(
        this.structuralIssue(
          'Class must inherit from UdonSharpBehaviour',
          'Change base class to UdonSharpBehaviour',
          'code-quality',
          'skills/unity-vrc-udon-sharp/rules/udonsharp-constraints.md',
          50,
        ),
      );
    }

    if (!/\[UdonBehaviourSyncMode/.test(code) && /\[UdonSynced\]/.test(code)) {
      issues.push({
        severity: 'warning',
        message: 'Synced variables without UdonBehaviourSyncMode attribute',
        rule: 'sync-mode',
        ruleId: 'sync-mode-missing',
        suggestion: 'Add [UdonBehaviourSyncMode(BehaviourSyncMode.Manual)] or appropriate mode',
        sourcePath: 'skills/unity-vrc-udon-sharp/rules/udonsharp-networking.md',
        sourceLine: 1,
      });
    }

    for (const rule of rules) {
      if (compilerProfile === 'lcgudonsharp' && this.isSupportedByLcgCompiler(rule, code)) {
        continue;
      }

      if (rule.pattern.global) {
        const globalPattern = new RegExp(rule.pattern.source, rule.pattern.flags);
        let match: RegExpExecArray | null;
        while ((match = globalPattern.exec(code)) !== null) {
          const line = code.slice(0, match.index).split('\n').length;
          issues.push(this.ruleToIssue(rule, line, lines[line - 1]?.trim()));
        }
      } else {
        lines.forEach((line, index) => {
          if (rule.pattern.test(line)) {
            issues.push(this.ruleToIssue(rule, index + 1, line.trim()));
          }
        });
      }
    }

    if (compilerProfile === 'lcgudonsharp') {
      this.addLcgDiagnostics(code, issues);
    }

    const deduped = this.deduplicateIssues(issues);
    const errors = deduped.filter((i) => i.severity === 'error').length;
    const warnings = deduped.filter((i) => i.severity === 'warning').length;
    const suggestions = deduped.filter(
      (i) => i.severity === 'suggestion' || i.severity === 'info',
    ).length;

    return {
      valid: errors === 0,
      issues: deduped,
      summary: { errors, warnings, suggestions },
    };
  }

  explainValidation(ruleId: string): {
    rule: ValidationRule | null;
    documentation: string | null;
  } {
    if (ruleId.startsWith('lcgudonsharp-')) {
      return { rule: null, documentation: null };
    }

    const rule = this.docsRepo.getRules().find((r) => r.id === ruleId || r.name === ruleId);
    const sourcePath = rule?.sourcePath ?? this.structuralRulePaths[ruleId];
    if (!sourcePath) return { rule: rule ?? null, documentation: null };

    const doc = this.docsRepo.getByPath(sourcePath);
    return {
      rule: rule ?? null,
      documentation: doc?.content ?? this.docsRepo.readFileContent(sourcePath),
    };
  }

  private readonly structuralRulePaths: Record<string, string> = {
    'code-quality': 'skills/unity-vrc-udon-sharp/rules/udonsharp-constraints.md',
    'sync-mode-missing': 'skills/unity-vrc-udon-sharp/rules/udonsharp-networking.md',
  };

  private isSupportedByLcgCompiler(rule: ValidationRule, code: string): boolean {
    const text = `${rule.name} ${rule.message}`.toLowerCase();
    if (text.includes('system.threading')) {
      return !code.replaceAll('System.Threading.Tasks', '').includes('System.Threading');
    }
    return (
      text.includes('async/await') ||
      text.includes('try/catch/finally') ||
      text.includes('try/catch/finally/throw') ||
      text.includes('constraint:throw exceptions') ||
      text.includes('linq') ||
      text.includes('lambda expression') ||
      text.includes('constraint:interface') ||
      text.includes('interface declarations are not supported') ||
      text.includes('interfaces not supported')
    );
  }

  private addLcgDiagnostics(code: string, issues: ValidationIssue[]): void {
    const asyncReturnPattern = /\basync\s+(?!void\b)([^\n{]+)/g;
    for (const match of code.matchAll(asyncReturnPattern)) {
      issues.push(
        this.lcgIssue(
          'LCGUdonSharp async methods must return void',
          code,
          match.index,
          181,
          'Use a parameterless async void method.',
        ),
      );
    }

    const asyncParametersPattern = /\basync\s+void\s+\w+\s*\(([^)]*)\)/g;
    for (const match of code.matchAll(asyncParametersPattern)) {
      if (!match[1]?.trim()) continue;
      issues.push(
        this.lcgIssue(
          'LCGUdonSharp async methods must be parameterless',
          code,
          match.index,
          181,
          'Move inputs to fields before starting the async method.',
        ),
      );
    }

    const tryPattern = /\btry\s*\{/g;
    for (const match of code.matchAll(tryPattern)) {
      const openBrace = code.indexOf('{', match.index);
      const closeBrace = this.findMatchingBrace(code, openBrace);
      if (closeBrace < 0 || !/\bawait\b/.test(code.slice(openBrace + 1, closeBrace))) continue;
      issues.push(
        this.lcgIssue(
          'LCGUdonSharp does not support await inside try blocks',
          code,
          match.index,
          235,
          'Keep await continuations outside try/catch/finally.',
        ),
      );
    }

    const genericBehaviourPattern = /\bclass\s+\w+\s*<[^>]+>\s*:\s*[^\n{]*UdonSharpBehaviour/g;
    for (const match of code.matchAll(genericBehaviourPattern)) {
      issues.push(
        this.lcgIssue(
          'LCGUdonSharp does not support generic UdonSharpBehaviour classes',
          code,
          match.index,
          353,
          'Use a non-generic behaviour and closed generic helper methods.',
        ),
      );
    }

    const packetMethodPattern =
      /\[LCGPacket(?:\([^\]]*\))?\]\s*(?:public\s+)?(\w+)\s+(\w+)\s*\(([^)]*)\)/g;
    for (const match of code.matchAll(packetMethodPattern)) {
      const returnType = match[1];
      const parameters = match[3]?.trim() ?? '';
      const parameterCount = parameters ? parameters.split(',').length : 0;
      if (returnType !== 'void') {
        issues.push(
          this.lcgIssue(
            '[LCGPacket] methods must return void',
            code,
            match.index,
            284,
            'Change the packet method return type to void.',
          ),
        );
      }
      if (parameterCount > 8) {
        issues.push(
          this.lcgIssue(
            '[LCGPacket] methods support at most eight arguments',
            code,
            match.index,
            284,
            'Reduce or pack the packet arguments.',
          ),
        );
      }
    }
  }

  private findMatchingBrace(code: string, openBrace: number): number {
    if (openBrace < 0 || code[openBrace] !== '{') return -1;
    let depth = 0;
    for (let index = openBrace; index < code.length; index++) {
      if (code[index] === '{') depth++;
      if (code[index] === '}') depth--;
      if (depth === 0) return index;
    }
    return -1;
  }

  private lcgIssue(
    message: string,
    code: string,
    offset: number | undefined,
    sourceLine: number,
    suggestion: string,
  ): ValidationIssue {
    const line = offset === undefined ? undefined : code.slice(0, offset).split('\n').length;
    return {
      severity: 'error',
      message,
      ...(line !== undefined ? { line } : {}),
      rule: 'lcgudonsharp',
      ruleId: `lcgudonsharp-${sourceLine}`,
      suggestion,
      sourcePath: 'README.md',
      sourceLine,
    };
  }

  private ruleToIssue(rule: ValidationRule, line: number, code?: string): ValidationIssue {
    return {
      severity: rule.severity,
      message: rule.message,
      line,
      rule: rule.name,
      ruleId: rule.id,
      ...(rule.suggestion ? { suggestion: rule.suggestion } : {}),
      ...(code ? { code } : {}),
      sourcePath: rule.sourcePath,
      sourceLine: rule.sourceLine,
    };
  }

  private structuralIssue(
    message: string,
    suggestion: string,
    rule: string,
    sourcePath: string,
    sourceLine: number,
  ): ValidationIssue {
    return {
      severity: 'error',
      message,
      rule,
      ruleId: rule,
      suggestion,
      sourcePath,
      sourceLine,
    };
  }

  private deduplicateIssues(issues: ValidationIssue[]): ValidationIssue[] {
    const seen = new Set<string>();
    return issues.filter((issue) => {
      const key = `${issue.line}-${issue.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
