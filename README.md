# MentorMate - One App for Every Goal


[Live Demo: mentor-mate.netlify.app](https://mentor-mate.netlify.app)


## About MentorMate

MentorMate is an AI-powered accountability platform that transforms habit building through personalized AI mentorship. Our application bridges the gap between intention and action with intelligent, adaptive AI mentors who provide customized guidance, motivation, and insights to help users achieve their goals.

## Features

### 🎯 Personalized AI Mentorship
- Choose from multiple AI mentor personalities (fitness, wellness, study, career)
- Create custom mentors with unique personalities, expertise, and voice
- Receive personalized guidance based on your goals and progress

### 🎥 Dynamic Video Interactions
- Daily video check-ins with your AI mentor
- Live video conversations for deeper guidance
- AI-generated responses tailored to your mood, goals, and progress

### 📊 Intelligent Analytics
- Track mood trends and goal completion rates
- Visualize your progress with interactive charts
- Get AI-powered insights on your patterns and habits

### ⚡ Smart Support System
- Proactive nudges when your mentor notices patterns
- Goal recommendations based on your performance
- Streak tracking and consistency monitoring

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and development server
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Interactive data visualizations
- **Lucide React** - Icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - Authentication
  - PostgreSQL Database
  - Storage
  - Edge Functions (serverless)

### AI Integration
- **OpenAI GPT-4o-mini** - Natural language processing for mentor interactions
- **Tavus API** - AI video generation and live conversations

### Deployment
- **Netlify** - Web hosting and deployment

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase account
- OpenAI API key
- Tavus API key (for video features)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/mentormate.git
cd mentormate
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TAVUS_API_KEY=your_tavus_api_key
```

4. Start the development server
```bash
npm run dev
```

5. Navigate to `http://localhost:5173` in your browser

## Project Structure

```
mentormate/
├── src/
│   ├── components/     # React components
│   │   ├── auth/       # Authentication components
│   │   ├── chat/       # Chat interface components
│   │   ├── checkin/    # Check-in flow components
│   │   ├── common/     # Common UI components
│   │   ├── dashboard/  # Dashboard components
│   │   ├── mentors/    # Mentor selection and management
│   │   └── ...
│   ├── contexts/       # React context providers
│   ├── lib/            # Utility functions and API clients
│   └── ...
├── supabase/
│   ├── functions/      # Supabase Edge Functions
│   └── migrations/     # Database migrations
└── ...
```

## Features in Detail

### AI Mentors

MentorMate offers several specialized AI mentors:

- **Coach Lex** - Energetic fitness coach focused on motivation and movement
- **ZenKai** - Mindful wellness guide for mental well-being and balance
- **Prof. Sophia** - Analytical study mentor for academic and learning goals
- **Dr. Maya** - Strategic career advisor for professional development

Each mentor has a unique personality, communication style, and expertise area to provide specialized guidance.

### Check-in System

The daily check-in process includes:
1. Mood tracking
2. Goal progress updates
3. Reflective journaling
4. Personalized video response from your AI mentor

### Live Video Conversations

Users can initiate real-time video conversations with their AI mentor for:
- In-depth coaching
- Immediate guidance
- Goal strategy sessions
- Motivational support

## Screenshots

*[Include screenshots of key features like the dashboard, mentor selection, check-in flow, and analytics]*

## Roadmap

- Mobile applications (iOS and Android)
- Integration with fitness trackers and health apps
- Community features for shared accountability
- Additional mentor personalities and specializations
- Enhanced predictive analytics for habit formation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Tavus](https://tavus.io) - For their powerful AI video technology
- [Supabase](https://supabase.io) - For their excellent backend platform
- [OpenAI](https://openai.com) - For their GPT models
- [Pexels](https://pexels.com) - For the free stock images used in the project

## Contact

For questions or feedback about MentorMate, please reach out to [your-email@example.com](mailto:your-email@example.com).
