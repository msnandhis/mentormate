import React, { useState } from 'react';
import { Plus, X, Target, Lightbulb } from 'lucide-react';

interface GoalSettingProps {
  goals: string[];
  onUpdateGoals: (goals: string[]) => void;
}

const goalSuggestions = [
  'Exercise 3 times per week',
  'Read for 30 minutes daily',
  'Meditate for 10 minutes',
  'Drink 8 glasses of water',
  'Get 8 hours of sleep',
  'Write in a journal',
  'Practice gratitude',
  'Learn a new skill',
  'Cook healthy meals',
  'Take a daily walk',
  'Limit social media time',
  'Call family/friends weekly',
];

export const GoalSetting: React.FC<GoalSettingProps> = ({
  goals,
  onUpdateGoals,
}) => {
  const [newGoal, setNewGoal] = useState('');

  const addGoal = () => {
    if (newGoal.trim() && !goals.includes(newGoal.trim())) {
      onUpdateGoals([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    onUpdateGoals(goals.filter((_, i) => i !== index));
  };

  const addSuggestedGoal = (suggestion: string) => {
    if (!goals.includes(suggestion)) {
      onUpdateGoals([...goals, suggestion]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addGoal();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
          Set Your Daily Goals
        </h2>
        <p className="font-body text-lg text-neutral-600">
          Define 1-5 goals that you want to work on consistently. Your AI mentor will help keep you accountable.
        </p>
      </div>

      {/* Add New Goal */}
      <div className="mb-8">
        <label className="block font-body font-medium text-foreground mb-3">
          Add a personal goal
        </label>
        <div className="flex space-x-3">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Exercise for 30 minutes"
            className="flex-1 px-4 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            maxLength={100}
          />
          <button
            onClick={addGoal}
            disabled={!newGoal.trim()}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Current Goals */}
      {goals.length > 0 && (
        <div className="mb-8">
          <h3 className="font-body font-medium text-foreground mb-4">
            Your Goals ({goals.length}/5)
          </h3>
          <div className="space-y-3">
            {goals.map((goal, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-primary-50 border border-primary-200 rounded-lg"
              >
                <span className="font-body text-primary-800">{goal}</span>
                <button
                  onClick={() => removeGoal(index)}
                  className="p-1 text-primary-600 hover:text-primary-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Suggestions */}
      {goals.length < 5 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="w-5 h-5 text-warning" />
            <h3 className="font-body font-medium text-foreground">
              Popular Goals
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {goalSuggestions
              .filter(suggestion => !goals.includes(suggestion))
              .slice(0, 8)
              .map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => addSuggestedGoal(suggestion)}
                  className="p-3 text-left bg-white border border-border rounded-lg hover:border-primary-200 hover:bg-primary-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-body text-neutral-700 group-hover:text-primary-700">
                      {suggestion}
                    </span>
                    <Plus className="w-4 h-4 text-neutral-400 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Validation Message */}
      {goals.length === 0 && (
        <div className="mt-6 p-4 bg-warning-50 border border-warning-200 rounded-lg">
          <p className="font-body text-warning-700 text-center">
            Please add at least one goal to continue with your setup.
          </p>
        </div>
      )}

      {goals.length >= 5 && (
        <div className="mt-6 p-4 bg-info-50 border border-info-200 rounded-lg">
          <p className="font-body text-info-700 text-center">
            You've reached the maximum of 5 goals. You can always modify these later in your profile.
          </p>
        </div>
      )}
    </div>
  );
};