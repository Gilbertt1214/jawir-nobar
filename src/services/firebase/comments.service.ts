import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase.config';

export interface Comment {
  name: string;
  message: string;
  time: number;
}

export const commentsService = {
  // Add new comment to Firestore
  async addComment(movieId: string, comment: Omit<Comment, 'time'>): Promise<Comment> {
    console.log('Initiating addComment for movie:', movieId);
    const commentData = {
      ...comment,
      time: Date.now(),
      createdAt: Timestamp.now()
    };
    
    try {
      // Store in a subcollection 'comments' under the specific movie document
      // Add a 10-second timeout to prevent infinite pending state
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firebase operation timed out')), 10000)
      );

      await Promise.race([
        addDoc(collection(db, 'movies', movieId, 'comments'), commentData),
        timeoutPromise
      ]);
      
      console.log('Comment added successfully');
      return commentData;
    } catch (error) {
      console.error('Error in addComment:', error);
      throw error;
    }
  },

  // Get all comments for a movie
  async getComments(movieId: string): Promise<Comment[]> {
    console.log('Fetching comments for movie:', movieId);
    try {
      const q = query(
        collection(db, 'movies', movieId, 'comments'),
        orderBy('createdAt', 'desc')
      );
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firebase operation timed out')), 10000)
      );

      const snapshot = await Promise.race([
        getDocs(q),
        timeoutPromise
      ]) as any; // Type assertion needed for Promise.race result

      console.log('Comments fetched successfully, count:', snapshot.docs.length);
      return snapshot.docs.map((doc: any) => {
          const data = doc.data();
          return {
              name: data.name,
              message: data.message,
              time: data.time
          };
      });
    } catch (error) {
      console.error('Error in getComments:', error);
      throw error;
    }
  }
};
