import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  writeBatch,
  runTransaction,
  limit
} from 'firebase/firestore';
import { db } from './config';

// Collections
export const moviesCollection = collection(db, 'movies');
export const bookingsCollection = collection(db, 'bookings');
export const seatsCollection = collection(db, 'seats');
export const usersCollection = collection(db, 'users');

// Helper function to safely convert timestamps
const convertTimestamp = (timestamp) => {
  if (!timestamp) return new Date().toISOString();
  
  // If it's a Firestore Timestamp with toDate method
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  
  // If it's a string, return as is
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  
  // If it's a number (milliseconds), convert to Date
  if (typeof timestamp === 'number') {
    return new Date(timestamp).toISOString();
  }
  
  // Fallback to current date
  return new Date().toISOString();
};

// Get all movies
export const getMovies = async () => {
  try {
    const querySnapshot = await getDocs(query(moviesCollection, orderBy('createdAt', 'desc')));
    const movies = [];
    querySnapshot.forEach((doc) => {
      movies.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: movies };
  } catch (error) {
    console.error('Error fetching movies:', error);
    return { success: false, message: 'Error fetching movies' };
  }
};

// Get movie by ID
export const getMovieById = async (movieId) => {
  try {
    const movieDoc = await getDoc(doc(db, 'movies', movieId));
    if (movieDoc.exists()) {
      return { success: true, data: { id: movieDoc.id, ...movieDoc.data() } };
    } else {
      return { success: false, message: 'Movie not found' };
    }
  } catch (error) {
    console.error('Error fetching movie:', error);
    return { success: false, message: 'Error fetching movie' };
  }
};

// Get seats for a show
export const getSeats = async (movieId, showtime, showDate) => {
  try {
    const seatsQuery = query(
      seatsCollection,
      where('movieId', '==', movieId),
      where('showtime', '==', showtime),
      where('showDate', '==', showDate)
    );
    
    const querySnapshot = await getDocs(seatsQuery);
    const seats = [];
    querySnapshot.forEach((doc) => {
      seats.push({ id: doc.id, ...doc.data() });
    });

    // If no seats exist, create default layout
    if (seats.length === 0) {
      const defaultSeats = await createDefaultSeats(movieId, showtime, showDate);
      return { success: true, data: defaultSeats };
    }

    return { success: true, data: seats };
  } catch (error) {
    console.error('Error fetching seats:', error);
    return { success: false, message: 'Error fetching seats' };
  }
};

// Create default seat layout
const createDefaultSeats = async (movieId, showtime, showDate) => {
  try {
    const batch = writeBatch(db);
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 12;
    const defaultSeats = [];

    for (let row of rows) {
      for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
        const seatData = {
          movieId,
          showtime,
          showDate,
          seatNumber: seatNum.toString(),
          row,
          isBooked: false,
          createdAt: serverTimestamp()
        };

        const seatRef = doc(seatsCollection);
        batch.set(seatRef, seatData);
        defaultSeats.push({ id: seatRef.id, ...seatData });
      }
    }

    await batch.commit();
    return defaultSeats;
  } catch (error) {
    console.error('Error creating default seats:', error);
    return [];
  }
};

// Create booking with proper timestamp handling
export const createBooking = async (bookingData) => {
  try {
    console.log('Creating booking with data:', bookingData);
    
    const bookingReference = `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const booking = {
      userId: bookingData.userId,
      movieId: bookingData.movieId,
      movieTitle: bookingData.movieTitle,
      showtime: bookingData.showtime,
      showDate: bookingData.showDate,
      seats: bookingData.seats,
      totalAmount: bookingData.totalAmount,
      createdAt: serverTimestamp(),
      bookingReference,
      status: 'pending',
      paymentStatus: 'pending'
    };

    console.log('Saving booking to Firebase:', booking);
    
    const docRef = await addDoc(bookingsCollection, booking);
    
    console.log('Booking saved with ID:', docRef.id);
    
    return { 
      success: true, 
      bookingId: docRef.id, 
      bookingReference: bookingReference 
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, message: 'Error creating booking: ' + error.message };
  }
};

// Confirm booking with transaction
export const confirmBooking = async (bookingId, paymentId, seats, movieId, showtime, showDate, userId) => {
  try {
    console.log('Confirming booking:', bookingId);
    
    await runTransaction(db, async (transaction) => {
      // Update booking status
      const bookingRef = doc(db, 'bookings', bookingId);
      transaction.update(bookingRef, {
        status: 'confirmed',
        paymentStatus: 'completed',
        paymentId,
        confirmedAt: serverTimestamp()
      });

      // Permanently book seats
      for (let seat of seats) {
        const seatsQuery = query(
          seatsCollection,
          where('movieId', '==', movieId),
          where('showtime', '==', showtime),
          where('showDate', '==', showDate),
          where('seatNumber', '==', seat.seatNumber),
          where('row', '==', seat.row)
        );

        const querySnapshot = await getDocs(seatsQuery);
        querySnapshot.forEach((doc) => {
          transaction.update(doc.ref, {
            isBooked: true,
            bookedBy: userId,
            bookingId,
            bookedAt: serverTimestamp()
          });
        });
      }
    });

    console.log('Booking confirmed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error confirming booking:', error);
    return { success: false, message: 'Error confirming booking: ' + error.message };
  }
};

// Get user bookings with safe timestamp handling
export const getUserBookings = async (userId) => {
  try {
    console.log('Fetching bookings for user:', userId);
    
    let bookings = [];
    
    try {
      // Try the optimized query first (requires index)
      const bookingsQuery = query(
        bookingsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(bookingsQuery);
      
      for (const docSnapshot of querySnapshot.docs) {
        const bookingData = { id: docSnapshot.id, ...docSnapshot.data() };
        
        // Safe timestamp conversion
        bookingData.createdAt = convertTimestamp(bookingData.createdAt);
        
        // Convert other timestamps if they exist
        if (bookingData.confirmedAt) {
          bookingData.confirmedAt = convertTimestamp(bookingData.confirmedAt);
        }
        
        // Get movie details for each booking
        if (bookingData.movieId) {
          try {
            const movieResult = await getMovieById(bookingData.movieId);
            if (movieResult.success) {
              bookingData.movie = movieResult.data;
            }
          } catch (movieError) {
            console.warn('Failed to load movie details for booking:', bookingData.id);
          }
        }
        
        bookings.push(bookingData);
      }
      
    } catch (indexError) {
      console.log('Index not ready, using fallback query...');
      
      // Fallback: Simple query without orderBy
      const fallbackQuery = query(
        bookingsCollection,
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(fallbackQuery);
      const tempBookings = [];
      
      for (const docSnapshot of querySnapshot.docs) {
        const bookingData = { id: docSnapshot.id, ...docSnapshot.data() };
        
        // Safe timestamp conversion
        bookingData.createdAt = convertTimestamp(bookingData.createdAt);
        bookingData.sortDate = new Date(bookingData.createdAt);
        
        // Convert other timestamps if they exist
        if (bookingData.confirmedAt) {
          bookingData.confirmedAt = convertTimestamp(bookingData.confirmedAt);
        }
        
        // Get movie details for each booking
        if (bookingData.movieId) {
          try {
            const movieResult = await getMovieById(bookingData.movieId);
            if (movieResult.success) {
              bookingData.movie = movieResult.data;
            }
          } catch (movieError) {
            console.warn('Failed to load movie details for booking:', bookingData.id);
          }
        }
        
        tempBookings.push(bookingData);
      }
      
      // Sort manually by creation date (newest first)
      bookings = tempBookings.sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));
    }

    console.log('Successfully fetched bookings:', bookings.length);
    return { success: true, data: bookings };
    
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return { success: false, message: 'Error fetching bookings: ' + error.message };
  }
};

// Initialize sample movies
export const initializeSampleMovies = async () => {
  try {
    const existingMovies = await getDocs(moviesCollection);
    if (!existingMovies.empty) {
      return { success: true, message: 'Movies already initialized' };
    }

    const sampleMovies = [
      {
        title: "Avengers: Endgame",
        description: "The epic conclusion to the Infinity Saga that became a defining moment in cinematic history. After the devastating events of Infinity War, the universe is in ruins.",
        genre: ["Action", "Adventure", "Drama"],
        duration: 181,
        rating: 8.4,
        poster: "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_SX300.jpg",
        cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth", "Scarlett Johansson"],
        director: "Anthony & Joe Russo",
        language: "English",
        year: "2019",
        showtimes: [
          { time: "10:00 AM", price: 300 },
          { time: "2:00 PM", price: 350 },
          { time: "6:00 PM", price: 400 },
          { time: "10:00 PM", price: 350 }
        ],
        isActive: true,
        createdAt: serverTimestamp()
      },
      {
        title: "The Dark Knight",
        description: "Batman faces his greatest challenge yet in this critically acclaimed superhero thriller. When the menace known as the Joker wreaks havoc on Gotham.",
        genre: ["Action", "Crime", "Drama"],
        duration: 152,
        rating: 9.0,
        poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
        cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine", "Maggie Gyllenhaal"],
        director: "Christopher Nolan",
        language: "English",
        year: "2008",
        showtimes: [
          { time: "11:00 AM", price: 250 },
          { time: "3:00 PM", price: 300 },
          { time: "7:00 PM", price: 350 },
          { time: "11:00 PM", price: 300 }
        ],
        isActive: true,
        createdAt: serverTimestamp()
      },
      {
        title: "Inception",
        description: "A mind-bending thriller about dreams within dreams that challenges reality itself. Dom Cobb is a skilled thief in the dangerous art of extraction.",
        genre: ["Action", "Sci-Fi", "Thriller"],
        duration: 148,
        rating: 8.8,
        poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
        cast: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy", "Ellen Page", "Ken Watanabe"],
        director: "Christopher Nolan",
        language: "English",
        year: "2010",
        showtimes: [
          { time: "9:00 AM", price: 270 },
          { time: "1:00 PM", price: 320 },
          { time: "5:00 PM", price: 370 },
          { time: "9:00 PM", price: 320 }
        ],
        isActive: true,
        createdAt: serverTimestamp()
      },
      {
        title: "Interstellar",
        description: "A visually stunning space epic about humanity's journey to find a new home among the stars. Earth is becoming uninhabitable, forcing mankind to look to the stars.",
        genre: ["Adventure", "Drama", "Sci-Fi"],
        duration: 169,
        rating: 8.6,
        poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
        cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine", "Casey Affleck"],
        director: "Christopher Nolan",
        language: "English",
        year: "2014",
        showtimes: [
          { time: "10:30 AM", price: 290 },
          { time: "2:30 PM", price: 340 },
          { time: "6:30 PM", price: 390 },
          { time: "10:30 PM", price: 340 }
        ],
        isActive: true,
        createdAt: serverTimestamp()
      },
      {
        title: "The Shawshank Redemption",
        description: "A powerful story of hope and friendship set within the walls of a maximum-security prison. Two imprisoned men bond over years of common decency.",
        genre: ["Drama"],
        duration: 142,
        rating: 9.3,
        poster: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
        cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton", "William Sadler", "Clancy Brown"],
        director: "Frank Darabont",
        language: "English",
        year: "1994",
        showtimes: [
          { time: "11:30 AM", price: 230 },
          { time: "3:30 PM", price: 280 },
          { time: "7:30 PM", price: 330 },
          { time: "11:30 PM", price: 280 }
        ],
        isActive: true,
        createdAt: serverTimestamp()
      },
      {
        title: "Spider-Man: No Way Home",
        description: "Peter Parker's secret identity is revealed, forcing him to ask Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds appear.",
        genre: ["Action", "Adventure", "Sci-Fi"],
        duration: 148,
        rating: 8.2,
        poster: "https://m.media-amazon.com/images/M/MV5BZWMyYzFjYTYtNTRjYi00OGExLWE2YzgtOGRmYjAxZTU3NzBiXkEyXkFqcGdeQXVyMzQ0MzA0NTM@._V1_SX300.jpg",
        cast: ["Tom Holland", "Zendaya", "Benedict Cumberbatch", "Jacob Batalon", "Jon Favreau"],
        director: "Jon Watts",
        language: "English",
        year: "2021",
        showtimes: [
          { time: "12:00 PM", price: 320 },
          { time: "4:00 PM", price: 370 },
          { time: "8:00 PM", price: 420 },
          { time: "11:45 PM", price: 370 }
        ],
        isActive: true,
        createdAt: serverTimestamp()
      }
    ];

    const batch = writeBatch(db);
    sampleMovies.forEach((movie) => {
      const movieRef = doc(moviesCollection);
      batch.set(movieRef, movie);
    });

    await batch.commit();
    return { success: true, message: 'Sample movies initialized successfully' };

  } catch (error) {
    console.error('Error initializing movies:', error);
    return { success: false, message: 'Error initializing movies' };
  }
};
