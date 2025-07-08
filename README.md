# BookItAll - Universal Entertainment Booking Platform

A comprehensive React-based entertainment booking application that allows users to book tickets for movies, live shows, concerts, sports events, amusement parks, and festivals with secure payment integration.

## Features

### User Authentication
- User registration with email verification
- Secure login/logout functionality
- Profile management

<!-- Paste registration page screenshot here -->

<!-- Paste login page screenshot here -->

### Entertainment Categories
- Movies (Hindi & English)
- Live Shows (Theatre plays, musicals)
- Concerts (Music performances)
- Sports Events (Cricket, football)
- Amusement Parks (Theme park passes)
- Festivals & Exhibitions (Cultural events)

<!-- Paste home page with categories screenshot here -->

### Booking System
- Interactive seat selection with real-time availability
- Multiple seat booking capability
- Show date and time selection
- Dynamic pricing based on seat type

<!-- Paste book now page screenshot here -->

<!-- Paste seat selection page screenshot here -->

### Payment Integration
- Secure payment processing with Razorpay
- Test payment simulation
- Payment verification and confirmation
- Digital receipt generation

<!-- Paste payment page screenshot here -->

<!-- Paste payment successful page screenshot here -->

### User Dashboard
- Complete booking history
- Booking management
- Receipt viewing

## Technology Stack

### Frontend
- React.js - Frontend framework
- Vite - Build tool and development server
- React Router DOM - Client-side routing
- Bootstrap 5 - CSS framework
- React Bootstrap - UI components

### Backend
- Firebase Authentication - User management
- Firebase Firestore - NoSQL database
- Firebase Security Rules - Data access control

### Payment Gateway
- Razorpay - Secure payment processing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- NPM or Yarn
- Firebase account
- Razorpay account

### Installation

1. Clone the repository
git clone https://github.com/Prajwalchandru85/BookItAll.git

2. Install dependencies
npm install

3. Start the development server
npm run dev

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Register or login to your account
2. Browse entertainment categories
3. Select your preferred event/movie
4. Choose date and showtime
5. Select seats from the interactive map
6. Proceed to payment with secure checkout
7. Receive confirmation and digital receipt
8. Manage bookings from your profile

## Database Structure

### Collections
- **movies** - Entertainment content and showtimes
- **bookings** - Booking records and transaction history
- **seats** - Seat availability and booking status
- **users** - User profiles and authentication data

## Security Features

- Firebase Authentication with secure token management
- Firestore Security Rules for data protection
- Environment variables for sensitive configuration
- Razorpay PCI compliance for payment security
- Input validation on client and server side

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Developer

**Prajwal Chandru**
- GitHub: [@Prajwalchandru85](https://github.com/Prajwalchandru85)

## License

This project is licensed under the MIT License.

---

**Built with ❤️ using React + Firebase**
