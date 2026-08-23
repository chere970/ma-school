/**
 * Minimal Jest TypeScript transformer.
 *
 * Used as a workaround because ts-jest's dist/ was not
 * compiled in this pnpm workspace setup.
 *
 * This uses the TypeScript compiler directly (which IS
 * properly installed) to transpile test files.
 */

const ts = require('typescript');
const path = require('path');

const tsconfigPath = path.resolve(__dirname, 'tsconfig.json');

let compilerOptions = {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2020,
  esModuleInterop: true,
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  strictNullChecks: false,
  skipLibCheck: true,
};

// Try to read tsconfig
try {
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const config = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath),
  );
  compilerOptions = {
    ...config.options,
    module: ts.ModuleKind.CommonJS,
  };
} catch (e) {
  // use defaults
}

module.exports = {
  process(sourceText, sourcePath) {
    if (sourcePath.endsWith('.ts') || sourcePath.endsWith('.tsx')) {
      const result = ts.transpileModule(sourceText, {
        compilerOptions,
        fileName: sourcePath,
        reportDiagnostics: false,
      });
      return { code: result.outputText };
    }
    return { code: sourceText };
  },
};
