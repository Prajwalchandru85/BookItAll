# 🎪 BookItAll - Universal Entertainment Booking Platform

![brave_QX5pHUZdi4](https://github.com/user-attachments/assets/3e96ae71-ea61-44f4-822a-dd25462d71bf)

A comprehensive React-based entertainment booking application that allows users to book tickets for movies, live shows, concerts, sports events, amusement parks, and festivals with secure payment integration.

## Features

### 🔐 User Authentication
- User registration 
- Secure login/logout functionality
- Profile management
Registeration page

![brave_E9sbjRBiVB](https://github.com/user-attachments/assets/0c1e4625-7c86-4628-b55e-0ea47aecc4e0)

Login page

![brave_Dyv2Hhy56u](https://github.com/user-attachments/assets/68a221e9-6a90-4d29-ba39-9b030fcdad75)


### Entertainment Categories
- Movies (Hindi & English)
- Live Shows (Theatre plays, musicals)
- Concerts (Music performances)
- Sports Events (Cricket, football)
- Amusement Parks (Theme park passes)
- Festivals & Exhibitions (Cultural events)
  Select category
  
![brave_QX5pHUZdi4](https://github.com/user-attachments/assets/a5b0098d-5c50-4afd-bc40-71bc98e4b1e9)

Sports

![image](https://github.com/user-attachments/assets/cb10d45f-9f9d-4cc0-832b-f5b1ee52ea8d)


### Booking System
- Interactive seat selection with real-time availability
- Multiple seat booking capability
- Show date and time selection
- Dynamic pricing based on seat type

  Book tickets
  
![brave_Cnx2AHjhP2](https://github.com/user-attachments/assets/271a2938-38d7-43c6-9f1b-8d1ca0620d3d)

Select seats(Shows booked and available seats)

![brave_n3E6NoZqIj](https://github.com/user-attachments/assets/6b11e3f3-1a2d-48cf-9a46-2022948269fd)



### Payment Integration
- Secure payment processing with Razorpay
- Test payment simulation
- Payment verification and confirmation
- Digital receipt generation
  
![brave_XOmkyulatN](https://github.com/user-attachments/assets/983a1148-c9a0-4e01-8bda-a40d68074805)


![brave_di5MDFdtBQ](https://github.com/user-attachments/assets/8cef32ae-f700-4387-a91a-6d234c9bc37d)


![brave_fLxwUvMq75](https://github.com/user-attachments/assets/d631893c-4ae4-4eb5-a089-875804dfb26d)


### User Dashboard
- Complete booking history
- Booking management
- Receipt viewing

   ![brave_M9ex8wc2zw](https://github.com/user-attachments/assets/9dcfcc98-b145-4fcb-bca1-8baa2056f736)


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
