import { Router, Request, Response } from 'express';
import { claudeTools, executeClaudeTool, NaturalCommandProcessor } from '../tools/claude-tools.js';
import { claudePrompts, handleClaudePrompt } from '../prompts/claude-prompts.js';
import { logger } from '../utils/logger.js';

const router = Router();
const commandProcessor = new NaturalCommandProcessor();

/**
 * Claude-specific endpoint for natural language processing
 */
router.post('/process', async (req: Request, res: Response) => {
  try {
    const { command, context, language } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    logger.info('Processing Claude command', { command, language });

    // Process the natural language command
    const processedCommand = await commandProcessor.processCommand(command, context);
    
    // Execute suggested tools if confidence is high
    if (processedCommand.confidence > 0.7 && processedCommand.suggestedTools.length > 0) {
      const toolResults = [];
      
      for (const toolName of processedCommand.suggestedTools) {
        try {
          const result = await executeClaudeTool(toolName, {
            ...processedCommand.parameters,
            command,
            language: language || processedCommand.parameters.language,
          });
          toolResults.push({ tool: toolName, result });
        } catch (error) {
          logger.error(`Error executing tool ${toolName}:`, error);
        }
      }
      
      processedCommand['toolResults'] = toolResults;
    }

    res.json({
      success: true,
      processed: processedCommand,
      language: processedCommand.parameters.language,
    });
  } catch (error) {
    logger.error('Error processing Claude command:', error);
    res.status(500).json({ error: 'Failed to process command' });
  }
});

/**
 * Get available Claude prompts
 */
router.get('/prompts', (req: Request, res: Response) => {
  res.json({
    prompts: claudePrompts,
    total: claudePrompts.length,
  });
});

/**
 * Execute a specific Claude prompt
 */
router.post('/prompts/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const args = req.body;
    
    const prompt = claudePrompts.find(p => p.name === name);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    const result = await handleClaudePrompt(name, args);
    
    res.json({
      success: true,
      prompt: name,
      result,
    });
  } catch (error) {
    logger.error('Error executing Claude prompt:', error);
    res.status(500).json({ error: 'Failed to execute prompt' });
  }
});

/**
 * Get available Claude tools
 */
router.get('/tools', (req: Request, res: Response) => {
  res.json({
    tools: claudeTools,
    total: claudeTools.length,
  });
});

/**
 * Execute a specific Claude tool
 */
router.post('/tools/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const args = req.body;
    
    const tool = claudeTools.find(t => t.name === name);
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    const result = await executeClaudeTool(name, args);
    
    res.json({
      success: true,
      tool: name,
      result,
    });
  } catch (error) {
    logger.error('Error executing Claude tool:', error);
    res.status(500).json({ error: 'Failed to execute tool' });
  }
});

/**
 * Interactive wizard endpoint
 */
router.post('/wizard', async (req: Request, res: Response) => {
  try {
    const { step, previousChoices, language } = req.body;
    
    const result = await executeClaudeTool('roblox-template-wizard', {
      step: step || 'start',
      previousChoices: previousChoices || {},
      language: language || 'en',
    });
    
    res.json({
      success: true,
      wizard: result,
    });
  } catch (error) {
    logger.error('Error in wizard:', error);
    res.status(500).json({ error: 'Failed to process wizard step' });
  }
});

/**
 * Code explanation endpoint
 */
router.post('/explain', async (req: Request, res: Response) => {
  try {
    const { code, language, detailLevel } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const result = await executeClaudeTool('roblox-code-explain', {
      code,
      language: language || 'en',
      detailLevel: detailLevel || 'simple',
    });
    
    res.json({
      success: true,
      explanation: result,
    });
  } catch (error) {
    logger.error('Error explaining code:', error);
    res.status(500).json({ error: 'Failed to explain code' });
  }
});

/**
 * Learning path generator endpoint
 */
router.post('/learning-path', async (req: Request, res: Response) => {
  try {
    const { currentSkills, goals, timeCommitment, language } = req.body;
    
    if (!goals || goals.length === 0) {
      return res.status(400).json({ error: 'Goals are required' });
    }

    const result = await executeClaudeTool('roblox-learning-path', {
      currentSkills: currentSkills || [],
      goals,
      timeCommitment: timeCommitment || 'regular',
      language: language || 'en',
    });
    
    res.json({
      success: true,
      learningPath: result,
    });
  } catch (error) {
    logger.error('Error generating learning path:', error);
    res.status(500).json({ error: 'Failed to generate learning path' });
  }
});

/**
 * Health check for Claude integration
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    integration: 'claude-enhanced',
    features: {
      naturalLanguage: true,
      koreanSupport: true,
      interactiveWizards: true,
      codeExplanation: true,
      learningPaths: true,
    },
    version: '2.0.0',
  });
});

export default router;
