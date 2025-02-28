"use client";

import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp
} from 'firebase/firestore';

interface RedemptionRecord {
  id: string;
  userId: string;
  rewardId: string;
  rewardTitle: string;
  cost: number;
  redeemedAt: Timestamp;
}

interface RewardHistoryProps {
  userId: string;
  limit?: number;
}

export default function RewardHistory({ userId, limit: historyLimit = 5 }: RewardHistoryProps) {
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRedemptionHistory = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const redemptionsQuery = query(
          collection(db, 'redemptions'),
          where('userId', '==', userId),
          orderBy('redeemedAt', 'desc'),
          limit(historyLimit)
        );
        
        const redemptionsSnapshot = await getDocs(redemptionsQuery);
        const redemptionsData: RedemptionRecord[] = [];
        
        redemptionsSnapshot.forEach((doc) => {
          redemptionsData.push({ id: doc.id, ...doc.data() } as RedemptionRecord);
        });
        
        setRedemptions(redemptionsData);
      } catch (error) {
        console.error('Error fetching redemption history:', error);
        setError('Failed to load reward history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRedemptionHistory();
  }, [userId, historyLimit]);

  if (loading) {
    return <div className="py-3 text-center text-gray-500">Loading reward history...</div>;
  }
  
  if (error) {
    return <div className="py-3 text-center text-red-500">{error}</div>;
  }
  
  if (redemptions.length === 0) {
    return (
      <div className="py-3 text-center text-gray-500">
        No rewards redeemed yet. Start earning points to unlock rewards!
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-md font-medium text-gray-700 mb-2">Recent Redemptions</h3>
      <div className="overflow-hidden rounded-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {redemptions.map((redemption) => (
            <li key={redemption.id} className="p-3 hover:bg-gray-50">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-800">{redemption.rewardTitle}</p>
                  <p className="text-sm text-gray-500">
                    {redemption.redeemedAt && typeof redemption.redeemedAt.toDate === 'function'
                      ? redemption.redeemedAt.toDate().toLocaleDateString()
                      : 'Date not available'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-medium text-primary">{redemption.cost} pts</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 