import { Prompt } from '@modelcontextprotocol/sdk/types.js';

/**
 * Claude-specific prompts for enhanced Roblox Studio interaction
 */
export const claudePrompts: Prompt[] = [
  {
    name: 'roblox-game-wizard',
    description: 'Interactive game creation wizard for Claude - guides through game setup with natural language',
    arguments: [
      {
        name: 'language',
        description: 'Preferred language (ko/en)',
        required: false,
      },
    ],
  },
  {
    name: 'roblox-script-assistant',
    description: 'Natural language script generator - converts descriptions to Luau code',
    arguments: [
      {
        name: 'description',
        description: 'Natural language description of what the script should do',
        required: true,
      },
      {
        name: 'scriptType',
        description: 'Type of script (auto-detected if not specified)',
        required: false,
      },
    ],
  },
  {
    name: 'roblox-debug-helper',
    description: 'Intelligent debugging assistant - analyzes code and suggests fixes',
    arguments: [
      {
        name: 'code',
        description: 'The problematic code',
        required: true,
      },
      {
        name: 'error',
        description: 'Error message or unexpected behavior',
        required: false,
      },
    ],
  },
  {
    name: 'roblox-korean-mode',
    description: '한국어 모드 - 모든 명령어와 응답을 한국어로 처리',
    arguments: [],
  },
];

/**
 * Natural language command mappings for Claude
 */
export const commandMappings = {
  korean: {
    // Game creation
    '게임 만들기': 'create-game',
    '플랫포머': 'platformer-template',
    '멀티플레이어': 'multiplayer-setup',
    'RPG': 'rpg-template',
    
    // Script writing
    '스크립트 작성': 'generate-script',
    '플레이어 이동': 'player-movement',
    '아이템 수집': 'item-collection',
    'UI 생성': 'create-ui',
    
    // Debugging
    '디버그': 'debug-script',
    '오류 찾기': 'find-errors',
    '최적화': 'optimize-performance',
    
    // Common components
    '체력바': 'health-bar',
    '인벤토리': 'inventory-system',
    '상점': 'shop-interface',
    '전투 시스템': 'combat-system',
  },
  english: {
    // Game creation
    'create game': 'create-game',
    'platformer': 'platformer-template',
    'multiplayer': 'multiplayer-setup',
    'rpg': 'rpg-template',
    
    // Script writing
    'write script': 'generate-script',
    'player movement': 'player-movement',
    'item collection': 'item-collection',
    'create ui': 'create-ui',
    
    // Debugging
    'debug': 'debug-script',
    'find errors': 'find-errors',
    'optimize': 'optimize-performance',
    
    // Common components
    'health bar': 'health-bar',
    'inventory': 'inventory-system',
    'shop': 'shop-interface',
    'combat system': 'combat-system',
  },
};

/**
 * Template responses for common requests
 */
export const templateResponses = {
  'game-creation': {
    ko: `게임을 만들기 위해 다음 정보가 필요합니다:
1. 게임 장르 (플랫포머, RPG, 레이싱 등)
2. 플레이어 수 (싱글/멀티플레이어)
3. 주요 기능 목록
4. 타겟 연령층

어떤 종류의 게임을 만들고 싶으신가요?`,
    en: `To create a game, I need the following information:
1. Game genre (platformer, RPG, racing, etc.)
2. Number of players (single/multiplayer)
3. Main features list
4. Target age group

What kind of game would you like to create?`,
  },
  'script-generation': {
    ko: `스크립트를 생성하기 위해 다음을 알려주세요:
- 스크립트가 수행할 작업
- ServerScript/LocalScript/ModuleScript 중 선택
- 특별한 요구사항이나 제약사항`,
    en: `To generate a script, please tell me:
- What the script should do
- Choose between ServerScript/LocalScript/ModuleScript
- Any special requirements or constraints`,
  },
};

/**
 * Enhanced prompt handler for Claude
 */
export async function handleClaudePrompt(
  promptName: string,
  args: Record<string, unknown>
): Promise<string> {
  const language = (args.language as string) || 'en';
  
  switch (promptName) {
    case 'roblox-game-wizard':
      return templateResponses['game-creation'][language] || templateResponses['game-creation']['en'];
      
    case 'roblox-script-assistant':
      const description = args.description as string;
      return generateScriptFromDescription(description, language);
      
    case 'roblox-debug-helper':
      const code = args.code as string;
      const error = args.error as string;
      return analyzeAndDebugCode(code, error, language);
      
    case 'roblox-korean-mode':
      return '한국어 모드가 활성화되었습니다. 이제 모든 명령어를 한국어로 입력하실 수 있습니다.';
      
    default:
      return 'Unknown prompt';
  }
}

/**
 * Generate script from natural language description
 */
function generateScriptFromDescription(description: string, language: string): string {
  // Analyze description and map to appropriate tools
  const mappings = commandMappings[language] || commandMappings['en'];
  let matchedCommand = null;
  
  for (const [keyword, command] of Object.entries(mappings)) {
    if (description.toLowerCase().includes(keyword.toLowerCase())) {
      matchedCommand = command;
      break;
    }
  }
  
  if (!matchedCommand) {
    return language === 'ko' 
      ? `설명을 이해했습니다: "${description}". 적절한 Luau 스크립트를 생성하겠습니다.`
      : `I understand your request: "${description}". I'll generate the appropriate Luau script.`;
  }
  
  return language === 'ko'
    ? `"${matchedCommand}" 기능을 위한 스크립트를 생성하겠습니다.`
    : `I'll generate a script for the "${matchedCommand}" functionality.`;
}

/**
 * Analyze and debug code
 */
function analyzeAndDebugCode(code: string, error: string, language: string): string {
  // Basic code analysis
  const hasError = error && error.length > 0;
  
  if (language === 'ko') {
    return `코드를 분석하겠습니다.
${hasError ? `\n발생한 오류: ${error}` : ''}
\n일반적인 문제점들을 확인하고 수정 사항을 제안하겠습니다.`;
  } else {
    return `I'll analyze your code.
${hasError ? `\nError encountered: ${error}` : ''}
\nI'll check for common issues and suggest fixes.`;
  }
}
