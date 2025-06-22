import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

interface ExternalDataRequest {
  data_type: 'weather' | 'motivation_quote' | 'health_tip' | 'news_summary';
  location?: string;
  category?: string;
  context?: any;
}

interface ExternalDataResponse {
  success: boolean;
  data: any;
  source: string;
  timestamp: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { data_type, location, category, context }: ExternalDataRequest = await req.json();

    let externalData;

    switch (data_type) {
      case 'weather':
        externalData = await getWeatherData(location || 'New York');
        break;
      case 'motivation_quote':
        externalData = await getMotivationQuote(category);
        break;
      case 'health_tip':
        externalData = await getHealthTip(category);
        break;
      case 'news_summary':
        externalData = await getNewsSummary(category);
        break;
      default:
        throw new Error(`Unknown data type: ${data_type}`);
    }

    return new Response(JSON.stringify({
      success: true,
      data: externalData,
      source: data_type,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("External data integration error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getWeatherData(location: string) {
  try {
    // For demo purposes, using a free weather API (replace with your preferred service)
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    
    if (!apiKey) {
      // Return mock data for demo
      return {
        location: location,
        temperature: Math.floor(Math.random() * 30) + 10, // 10-40°C
        condition: ['sunny', 'cloudy', 'rainy', 'partly cloudy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        advice: getWeatherAdvice(location)
      };
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();
    
    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      advice: getWeatherAdvice(data.weather[0].main)
    };
  } catch (error) {
    // Fallback to mock data
    return {
      location: location,
      temperature: 22,
      condition: 'pleasant',
      humidity: 60,
      advice: "Perfect weather for a walk or outdoor exercise!"
    };
  }
}

function getWeatherAdvice(condition: string): string {
  const advice = {
    'Clear': "Perfect weather for outdoor activities! Consider a walk or run.",
    'Clouds': "Great day for any activity! Maybe try something new outdoors.",
    'Rain': "Indoor workout day! Perfect time for yoga or home exercises.",
    'Snow': "Bundle up if going outside, or enjoy a cozy indoor session.",
    'sunny': "Sunny day ahead! Don't forget sunscreen if exercising outside.",
    'cloudy': "Comfortable weather for most activities.",
    'rainy': "Rainy day - perfect for indoor reflection and planning.",
    'partly cloudy': "Nice balanced weather for any type of activity!"
  };

  return advice[condition] || "Whatever the weather, you can adapt your goals to fit!";
}

async function getMotivationQuote(category?: string) {
  const quotes = {
    fitness: [
      "The only bad workout is the one that didn't happen.",
      "Your body can do it. It's your mind you need to convince.",
      "Fitness is not about being better than someone else. It's about being better than you used to be.",
      "The groundwork for all happiness is good health.",
      "Take care of your body. It's the only place you have to live."
    ],
    wellness: [
      "Self-care is not a luxury. It's a necessity.",
      "You are enough just as you are. Each moment you choose yourself, you grow.",
      "Mental health is not a destination, but a process.",
      "Be patient with yourself. You are growing daily.",
      "Your mental health is a priority. Your happiness is essential."
    ],
    career: [
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "The way to get started is to quit talking and begin doing.",
      "Innovation distinguishes between a leader and a follower.",
      "Your limitation—it's only your imagination.",
      "Don't wait for opportunity. Create it."
    ],
    general: [
      "Progress, not perfection.",
      "Small steps daily lead to big changes yearly.",
      "You are capable of amazing things.",
      "Every day is a new beginning.",
      "Believe in yourself and all that you are."
    ]
  };

  const categoryQuotes = quotes[category as keyof typeof quotes] || quotes.general;
  const randomQuote = categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
  
  return {
    quote: randomQuote,
    category: category || 'general',
    author: 'MentorMate Collection'
  };
}

async function getHealthTip(category?: string) {
  const tips = {
    nutrition: [
      "Try to fill half your plate with vegetables at each meal.",
      "Drink a glass of water before each meal to help with hydration and portion control.",
      "Include protein in every meal to help maintain stable energy levels.",
      "Choose whole grains over refined grains when possible.",
      "Eat slowly and mindfully to improve digestion and satisfaction."
    ],
    exercise: [
      "Take the stairs instead of the elevator when possible.",
      "Try to get at least 150 minutes of moderate exercise per week.",
      "Include both cardio and strength training in your routine.",
      "Even 10 minutes of movement counts towards your daily activity.",
      "Listen to your body and rest when you need to."
    ],
    sleep: [
      "Aim for 7-9 hours of sleep each night for optimal health.",
      "Keep your bedroom cool, dark, and quiet for better sleep quality.",
      "Avoid screens for at least 1 hour before bedtime.",
      "Establish a consistent bedtime routine to signal your body it's time to sleep.",
      "If you can't fall asleep within 20 minutes, get up and do a quiet activity until you feel sleepy."
    ],
    mental: [
      "Practice deep breathing for 5 minutes to reduce stress.",
      "Take regular breaks throughout your day to reset your mind.",
      "Connect with nature, even if it's just looking out a window.",
      "Practice gratitude by writing down 3 things you're thankful for.",
      "Limit negative news consumption to protect your mental wellbeing."
    ]
  };

  const categoryTips = tips[category as keyof typeof tips] || tips.mental;
  const randomTip = categoryTips[Math.floor(Math.random() * categoryTips.length)];
  
  return {
    tip: randomTip,
    category: category || 'general',
    source: 'Health & Wellness Guidelines'
  };
}

async function getNewsSummary(category?: string) {
  // For demo purposes, return mock positive news
  const newsItems = {
    wellness: [
      "New research shows that just 10 minutes of daily meditation can improve focus and reduce anxiety.",
      "Scientists discover that spending time in nature for just 20 minutes can significantly lower stress hormones.",
      "Study finds that people who practice gratitude are 25% happier and have better relationships."
    ],
    technology: [
      "AI breakthrough helps doctors detect diseases earlier with 95% accuracy.",
      "New sustainable technology converts ocean plastic into useful materials.",
      "Breakthrough in renewable energy storage could revolutionize clean power."
    ],
    fitness: [
      "Research confirms that regular walking can add years to your life and improve brain health.",
      "New study shows strength training just twice a week provides significant health benefits.",
      "Scientists find that even short bursts of activity throughout the day boost metabolism."
    ],
    general: [
      "Community gardens are sprouting up worldwide, bringing people together and improving local food security.",
      "Global literacy rates reach all-time high as educational access expands.",
      "Renewable energy becomes cheapest power source in most countries worldwide."
    ]
  };

  const categoryNews = newsItems[category as keyof typeof newsItems] || newsItems.general;
  const randomNews = categoryNews[Math.floor(Math.random() * categoryNews.length)];
  
  return {
    headline: randomNews,
    category: category || 'general',
    source: 'Positive News Network',
    summary: "Positive developments in " + (category || 'various fields') + " continue to show progress and hope."
  };
}