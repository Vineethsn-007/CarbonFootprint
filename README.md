# EcoTrack – Carbon Footprint Awareness Platform 🌱

EcoTrack is a full-stack, AI-powered web application designed to help users understand, track, analyze, and reduce their carbon footprints. It provides personalized sustainability coaching, goal tracking, and gamification to encourage environmentally friendly habits.

## 🎯 Chosen Vertical
This project tackles **Sustainability and Environmental Awareness**, focusing on providing individuals with the tools they need to understand and reduce their personal carbon footprint.

## 🧠 Approach and Logic
The application is designed to make carbon footprint tracking both accessible and actionable. Rather than simply providing raw emission numbers, the logic centers around:
- **Comprehensive Calculation**: Utilizing standard emission factors across various lifestyle categories (transport, energy, food, shopping, waste).
- **Personalized Insights**: Integrating AI (Google Gemini) to transform raw data into personalized, conversational coaching and actionable reduction plans.
- **Engagement through Gamification**: Leveraging goal tracking, badges, and leaderboards to motivate consistent, long-term behavioral changes.

## ⚙️ How the Solution Works
1. **Data Collection**: Users complete a multi-step questionnaire detailing their lifestyle habits.
2. **Calculation Engine**: The React frontend securely transmits this data to the Node.js/Express backend. The backend processes the inputs using predefined emission factors to estimate monthly CO₂ emissions.
3. **AI Analysis**: The processed data is fed into the Gemini API, which generates personalized sustainability recommendations and a custom weekly reduction plan.
4. **Visualization & Tracking**: Results are securely stored in Firestore and presented to the user via interactive Recharts dashboards. Users can set specific eco-goals based on these insights.
5. **Continuous Engagement**: Users return to log new data, interact with the AI coach for advice, and read curated educational content to improve their sustainability knowledge.

## 🤔 Assumptions Made
- **Emission Accuracy**: The emission factors used are generalized approximations. Actual emissions can vary significantly based on specific geographic locations, vehicle models, and local energy grids.
- **Data Integrity**: Meaningful insights rely on the assumption that users input their lifestyle data accurately and honestly.
- **API Availability**: Real-time coaching and insights depend on the continuous availability of the Google Gemini API.
- **Modern Web Capabilities**: The user is accessing the platform from a modern web browser that supports advanced CSS (like Tailwind v4) and JavaScript features.

## 🌟 Features

- **Carbon Footprint Calculator**: Multi-step wizard to estimate monthly CO₂ emissions based on transport, energy, food, shopping, and waste habits.
- **AI Sustainability Coach**: Powered by Google Gemini AI, offering real-time conversational insights, custom weekly reduction plans, and personalized emission analysis.
- **Goal Tracking & Gamification**: Users can set eco-goals, track progress, earn sustainability badges, and climb the community leaderboard.
- **Advanced Analytics**: Interactive Recharts-based dashboards to visualize emission trends and category breakdowns over time.
- **Education Hub**: A repository of articles about climate change, renewable energy, and sustainable living (with Admin CRUD capabilities).
- **Admin Panel**: Role-based access control allowing admins to monitor platform statistics, manage users, and curate educational content.
- **PDF Reports**: Export your personalized sustainability profile and metrics via jsPDF.
- **Modern UI**: Fully responsive, dark-mode compatible design utilizing Tailwind CSS v4, custom glassmorphism, and Shadcn UI-inspired components.

## 🛠 Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS v4
- React Router DOM v7
- Recharts
- Lucide React (Icons)
- Firebase SDK (Auth)

**Backend**
- Node.js + Express.js
- Firebase Admin SDK (Firestore Database)
- Google Generative AI (Gemini API)
- Helmet, Express Rate Limit, CORS

**Testing**
- Vitest & React Testing Library (Frontend)
- Jest & Supertest (Backend API)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Firebase Project (Authentication & Firestore enabled)
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "carbon footprint"
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   GEMINI_API_KEY=your_gemini_api_key_here
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_PRIVATE_KEY="your_private_key_with_newlines"
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file in the `client` directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### Running the App Locally

**Start the Backend Server**
```bash
cd server
npm run dev
```

**Start the Frontend Client**
```bash
cd client
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Running Tests
- **Frontend**: `cd client && npm run test`
- **Backend**: `cd server && npm run test`

## 🔒 Security Rules
To deploy the Firestore security rules, run:
```bash
firebase deploy --only firestore:rules
```
Make sure you have the Firebase CLI installed and are authenticated.

## 📄 License
This project is licensed under the MIT License.
