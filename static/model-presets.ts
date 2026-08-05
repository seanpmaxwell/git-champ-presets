interface AgentConfig {
  id: string;                    // lookup / CLI selection
  clientDisplayName: string;     // logging
  modelDisplayName?: string;     // logging; omit when no model is pinned
  exec: string;                  // command name or absolute path
  arguments: string[];           // prompt (the value itself not the flag) is appended last — DO not include it
  promptToStdin?: boolean;       // true = prepend prompt to stdin instead of argv
}

const AGENTS: readonly AgentConfig[] = [
  {
    id: 'claude-opus',
    clientDisplayName: 'Claude Code',
    modelDisplayName: 'Opus',
    exec: whoami claude,
    arguments: ['--model', 'opus', '-p'],
  },
  {
    id: 'gemini',
    clientDisplayName: 'Gemini CLI',
    exec: 'gemini',
    arguments: ['-p'],
  },
  {
    id: 'llm',
    clientDisplayName: 'llm',
    exec: 'llm',
    arguments: ['--system'],
  },
  {
    id: 'codex',
    clientDisplayName: 'Codex',
    exec: 'codex',
    arguments: ['exec', '-'],
    promptToStdin: true,
  },
];

const byId = new Map(AGENTS.map(a => [a.id, a]));

function buildInvocation(agent: AgentConfig, instruction: string, context?: string) {
  const args = agent.promptToStdin ? [...agent.arguments] : [...agent.arguments, instruction];
  const input = agent.promptToStdin
    ? [instruction, context].filter(Boolean).join('\n\n')
    : context;

  return execa(agent.exec, args, input ? { input } : { stdin: 'ignore' });
}

const suspicious = cfg.arguments.find(a => /\{\{|\}\}|\$\{|%s/.test(a) || a.endsWith('='));
if (suspicious) throw new Error(
  `${key}: argument "${suspicious}" looks like a prompt placeholder. ` +
  `The prompt is appended automatically — omit it from arguments.`
);
