import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Mentor, mentors as mentorService } from '../../lib/supabase';
import { MentorCard } from './MentorCard';

interface MentorSelectorProps {
  selectedMentor?: Mentor | null;
  onSelectMentor: (mentor: Mentor) => void;
  showCustomMentors?: boolean;
  filterByCategory?: string;
  size?: 'small' | 'medium' | 'large';
  title?: string;
  description?: string;
}

export const MentorSelector: React.FC<MentorSelectorProps> = ({
  selectedMentor,
  onSelectMentor,
  showCustomMentors = false,
  filterByCategory,
  size = 'medium',
  title = "Choose Your Mentor",
  description = "Select a mentor that matches your current goals and mindset.",
}) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(filterByCategory || 'all');

  useEffect(() => {
    loadMentors();
  }, []);

  useEffect(() => {
    filterMentors();
  }, [mentors, searchTerm, categoryFilter, showCustomMentors]);

  const loadMentors = async () => {
    try {
      const { mentors: mentorList } = await mentorService.getAll();
      setMentors(mentorList);
    } catch (error) {
      console.error('Error loading mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMentors = () => {
    let filtered = mentors;

    // Filter by custom vs regular mentors
    if (!showCustomMentors) {
      filtered = filtered.filter(mentor => !mentor.is_custom);
    }

    // Filter by category
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(mentor => mentor.category === categoryFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(mentor => 
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.expertise?.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredMentors(filtered);
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'study', label: 'Study & Learning' },
    { value: 'career', label: 'Career & Focus' },
    ...(showCustomMentors ? [{ value: 'custom', label: 'Custom' }] : []),
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-neutral-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
          {title}
        </h2>
        <p className="font-body text-lg text-neutral-600">
          {description}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search mentors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        {/* Category Filter */}
        {!filterByCategory && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-11 pr-8 py-3 border border-border rounded-lg font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none bg-white"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Mentors Grid */}
      <div className={`grid gap-6 ${
        size === 'small' ? 'md:grid-cols-3 lg:grid-cols-4' :
        size === 'medium' ? 'md:grid-cols-2 lg:grid-cols-3' :
        'md:grid-cols-2'
      }`}>
        {filteredMentors.map((mentor) => (
          <MentorCard
            key={mentor.id}
            mentor={mentor}
            selected={selectedMentor?.id === mentor.id}
            onSelect={onSelectMentor}
            size={size}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredMentors.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            No mentors found
          </h3>
          <p className="font-body text-neutral-600 mb-4">
            Try adjusting your search or filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
            }}
            className="font-body px-4 py-2 text-primary hover:bg-primary-50 rounded-lg transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};