# Smart Home Energy Monitoring System

A comprehensive web application for monitoring and managing home energy consumption, built with React, TypeScript, and Express.

![Smart Home Energy Dashboard](https://via.placeholder.com/800x450.png?text=Smart+Home+Energy+Dashboard)

## Features

- **Real-Time Energy Monitoring**: Track current power usage and consumption patterns
- **Device-Level Analytics**: Monitor individual appliance energy usage
- **Budget Management**: Set and track daily and monthly energy budgets
- **Alerts & Notifications**: Get notified when energy usage exceeds thresholds
- **Historical Data Analysis**: View and analyze past energy consumption

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, Recharts, Shadcn UI
- **Backend**: Express.js, Node.js
- **Data**: In-memory storage (can be easily extended to PostgreSQL)
- **Authentication**: Session-based authentication

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/smart-home-energy-monitoring.git
   cd smart-home-energy-monitoring
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5000`

## Project Structure

- `/client`: Frontend React application
  - `/src/components`: UI components including dashboard widgets
  - `/src/pages`: Application pages
  - `/src/hooks`: Custom React hooks
  - `/src/lib`: Utility functions and API client
- `/server`: Backend Express server
  - `/routes.ts`: API endpoints
  - `/storage.ts`: Data persistence layer
- `/shared`: Code shared between client and server
  - `/schema.ts`: Data models and validation schemas

## Future Enhancements

- Integration with real IoT devices
- Advanced analytics and machine learning predictions
- Mobile app with push notifications
- Support for multiple households/users

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built as a demonstration of modern web application development
- Inspired by the need for better energy consumption awareness
