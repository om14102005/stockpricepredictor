import React from 'react';
import { Users, Brain, Zap, TrendingUp } from 'lucide-react';

interface RecommendationTabsProps {
  activeTab: 'popular' | 'content' | 'collaborative' | 'hybrid';
  onTabChange: (tab: 'popular' | 'content' | 'collaborative' | 'hybrid') => void;
  userRatingsCount: number;
}

export function RecommendationTabs({ activeTab, onTabChange, userRatingsCount }: RecommendationTabsProps) {
  const tabs = [
    {
      id: 'popular' as const,
      label: 'Popular',
      icon: TrendingUp,
      description: 'Trending movies',
      disabled: false
    },
    {
      id: 'content' as const,
      label: 'For You',
      icon: Brain,
      description: 'Based on your taste',
      disabled: userRatingsCount === 0
    },
    {
      id: 'collaborative' as const,
      label: 'Similar Users',
      icon: Users,
      description: 'Users like you enjoyed',
      disabled: userRatingsCount === 0
    },
    {
      id: 'hybrid' as const,
      label: 'Best Match',
      icon: Zap,
      description: 'Perfect recommendations',
      disabled: userRatingsCount === 0
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2">
      <div className="grid grid-cols-4 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDisabled = tab.disabled;
          
          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              disabled={isDisabled}
              className={`relative p-4 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : isDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : isDisabled ? 'text-gray-400' : 'text-gray-600'}`} />
                <div className="text-center">
                  <div className={`font-medium text-sm ${isActive ? 'text-white' : isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                    {tab.label}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-blue-100' : isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                    {tab.description}
                  </div>
                </div>
              </div>
              
              {isDisabled && userRatingsCount === 0 && (
                <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full px-2 py-1">
                  Rate movies first
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}