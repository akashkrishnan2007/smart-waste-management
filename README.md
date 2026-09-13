# Smart Waste Management System

A full-stack web application for intelligent waste management and recycling tracking.

## Project Structure

```
Smart Waste Management/
├── backend/                 # Python Flask API server
│   ├── app.py              # Main application entry point
│   ├── config.py           # Configuration settings
│   ├── requirements.txt    # Python dependencies
│   ├── .env                # Environment variables (not in git)
│   ├── .env.example        # Environment variables template
│   ├── dataset/            # Training data for ML models
│   ├── ml/                 # Machine learning models and training scripts
│   ├── models/             # Database models
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic services
│   └── utils/              # Helper utilities
│
└── smart-waste-frontend/   # React Vite frontend application
    ├── package.json        # Node.js dependencies
    ├── vite.config.js      # Vite configuration
    ├── tailwind.config.js  # Tailwind CSS configuration
    ├── postcss.config.js   # PostCSS configuration
    ├── .env.example        # Frontend environment template
    ├── public/             # Static assets
    └── src/                # Source code
        ├── components/     # React components
        ├── pages/          # Page components
        ├── services/       # API services
        ├── hooks/          # Custom React hooks
        ├── utils/          # Helper functions
        └── assets/         # Images, fonts, etc.
```

## Features

- **Dashboard**: Real-time waste management metrics and analytics
- **Analytics**: Data visualization and reporting
- **Waste Tracking**: Monitor waste collection and disposal
- **Landfill Management**: Track landfill capacity and operations
- **Predictions**: ML-powered waste volume predictions
- **User Authentication**: Secure login and role-based access
- **Reports**: Generate and export detailed reports

## Getting Started

### Backend Setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py
```

### Frontend Setup

```bash
cd smart-waste-frontend
npm install
npm run dev
```

## Tech Stack

**Backend:**
- Python/Flask
- MongoDB
- Machine Learning (scikit-learn, pandas)

**Frontend:**
- React 19
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router
- Recharts

## Notes

- `.env` files are not committed to version control (see `.gitignore`)
- ML model files are generated during training
- Dataset files are ignored from version control