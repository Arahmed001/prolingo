"use client";

// Add this line to prevent static pre-rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, doc, updateDoc, increment, limit, where, getDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { db, auth } from '../../lib/firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { onAuthStateChanged } from 'firebase/auth';

interface UserContent {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: Date;
  votes: number;
}

interface Review {
  id: string;
  contentId: string;
  rating: number;
  comment: string;
  reviewer: string;
  timestamp: Date;
}

export default function CommunityPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState<UserContent[]>([]);
  const [topContent, setTopContent] = useState<Array<UserContent & { averageRating: number }>>([]);
  const [selectedPost, setSelectedPost] = useState<UserContent | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [contentSubmitting, setContentSubmitting] = useState(false);

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchData();
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch all data
  const fetchData = async () => {
    try {
      await Promise.all([
        fetchPosts(),
        fetchTopContent()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Fetch existing posts
  const fetchPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, 'user-content'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(postsQuery);
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as UserContent[];
      setPosts(fetchedPosts);
      return fetchedPosts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  };

  // Fetch top-rated content
  const fetchTopContent = async () => {
    try {
      // First get all reviews to calculate average ratings
      const reviewsQuery = query(
        collection(db, 'reviews'),
        orderBy('timestamp', 'desc')
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const allReviews = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Review[];

      // Group reviews by contentId and calculate average rating
      const contentRatings: { [key: string]: { totalRating: number; count: number } } = {};
      allReviews.forEach(review => {
        if (!contentRatings[review.contentId]) {
          contentRatings[review.contentId] = { totalRating: 0, count: 0 };
        }
        contentRatings[review.contentId].totalRating += review.rating;
        contentRatings[review.contentId].count += 1;
      });

      // Find content with average rating > 3
      const highRatedContentIds = Object.entries(contentRatings)
        .filter(([_, data]) => data.totalRating / data.count > 3)
        .map(([contentId, _]) => contentId);

      if (highRatedContentIds.length === 0) {
        setTopContent([]);
        return;
      }

      // Fetch the content documents for these IDs
      const contentDocs = await Promise.all(
        highRatedContentIds.map(async (contentId) => {
          const contentDoc = await getDoc(doc(db, 'user-content', contentId));
          if (contentDoc.exists()) {
            const data = contentDoc.data();
            return {
              id: contentDoc.id,
              ...data,
              timestamp: data.timestamp?.toDate() || new Date(),
              averageRating: contentRatings[contentId].totalRating / contentRatings[contentId].count
            };
          }
          return null;
        })
      );

      // Filter out null values and sort by average rating
      const topContentData = contentDocs
        .filter(item => item !== null)
        .sort((a, b) => b!.averageRating - a!.averageRating)
        .slice(0, 3) as Array<UserContent & { averageRating: number }>;

      setTopContent(topContentData);
    } catch (error) {
      console.error("Error fetching top content:", error);
    }
  };

  // Fetch reviews for a specific post
  const fetchReviews = async (contentId: string) => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('contentId', '==', contentId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(reviewsQuery);
      const fetchedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Review[];
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  // Submit new content
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert("Please enter both a title and content.");
      return;
    }

    setContentSubmitting(true);

    try {
      await addDoc(collection(db, 'user-content'), {
        title,
        content,
        author: user.email,
        timestamp: serverTimestamp(),
        votes: 0
      });

      setTitle('');
      setContent('');
      await fetchPosts();
      await fetchTopContent();
      setContentSubmitting(false);
    } catch (error) {
      console.error('Error adding post:', error);
      setContentSubmitting(false);
      alert("Failed to submit your content. Please try again.");
    }
  };

  // Handle upvoting content
  const handleUpvote = async (postId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const postRef = doc(db, 'user-content', postId);
      await updateDoc(postRef, {
        votes: increment(1)
      });

      // Update local state
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, votes: post.votes + 1 } : post
      ));

      // Also update in top content if present
      setTopContent(prevTopContent => 
        prevTopContent.map(post =>
          post.id === postId ? { ...post, votes: post.votes + 1 } : post
        )
      );
    } catch (error) {
      console.error('Error upvoting post:', error);
      alert("Failed to upvote. Please try again.");
    }
  };

  // Handle keyboard events for upvoting
  const handleUpvoteKeyDown = (e: React.KeyboardEvent, postId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleUpvote(postId);
    }
  };

  // Open review form for a post
  const openReviewForm = (post: UserContent) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setSelectedPost(post);
    fetchReviews(post.id);
    setShowReviewForm(true);
    setRating(0);
    setReviewComment('');
  };

  // Handle keyboard events for opening review form
  const handleOpenReviewKeyDown = (e: React.KeyboardEvent, post: UserContent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openReviewForm(post);
    }
  };

  // Submit a review
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPost) return;

    if (rating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }

    setReviewSubmitting(true);

    try {
      await addDoc(collection(db, 'reviews'), {
        contentId: selectedPost.id,
        rating,
        comment: reviewComment,
        reviewer: user.email,
        timestamp: serverTimestamp()
      });

      // Refresh reviews
      await fetchReviews(selectedPost.id);
      
      // Refresh top content as this might affect it
      await fetchTopContent();
      
      setRating(0);
      setReviewComment('');
      setReviewSubmitting(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewSubmitting(false);
      alert("Failed to submit your review. Please try again.");
    }
  };

  // Handle star rating keyboard selection
  const handleStarKeyDown = (e: React.KeyboardEvent, starRating: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setRating(starRating);
    }
  };

  // Close review form
  const closeReviewForm = () => {
    setShowReviewForm(false);
    setSelectedPost(null);
  };

  // Function to add sample data (only for development)
  const addSampleData = async () => {
    if (!user) return;

    try {
      // Add sample user content
      const contentRef1 = await addDoc(collection(db, 'user-content'), {
        title: 'A1 Tips',
        content: 'Practice daily with ProLingo to improve your vocabulary retention. Start with simple greetings and common phrases.',
        author: 'test@prolingo.com',
        timestamp: serverTimestamp(),
        votes: 0
      });

      const contentRef2 = await addDoc(collection(db, 'user-content'), {
        title: 'My Learning Journey',
        content: 'I started at A1 level and now I\'m at B1. Here\'s what helped me: daily practice, watching movies with subtitles, and using ProLingo!',
        author: 'user1@prolingo.com',
        timestamp: serverTimestamp(),
        votes: 5
      });

      const contentRef3 = await addDoc(collection(db, 'user-content'), {
        title: 'Best Resources for B2 Level',
        content: 'These resources helped me reach B2 level in just 6 months. Highly recommend the advanced lessons in ProLingo!',
        author: 'user2@prolingo.com',
        timestamp: serverTimestamp(),
        votes: 12
      });

      // Add sample reviews
      await addDoc(collection(db, 'reviews'), {
        contentId: contentRef1.id,
        rating: 4,
        comment: 'Very helpful for beginners like me!',
        reviewer: 'test@prolingo.com',
        timestamp: serverTimestamp()
      });

      await addDoc(collection(db, 'reviews'), {
        contentId: contentRef2.id,
        rating: 5,
        comment: 'Inspiring journey. Thanks for sharing!',
        reviewer: 'test@prolingo.com',
        timestamp: serverTimestamp()
      });

      await addDoc(collection(db, 'reviews'), {
        contentId: contentRef3.id,
        rating: 3,
        comment: 'Good info but I would add more specifics.',
        reviewer: 'user1@prolingo.com',
        timestamp: serverTimestamp()
      });

      // Refresh data
      await fetchData();
      
      alert("Sample data added successfully!");
    } catch (error) {
      console.error('Error adding sample data:', error);
      alert("Failed to add sample data.");
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Render star rating
  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={interactive ? () => setRating(star) : undefined}
            onKeyDown={interactive ? (e) => handleStarKeyDown(e, star) : undefined}
            className={`${interactive ? 'cursor-pointer' : ''} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } text-xl`}
            disabled={!interactive}
            aria-label={interactive ? `Rate ${star} star${star !== 1 ? 's' : ''}` : `Rated ${rating} star${rating !== 1 ? 's' : ''}`}
            aria-pressed={interactive && star <= rating}
            tabIndex={interactive ? 0 : -1}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main id="main-content" className="flex-grow bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Community</h1>
            <p className="mt-2 text-gray-600">Share and discover learning resources with other ProLingo users</p>
          </div>
          
          {/* Top Content Section */}
          <section aria-labelledby="top-content-heading" className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 id="top-content-heading" className="text-lg font-medium text-gray-900">Top Rated Content</h2>
              <span className="text-sm text-gray-500">Community favourites with ratings over 3 stars</span>
            </div>
            
            {topContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topContent.map((post) => (
                  <div 
                    key={post.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow" 
                    tabIndex={0}
                  >
                    <h3 className="font-bold text-blue-600">{post.title}</h3>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-3">{post.content}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center" aria-label={`Rated ${post.averageRating.toFixed(1)} out of 5 stars`}>
                        {renderStars(post.averageRating)}
                        <span className="ml-1 text-sm text-gray-600">({post.averageRating.toFixed(1)})</span>
                      </div>
                      <button 
                        onClick={() => handleUpvote(post.id)}
                        onKeyDown={(e) => handleUpvoteKeyDown(e, post.id)}
                        className="flex items-center text-sm text-gray-500 hover:text-blue-600"
                        aria-label={`Upvote this post (currently ${post.votes} votes)`}
                        tabIndex={0}
                      >
                        <span className="mr-1" aria-hidden="true">▲</span> {post.votes}
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Posted by {post.author}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">
                No top-rated content yet. Be the first to contribute quality resources!
              </p>
            )}
          </section>
          
          {/* Content creation form */}
          <section aria-labelledby="share-content-heading" className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 id="share-content-heading" className="text-lg font-medium text-gray-900 mb-4">Share Your Knowledge</h2>
            {user ? (
              <form onSubmit={handleSubmit} className="space-y-4" aria-label="Content submission form">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Give your content a descriptive title"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Share your language learning tips, resources, or questions..."
                    required
                    aria-required="true"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={contentSubmitting}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      contentSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    aria-busy={contentSubmitting}
                  >
                    {contentSubmitting ? 'Submitting...' : 'Share'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-blue-50 rounded-md p-4">
                <p className="text-sm text-blue-700">
                  Please <a href="/login" className="font-bold underline" tabIndex={0}>log in</a> to share content.
                </p>
              </div>
            )}
          </section>
          
          {/* Recent Content */}
          <section aria-labelledby="recent-content-heading" className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 id="recent-content-heading" className="text-lg font-medium text-gray-900">Recent Community Content</h2>
              {user && (
                <button
                  onClick={addSampleData}
                  className="text-xs text-gray-500 hover:text-blue-600"
                  aria-label="Add sample data for development purposes"
                  tabIndex={0}
                >
                  + Add Sample Data (Dev)
                </button>
              )}
            </div>
            
            {loading ? (
              <div className="p-6 text-center text-gray-500" aria-live="polite">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" aria-hidden="true"></div>
                <p>Loading content...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No content yet. Be the first to share your knowledge!
              </div>
            ) : (
              <ul className="divide-y divide-gray-200" aria-label="Community posts">
                {posts.map((post) => (
                  <li key={post.id} className="hover:bg-gray-50 transition-colors">
                    <div className="px-6 py-4">
                      <h3 className="text-lg font-medium text-blue-600">{post.title}</h3>
                      <p className="mt-1 text-gray-700">{post.content}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Posted by {post.author}</span>
                          <span aria-hidden="true">•</span>
                          <span>{formatDate(post.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => handleUpvote(post.id)}
                            onKeyDown={(e) => handleUpvoteKeyDown(e, post.id)}
                            className="flex items-center text-sm text-gray-500 hover:text-blue-600"
                            aria-label={`Upvote this post (currently ${post.votes} votes)`}
                            tabIndex={0}
                          >
                            <span className="mr-1" aria-hidden="true">▲</span> {post.votes}
                          </button>
                          <button
                            onClick={() => openReviewForm(post)}
                            onKeyDown={(e) => handleOpenReviewKeyDown(e, post)}
                            className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                            aria-label={`Review post: ${post.title}`}
                            tabIndex={0}
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      
      {/* Review Modal */}
      {showReviewForm && selectedPost && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-labelledby="review-dialog-title"
          aria-modal="true"
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            tabIndex={-1}
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 id="review-dialog-title" className="text-lg font-medium text-gray-900">Review Content</h3>
              <p className="text-sm text-gray-600 mt-1">"{selectedPost.title}"</p>
            </div>
            <div className="p-6">
              <form onSubmit={submitReview} className="space-y-4" aria-label="Review submission form">
                <div>
                  <label id="rating-label" className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center" role="radiogroup" aria-labelledby="rating-label">
                    {renderStars(rating, true)}
                    <span className="ml-2 text-gray-600">
                      {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select a rating'}
                    </span>
                  </div>
                </div>
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                    Comment (optional)
                  </label>
                  <textarea
                    id="comment"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Share your thoughts on this content..."
                    aria-required="false"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeReviewForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    tabIndex={0}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting || rating === 0}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      reviewSubmitting || rating === 0 ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    aria-busy={reviewSubmitting}
                    aria-disabled={rating === 0}
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
              
              {/* Existing reviews */}
              {reviews.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-md font-medium text-gray-900 mb-3" id="existing-reviews-heading">Existing Reviews</h4>
                  <div className="space-y-4" aria-labelledby="existing-reviews-heading" aria-live="polite">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-t pt-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                            <span className="ml-2 text-sm text-gray-600">
                              by {review.reviewer}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(review.timestamp)}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="mt-1 text-sm text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
} 