import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Claude-enhanced tools for natural language interaction
 */
export const claudeTools: Tool[] = [
  {
    name: 'roblox-natural-command',
    description: 'Process natural language commands for Roblox Studio operations',
    inputSchema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'Natural language command in Korean or English',
        },
        context: {
          type: 'object',
          description: 'Additional context for the command',
          properties: {
            previousCommands: {
              type: 'array',
              items: { type: 'string' },
              description: 'Previous commands in the conversation',
            },
            projectType: {
              type: 'string',
              description: 'Type of Roblox project being worked on',
            },
            userLevel: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
              description: 'User expertise level',
            },
          },
        },
      },
      required: ['command'],
    },
  },
  {
    name: 'roblox-code-explain',
    description: 'Explain Roblox Luau code in simple terms (Korean/English)',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Luau code to explain',
        },
        language: {
          type: 'string',
          enum: ['ko', 'en'],
          description: 'Language for explanation',
          default: 'en',
        },
        detailLevel: {
          type: 'string',
          enum: ['simple', 'detailed', 'expert'],
          description: 'Level of detail in explanation',
          default: 'simple',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'roblox-project-analyzer',
    description: 'Analyze Roblox project and suggest improvements',
    inputSchema: {
      type: 'object',
      properties: {
        projectStructure: {
          type: 'object',
          description: 'Current project structure',
        },
        analysisType: {
          type: 'string',
          enum: ['performance', 'security', 'architecture', 'all'],
          description: 'Type of analysis to perform',
          default: 'all',
        },
        language: {
          type: 'string',
          enum: ['ko', 'en'],
          default: 'en',
        },
      },
      required: ['projectStructure'],
    },
  },
  {
    name: 'roblox-template-wizard',
    description: 'Interactive template creation wizard with step-by-step guidance',
    inputSchema: {
      type: 'object',
      properties: {
        step: {
          type: 'string',
          enum: ['start', 'genre', 'features', 'style', 'generate'],
          description: 'Current step in the wizard',
        },
        previousChoices: {
          type: 'object',
          description: 'Choices made in previous steps',
        },
        language: {
          type: 'string',
          enum: ['ko', 'en'],
          default: 'en',
        },
      },
      required: ['step'],
    },
  },
  {
    name: 'roblox-learning-path',
    description: 'Generate personalized learning path for Roblox development',
    inputSchema: {
      type: 'object',
      properties: {
        currentSkills: {
          type: 'array',
          items: { type: 'string' },
          description: 'Current Roblox development skills',
        },
        goals: {
          type: 'array',
          items: { type: 'string' },
          description: 'Learning goals',
        },
        timeCommitment: {
          type: 'string',
          enum: ['casual', 'regular', 'intensive'],
          description: 'How much time to dedicate',
        },
        language: {
          type: 'string',
          enum: ['ko', 'en'],
          default: 'en',
        },
      },
      required: ['goals'],
    },
  },
];

/**
 * Command processor for natural language inputs
 */
export interface CommandProcessor {
  processCommand(command: string, context?: any): Promise<ProcessedCommand>;
  detectLanguage(text: string): 'ko' | 'en';
  extractIntent(command: string): Intent;
}

export interface ProcessedCommand {
  intent: Intent;
  parameters: Record<string, any>;
  suggestedTools: string[];
  confidence: number;
}

export interface Intent {
  action: string;
  target: string;
  modifiers: string[];
}

/**
 * Natural language command processor implementation
 */
export class NaturalCommandProcessor implements CommandProcessor {
  private koreanPatterns = {
    create: /만들|생성|제작|구현/,
    debug: /디버그|오류|에러|버그|문제/,
    optimize: /최적화|성능|개선/,
    explain: /설명|알려|뭐야|무엇/,
  };

  private englishPatterns = {
    create: /create|make|build|implement/i,
    debug: /debug|error|bug|issue|problem/i,
    optimize: /optimize|performance|improve/i,
    explain: /explain|what is|tell me|describe/i,
  };

  async processCommand(command: string, context?: any): Promise<ProcessedCommand> {
    const language = this.detectLanguage(command);
    const intent = this.extractIntent(command);
    const parameters = this.extractParameters(command, intent, language);
    const suggestedTools = this.suggestTools(intent, parameters);

    return {
      intent,
      parameters,
      suggestedTools,
      confidence: this.calculateConfidence(command, intent),
    };
  }

  detectLanguage(text: string): 'ko' | 'en' {
    const koreanRegex = /[가-힣]/;
    return koreanRegex.test(text) ? 'ko' : 'en';
  }

  extractIntent(command: string): Intent {
    const language = this.detectLanguage(command);
    const patterns = language === 'ko' ? this.koreanPatterns : this.englishPatterns;

    let action = 'unknown';
    for (const [key, pattern] of Object.entries(patterns)) {
      if (pattern.test(command)) {
        action = key;
        break;
      }
    }

    // Extract target (what to create/debug/etc)
    const target = this.extractTarget(command, language);
    const modifiers = this.extractModifiers(command, language);

    return { action, target, modifiers };
  }

  private extractTarget(command: string, language: 'ko' | 'en'): string {
    // Simple extraction logic - can be enhanced
    if (language === 'ko') {
      const matches = command.match(/(게임|스크립트|UI|시스템|플레이어|아이템)/);
      return matches ? matches[1] : 'unknown';
    } else {
      const matches = command.match(/(game|script|ui|system|player|item)/i);
      return matches ? matches[1].toLowerCase() : 'unknown';
    }
  }

  private extractModifiers(command: string, language: 'ko' | 'en'): string[] {
    const modifiers: string[] = [];
    
    if (language === 'ko') {
      if (/멀티플레이어|다중/.test(command)) modifiers.push('multiplayer');
      if (/간단|쉬운/.test(command)) modifiers.push('simple');
      if (/복잡|고급/.test(command)) modifiers.push('advanced');
    } else {
      if (/multiplayer|multi-player/i.test(command)) modifiers.push('multiplayer');
      if (/simple|easy/i.test(command)) modifiers.push('simple');
      if (/complex|advanced/i.test(command)) modifiers.push('advanced');
    }

    return modifiers;
  }

  private extractParameters(command: string, intent: Intent, language: 'ko' | 'en'): Record<string, any> {
    const params: Record<string, any> = {
      language,
      originalCommand: command,
    };

    // Extract numbers
    const numbers = command.match(/\d+/g);
    if (numbers) {
      params.numbers = numbers.map(n => parseInt(n));
    }

    // Extract quoted strings
    const quoted = command.match(/["']([^"']+)["']/g);
    if (quoted) {
      params.quotedStrings = quoted.map(q => q.replace(/["']/g, ''));
    }

    return params;
  }

  private suggestTools(intent: Intent, parameters: Record<string, any>): string[] {
    const tools: string[] = [];

    switch (intent.action) {
      case 'create':
        if (intent.target === 'game' || intent.target === '게임') {
          tools.push('generate-roblox-code', 'create-game-component');
        } else if (intent.target === 'script' || intent.target === '스크립트') {
          tools.push('generate-roblox-code');
        } else if (intent.target === 'ui' || intent.target === 'UI') {
          tools.push('create-ui-element');
        }
        break;
      case 'debug':
        tools.push('validate-luau-code', 'find-script-issues');
        break;
      case 'optimize':
        tools.push('optimize-for-performance', 'analyze-memory-usage');
        break;
      case 'explain':
        tools.push('roblox-code-explain');
        break;
    }

    return tools;
  }

  private calculateConfidence(command: string, intent: Intent): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on intent clarity
    if (intent.action !== 'unknown') confidence += 0.2;
    if (intent.target !== 'unknown') confidence += 0.2;
    if (intent.modifiers.length > 0) confidence += 0.1;

    // Decrease confidence for very short or very long commands
    if (command.length < 10) confidence -= 0.1;
    if (command.length > 200) confidence -= 0.1;

    return Math.max(0, Math.min(1, confidence));
  }
}

/**
 * Tool executor for Claude integration
 */
export async function executeClaudeTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<any> {
  const processor = new NaturalCommandProcessor();

  switch (toolName) {
    case 'roblox-natural-command':
      const command = args.command as string;
      const context = args.context || {};
      return await processor.processCommand(command, context);

    case 'roblox-code-explain':
      return explainCode(
        args.code as string,
        args.language as 'ko' | 'en' || 'en',
        args.detailLevel as string || 'simple'
      );

    case 'roblox-project-analyzer':
      return analyzeProject(
        args.projectStructure,
        args.analysisType as string || 'all',
        args.language as 'ko' | 'en' || 'en'
      );

    case 'roblox-template-wizard':
      return runTemplateWizard(
        args.step as string,
        args.previousChoices || {},
        args.language as 'ko' | 'en' || 'en'
      );

    case 'roblox-learning-path':
      return generateLearningPath(
        args.currentSkills as string[] || [],
        args.goals as string[],
        args.timeCommitment as string || 'regular',
        args.language as 'ko' | 'en' || 'en'
      );

    default:
      throw new Error(`Unknown Claude tool: ${toolName}`);
  }
}

// Helper functions for tool execution
function explainCode(code: string, language: 'ko' | 'en', detailLevel: string): string {
  const explanations = {
    ko: {
      simple: '이 코드는 다음과 같은 작업을 수행합니다:\n',
      detailed: '코드에 대한 상세 설명:\n',
      expert: '전문가 수준의 코드 분석:\n',
    },
    en: {
      simple: 'This code does the following:\n',
      detailed: 'Detailed explanation of the code:\n',
      expert: 'Expert-level code analysis:\n',
    },
  };

  return explanations[language][detailLevel] + analyzeCodeStructure(code, language);
}

function analyzeCodeStructure(code: string, language: 'ko' | 'en'): string {
  // Simple code analysis - can be enhanced
  const lines = code.split('\n');
  const functions = lines.filter(line => line.includes('function')).length;
  const variables = lines.filter(line => line.includes('local')).length;

  if (language === 'ko') {
    return `- 함수 ${functions}개\n- 변수 ${variables}개\n- 총 ${lines.length}줄`;
  } else {
    return `- ${functions} functions\n- ${variables} variables\n- ${lines.length} total lines`;
  }
}

function analyzeProject(projectStructure: any, analysisType: string, language: 'ko' | 'en'): any {
  // Project analysis logic
  return {
    language,
    analysisType,
    findings: [],
    recommendations: [],
  };
}

function runTemplateWizard(step: string, previousChoices: any, language: 'ko' | 'en'): any {
  // Template wizard logic
  const wizardSteps = {
    ko: {
      start: '로블록스 게임 템플릿 마법사를 시작합니다. 어떤 장르의 게임을 만들고 싶으신가요?',
      genre: '장르를 선택하셨습니다. 이제 주요 기능을 선택해주세요.',
      features: '기능을 선택하셨습니다. 게임의 스타일을 정해주세요.',
      style: '스타일을 선택하셨습니다. 템플릿을 생성할 준비가 되었습니다.',
      generate: '템플릿을 생성하고 있습니다...',
    },
    en: {
      start: 'Starting Roblox game template wizard. What genre of game would you like to create?',
      genre: 'Genre selected. Now choose the main features.',
      features: 'Features selected. Please choose the game style.',
      style: 'Style selected. Ready to generate the template.',
      generate: 'Generating template...',
    },
  };

  return {
    currentStep: step,
    message: wizardSteps[language][step],
    previousChoices,
    nextStep: getNextStep(step),
  };
}

function getNextStep(currentStep: string): string {
  const steps = ['start', 'genre', 'features', 'style', 'generate'];
  const currentIndex = steps.indexOf(currentStep);
  return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : 'complete';
}

function generateLearningPath(
  currentSkills: string[],
  goals: string[],
  timeCommitment: string,
  language: 'ko' | 'en'
): any {
  // Learning path generation logic
  const paths = {
    ko: {
      title: '맞춤형 로블록스 학습 경로',
      duration: timeCommitment === 'intensive' ? '4주' : timeCommitment === 'regular' ? '8주' : '12주',
      modules: [],
    },
    en: {
      title: 'Personalized Roblox Learning Path',
      duration: timeCommitment === 'intensive' ? '4 weeks' : timeCommitment === 'regular' ? '8 weeks' : '12 weeks',
      modules: [],
    },
  };

  return paths[language];
}
