import { ImageMetadata } from '../types';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  deleteDoc, 
  doc, 
  limit,
  updateDoc,
  increment 
} from "firebase/firestore";

const COLLECTION_NAME = "images";

export const storageService = {
  getAll: async (): Promise<ImageMetadata[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImageMetadata));
    } catch (error) {
      console.error("Error fetching images: ", error);
      return [];
    }
  },

  getRelated: async (currentImage: ImageMetadata, limitCount = 5): Promise<ImageMetadata[]> => {
    try {
      const all = await storageService.getAll();
      return all
        .filter(img => img.id !== currentImage.id)
        .map(img => {
          let score = 0;
          // High weight for same category
          if (img.category === currentImage.category) score += 10;
          // Weight for each shared keyword
          const commonKeywords = img.keywords.filter(k => 
            currentImage.keywords.some(ck => ck.toLowerCase() === k.toLowerCase())
          );
          score += commonKeywords.length * 2;
          return { img, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limitCount)
        .map(item => item.img);
    } catch (error) {
      console.error("Error fetching related images: ", error);
      return [];
    }
  },

  save: async (image: Omit<ImageMetadata, 'id'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), image);
      return docRef.id;
    } catch (error) {
      console.error("Error adding image: ", error);
      throw error;
    }
  },

  delete: async (docId: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, docId));
    } catch (error) {
      console.error("Error deleting image: ", error);
      throw error;
    }
  },

  incrementDownloadCount: async (id: string) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        downloadCount: increment(1)
      });
    } catch (error) {
      console.error("Error incrementing download count: ", error);
    }
  },

  getBySlug: async (slug: string): Promise<ImageMetadata | undefined> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), where("slug", "==", slug), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const d = querySnapshot.docs[0];
        return { id: d.id, ...d.data() } as ImageMetadata;
      }
      return undefined;
    } catch (error) {
      console.error("Error fetching image by slug: ", error);
      return undefined;
    }
  },

  getById: async (id: string): Promise<ImageMetadata | undefined> => {
     try {
      const querySnapshot = await getDocs(query(collection(db, COLLECTION_NAME)));
      const d = querySnapshot.docs.find(doc => doc.id === id);
      return d ? { id: d.id, ...d.data() } as ImageMetadata : undefined;
    } catch (error) {
      console.error("Error fetching image by ID: ", error);
      return undefined;
    }
  }
};