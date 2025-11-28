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
    const commentData = {
      ...comment,
      time: Date.now(),
      createdAt: Timestamp.now()
    };
    
    // Store in a subcollection 'comments' under the specific movie document
    await addDoc(collection(db, 'movies', movieId, 'comments'), commentData);
    return commentData;
  },

  // Get all comments for a movie
  async getComments(movieId: string): Promise<Comment[]> {
    const q = query(
      collection(db, 'movies', movieId, 'comments'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            name: data.name,
            message: data.message,
            time: data.time
        };
    });
  }
};
