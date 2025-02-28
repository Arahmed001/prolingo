import React from 'react';
import Image from 'next/image';

interface Reward {
  name: string;
  description: string;
  icon: string;
  date: Date;
  type: 'badge' | 'achievement' | 'certificate';
}

interface RewardsBadgesProps {
  rewards: Reward[];
  className?: string;
}

const defaultRewards: Reward[] = [
  {
    name: 'First Lesson',
    description: 'Completed your first lesson',
    icon: '🎓',
    date: new Date(),
    type: 'achievement'
  },
  {
    name: 'Perfect Score',
    description: 'Achieved 100% on a quiz',
    icon: '🏆',
    date: new Date(),
    type: 'badge'
  },
  {
    name: '3-Day Streak',
    description: 'Logged in for 3 consecutive days',
    icon: '🔥',
    date: new Date(),
    type: 'achievement'
  }
];

const RewardsBadges: React.FC<RewardsBadgesProps> = ({ 
  rewards = defaultRewards,
  className = ''
}) => {
  return (
    <div className={`${className}`}>
      <h2 className="text-xl font-bold mb-4">Your Rewards & Badges</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {rewards.map((reward, index) => (
          <div 
            key={index}
            className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="text-4xl mb-2">{reward.icon}</div>
            <h3 className="font-semibold text-sm">{reward.name}</h3>
            <p className="text-xs text-gray-600 mt-1">{reward.description}</p>
            <div className="mt-2 text-xs text-gray-500">
              {reward.date.toLocaleDateString()}
            </div>
            <div className={`mt-1 text-xs px-2 py-0.5 rounded-full ${
              reward.type === 'badge' 
                ? 'bg-blue-100 text-blue-800' 
                : reward.type === 'achievement'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-purple-100 text-purple-800'
            }`}>
              {reward.type}
            </div>
          </div>
        ))}
      </div>
      
      {rewards.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-2">🏅</div>
          <p className="text-gray-600">Complete lessons and challenges to earn rewards!</p>
        </div>
      )}
    </div>
  );
};

export default RewardsBadges; 