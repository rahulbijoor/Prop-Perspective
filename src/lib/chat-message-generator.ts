import type { DebateResponse, DebateArgument } from '../types/debate';

export interface ChatMessage {
  id: string;
  agent: 'investor' | 'risk';
  message: string;
  timestamp: Date;
  confidence?: number;
}

/**
 * Chat Message Generator
 * Converts debate responses into dynamic chat conversations
 */
export class ChatMessageGenerator {
  
  /**
   * Generate dynamic chat messages from debate response
   */
  generateChatMessages(debate: DebateResponse): Omit<ChatMessage, 'id' | 'timestamp'>[] {
    const messages: Omit<ChatMessage, 'id' | 'timestamp'>[] = [];

    // Opening messages
    messages.push({
      agent: 'investor',
      message: "I've completed my analysis of this property and I'm excited to share my findings. There are some compelling investment opportunities here!",
      confidence: 95
    });

    messages.push({
      agent: 'risk',
      message: "I've also finished my assessment, and while there are positives, I need to highlight some important concerns that warrant careful consideration.",
      confidence: 88
    });

    // Extract key points from pro arguments
    const proArguments = debate.pro_arguments || [];
    const conArguments = debate.con_arguments || [];

    // Generate messages from actual debate arguments
    if (proArguments.length > 0) {
      const firstProArg = proArguments[0];
      messages.push({
        agent: 'investor',
        message: this.generateProMessage(firstProArg, debate),
        confidence: Math.round((firstProArg.strength || 0.8) * 100)
      });
    }

    if (conArguments.length > 0) {
      const firstConArg = conArguments[0];
      messages.push({
        agent: 'risk',
        message: this.generateConMessage(firstConArg, debate),
        confidence: Math.round((firstConArg.strength || 0.8) * 100)
      });
    }

    // Market insights discussion
    if (debate.market_insights) {
      messages.push({
        agent: 'investor',
        message: this.generateMarketInsightMessage(debate.market_insights, 'positive'),
        confidence: 90
      });

      messages.push({
        agent: 'risk',
        message: this.generateMarketInsightMessage(debate.market_insights, 'cautious'),
        confidence: 85
      });
    }

    // Additional arguments if available
    if (proArguments.length > 1) {
      const secondProArg = proArguments[1];
      messages.push({
        agent: 'investor',
        message: this.generateSecondaryProMessage(secondProArg),
        confidence: Math.round((secondProArg.strength || 0.75) * 100)
      });
    }

    if (conArguments.length > 1) {
      const secondConArg = conArguments[1];
      messages.push({
        agent: 'risk',
        message: this.generateSecondaryConMessage(secondConArg),
        confidence: Math.round((secondConArg.strength || 0.75) * 100)
      });
    }

    // Financial analysis
    messages.push({
      agent: 'investor',
      message: this.generateFinancialMessage(debate, 'optimistic'),
      confidence: 88
    });

    messages.push({
      agent: 'risk',
      message: this.generateFinancialMessage(debate, 'conservative'),
      confidence: 82
    });

    // Closing thoughts
    messages.push({
      agent: 'investor',
      message: this.generateClosingMessage('investor', debate),
      confidence: Math.round(debate.confidence_score * 100)
    });

    messages.push({
      agent: 'risk',
      message: this.generateClosingMessage('risk', debate),
      confidence: Math.round((1 - debate.confidence_score) * 100)
    });

    return messages;
  }

  /**
   * Generate pro argument message
   */
  private generateProMessage(argument: DebateArgument, debate: DebateResponse): string {
    const title = argument.title || 'Investment Opportunity';
    const content = this.extractKeyPoints(argument.content, 3);
    
    const intro = this.getRandomIntro([
      "Let me highlight why this is such a strong opportunity:",
      "Here's what makes this property particularly attractive:",
      "The investment case is compelling for several reasons:",
      "I'm excited about this property because:"
    ]);

    return `${intro} ${title.toLowerCase()}. ${content}`;
  }

  /**
   * Generate con argument message
   */
  private generateConMessage(argument: DebateArgument, debate: DebateResponse): string {
    const title = argument.title || 'Risk Consideration';
    const content = this.extractKeyPoints(argument.content, 3);
    
    const intro = this.getRandomIntro([
      "I need to raise some important concerns:",
      "Here's what worries me about this investment:",
      "There are several risk factors to consider:",
      "My analysis reveals some concerning issues:"
    ]);

    return `${intro} ${title.toLowerCase()}. ${content}`;
  }

  /**
   * Generate market insight message
   */
  private generateMarketInsightMessage(insights: any, perspective: 'positive' | 'cautious'): string {
    const pricePerSqft = insights.price_per_sqft || 0;
    const marketPosition = insights.market_position || 'competitive';
    const investmentPotential = insights.investment_potential || 'moderate';

    if (perspective === 'positive') {
      return `The market fundamentals look strong here. At $${pricePerSqft}/sqft, this property is ${marketPosition} in the current market. The investment potential is ${investmentPotential}, which aligns well with Austin's growth trajectory.`;
    } else {
      return `While the market data shows $${pricePerSqft}/sqft, we need to be cautious about the ${marketPosition} positioning. The ${investmentPotential} investment potential comes with inherent risks that we should carefully evaluate.`;
    }
  }

  /**
   * Generate secondary pro message
   */
  private generateSecondaryProMessage(argument: DebateArgument): string {
    const content = this.extractKeyPoints(argument.content, 2);
    return `Additionally, ${argument.title?.toLowerCase() || 'another key factor'} strengthens the investment case. ${content}`;
  }

  /**
   * Generate secondary con message
   */
  private generateSecondaryConMessage(argument: DebateArgument): string {
    const content = this.extractKeyPoints(argument.content, 2);
    return `Furthermore, ${argument.title?.toLowerCase() || 'another concern'} adds to the risk profile. ${content}`;
  }

  /**
   * Generate financial analysis message
   */
  private generateFinancialMessage(debate: DebateResponse, perspective: 'optimistic' | 'conservative'): string {
    

    if (perspective === 'optimistic') {
      return `From a financial standpoint, the numbers work well. The price point creates opportunities for both appreciation and cash flow. Austin's market dynamics support strong returns for properties in this category.`;
    } else {
      return `Financially, we need to account for all costs. Property taxes, insurance, and maintenance can significantly impact returns. The current market pricing leaves less margin for error than I'd prefer.`;
    }
  }

  /**
   * Generate closing message
   */
  private generateClosingMessage(agent: 'investor' | 'risk', debate: DebateResponse): string {
    const recommendation = debate.recommendation || 'investigate_further';
    
    if (agent === 'investor') {
      if (recommendation === 'buy' || debate.confidence_score > 0.7) {
        return "Bottom line - this property represents a solid investment opportunity. The fundamentals are strong, and I believe it offers good potential for both appreciation and returns.";
      } else {
        return "While there are positives here, I think we need to weigh all factors carefully. It's a decent opportunity, but make sure it aligns with your investment goals and risk tolerance.";
      }
    } else {
      if (recommendation === 'pass' || debate.confidence_score < 0.4) {
        return "My final assessment is that the risks outweigh the potential rewards here. There are better opportunities in the market that don't carry these same concerns.";
      } else {
        return "In conclusion, while there are opportunities here, the risk factors are significant. I'd recommend thorough due diligence and perhaps looking at comparable properties before making a decision.";
      }
    }
  }

  /**
   * Extract key points from content
   */
  private extractKeyPoints(content: string, maxPoints: number = 3): string {
    if (!content) return '';
    
    // Split by bullet points or sentences
    const points = content.split(/[•\n]/).filter(point => point.trim().length > 20);
    
    // Take the first few points and clean them up
    const selectedPoints = points.slice(0, maxPoints)
      .map(point => point.trim().replace(/^[-•*]\s*/, ''))
      .filter(point => point.length > 0);
    
    return selectedPoints.join(' ').substring(0, 200) + (selectedPoints.join(' ').length > 200 ? '...' : '');
  }

  /**
   * Get random intro phrase
   */
  private getRandomIntro(intros: string[]): string {
    return intros[Math.floor(Math.random() * intros.length)];
  }
}

// Export singleton instance
export const chatMessageGenerator = new ChatMessageGenerator();
