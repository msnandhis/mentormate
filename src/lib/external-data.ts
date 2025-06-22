// External data integration utilities

const EXTERNAL_DATA_API = '/functions/v1/external-data-integration';

export interface ExternalDataOptions {
  location?: string;
  category?: string;
  context?: any;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  advice: string;
}

export interface MotivationQuote {
  quote: string;
  category: string;
  author: string;
}

export interface HealthTip {
  tip: string;
  category: string;
  source: string;
}

export interface NewsSummary {
  headline: string;
  category: string;
  source: string;
  summary: string;
}

class ExternalDataService {
  private async request(dataType: string, options: ExternalDataOptions = {}) {
    try {
      const response = await fetch(EXTERNAL_DATA_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          data_type: dataType,
          ...options
        }),
      });

      if (!response.ok) {
        throw new Error(`External data request failed: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`Error fetching ${dataType}:`, error);
      throw error;
    }
  }

  async getWeatherData(location = 'New York'): Promise<WeatherData> {
    return this.request('weather', { location });
  }

  async getMotivationQuote(category?: string): Promise<MotivationQuote> {
    return this.request('motivation_quote', { category });
  }

  async getHealthTip(category?: string): Promise<HealthTip> {
    return this.request('health_tip', { category });
  }

  async getNewsSummary(category?: string): Promise<NewsSummary> {
    return this.request('news_summary', { category });
  }

  // Enhanced mentor prompt generation with external data
  async enhanceMentorPrompt(
    baseMentorPrompt: string, 
    mentorCategory: string,
    userContext?: any
  ): Promise<string> {
    try {
      let enhancedPrompt = baseMentorPrompt;
      
      // Add relevant external data based on mentor category
      switch (mentorCategory) {
        case 'fitness':
          try {
            const weather = await this.getWeatherData(userContext?.location);
            const healthTip = await this.getHealthTip('exercise');
            
            enhancedPrompt += `\n\nCurrent Context:
- Weather in ${weather.location}: ${weather.temperature}°C, ${weather.condition}
- Weather advice: ${weather.advice}
- Health tip: ${healthTip.tip}

Incorporate this information naturally into your response if relevant.`;
          } catch (error) {
            // Continue without external data if it fails
          }
          break;

        case 'wellness':
          try {
            const quote = await this.getMotivationQuote('wellness');
            const tip = await this.getHealthTip('mental');
            
            enhancedPrompt += `\n\nInspiration for today:
- Quote: "${quote.quote}"
- Wellness tip: ${tip.tip}

You can reference these if they help support the user.`;
          } catch (error) {
            // Continue without external data if it fails
          }
          break;

        case 'career':
          try {
            const news = await this.getNewsSummary('technology');
            const quote = await this.getMotivationQuote('career');
            
            enhancedPrompt += `\n\nProfessional Context:
- Industry insight: ${news.headline}
- Motivational quote: "${quote.quote}"

Use this context to provide relevant career guidance.`;
          } catch (error) {
            // Continue without external data if it fails
          }
          break;

        case 'study':
          try {
            const tip = await this.getHealthTip('mental');
            const quote = await this.getMotivationQuote('general');
            
            enhancedPrompt += `\n\nLearning Support:
- Focus tip: ${tip.tip}
- Motivation: "${quote.quote}"

Incorporate these insights to enhance your study guidance.`;
          } catch (error) {
            // Continue without external data if it fails
          }
          break;
      }

      return enhancedPrompt;
    } catch (error) {
      console.error('Error enhancing mentor prompt:', error);
      return baseMentorPrompt; // Return original prompt if enhancement fails
    }
  }

  // Get contextual data for proactive nudges
  async getContextualDataForNudge(
    nudgeType: 'missed_checkins' | 'low_mood' | 'goal_struggle' | 'celebration',
    userContext?: any
  ): Promise<string> {
    try {
      switch (nudgeType) {
        case 'missed_checkins':
          const weather = await this.getWeatherData(userContext?.location);
          return `Current weather is ${weather.condition} with ${weather.temperature}°C - ${weather.advice}`;

        case 'low_mood':
          const quote = await this.getMotivationQuote('wellness');
          return `Here's some inspiration: "${quote.quote}"`;

        case 'goal_struggle':
          const tip = await this.getHealthTip('mental');
          return `Helpful tip: ${tip.tip}`;

        case 'celebration':
          const celebrationQuote = await this.getMotivationQuote('general');
          return `Celebrating with: "${celebrationQuote.quote}"`;

        default:
          return '';
      }
    } catch (error) {
      console.error('Error getting contextual data:', error);
      return '';
    }
  }
}

export const externalDataService = new ExternalDataService();