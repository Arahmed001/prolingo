import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LeaderboardUser {
  id: string;
  name: string;
  photoURL?: string;
  xp: number;
  level: number;
  streak: number;
  rewards: string[];
}

interface LeaderboardProps {
  className?: string;
  limitCount?: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  className = '',
  limitCount = 10
}) => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeframe]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      // Create a query against the users collection, ordered by XP
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('xp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(usersQuery);
      const leaderboardData: LeaderboardUser[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as Omit<LeaderboardUser, 'id'>;
        leaderboardData.push({
          id: doc.id,
          ...userData
        });
      });
      
      setUsers(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrdinalSuffix = (i: number) => {
    const j = i % 10;
    const k = i % 100;
    if (j === 1 && k !== 11) {
      return i + "st";
    }
    if (j === 2 && k !== 12) {
      return i + "nd";
    }
    if (j === 3 && k !== 13) {
      return i + "rd";
    }
    return i + "th";
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Leaderboard</h2>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1 text-sm rounded-full ${
              timeframe === 'weekly' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1 text-sm rounded-full ${
              timeframe === 'monthly' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setTimeframe('allTime')}
            className={`px-3 py-1 text-sm rounded-full ${
              timeframe === 'allTime' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user, index) => (
                <div 
                  key={user.id}
                  className={`flex items-center p-3 rounded-lg ${
                    index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                    index === 1 ? 'bg-gray-50 border border-gray-200' :
                    index === 2 ? 'bg-amber-50 border border-amber-200' :
                    'bg-white border border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 mr-4 font-bold">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : getOrdinalSuffix(index + 1)}
                  </div>
                  
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.name} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user.name?.charAt(0) || 'U'
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="font-medium">{user.name || 'Anonymous User'}</div>
                    <div className="text-xs text-gray-500">Level {user.level || 1}</div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="font-bold text-blue-600">{user.xp} XP</div>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="mr-1">🔥</span>
                      <span>{user.streak || 0} day streak</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found for this timeframe.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard; 