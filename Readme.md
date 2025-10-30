# Language Learning Tool

A comprehensive language learning application with React frontend and JSON server backend.

## Features

- **Multi-language support**: Choose between Japanese (Kanji) and Dutch
- Vocabulary study and practice
- Progress tracking with statistics
- Smart question selection (least answered, least correct, random)
- Session and global statistics
- Multiple deployment options (local, ngrok, production)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- (Optional) ngrok for public access

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nihongoV3.git
   cd nihongoV3
   ```

2. Install all dependencies with a single command:
   ```bash
   npm install
   ```
   This will install both frontend and backend dependencies.

### Running the Application

1. Start both the backend and frontend with a single command:
   ```bash
   npm start
   ```
   This will concurrently start:
   - Custom Node.js backend server (port 8080)
   - React development server (port 3000)

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nihongoV3/
├── frontend/           # React frontend
├── backend/            # JSON server backend
├── public/             # Static files
└── README.md           # This file
```

## Version History

| Version | Type | Description | Access |
|---------|------|-------------|--------|
| v1.0.0 | Java App | Read Google Sheets | Local only |
| v2.0.0 | SpringBoot BE + HTML FE | Initial web version | Localhost access |
| v2.1.0 | - | Upgraded to React frontend | Localhost access |
| v2.2.0 | - | Added ngrok support | Public access when ngrok is running |
| v3.0.0 | React + JSON Server | Combined BE & FE on same server | Localhost access without CORS |

### v3.0.0 - Current Version
- Combined React frontend with JSON server backend
- Single server for both BE & FE
- No CORS issues
- Simplified development and deployment

### v2.x - SpringBoot Versions
#### v2.2.0 - Ngrok Support
- Added ngrok for public access
- Accessible via ngrok URL when running:
  ```bash
  ngrok http 8080
  ```
  Note: Only accessible when ngrok is running

#### v2.1.0 - React Frontend
- Upgraded from HTML to React
- Improved user interface
- Better state management

#### v2.0.0 - Initial Web Version
- Spring Boot backend
- Basic HTML frontend
- Local development setup
- Requires IP address instead of localhost due to CORS

### v1.0.0 - Initial Version
- Java application
- Google Sheets integration
- Local execution only

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Language Support

The app now supports multiple languages:
- **Japanese (Kanji)**: Learn Japanese characters and their meanings
- **Dutch**: Learn Dutch vocabulary

Switch between languages using the language selector at the top of the app. Each language maintains separate statistics and progress tracking.

### Adding More Languages

To add a new language:
1. Create a new JSON file in `/data/` (e.g., `spanish.json`)
2. Follow the structure of `dutch.json` with `word`, `meaning`, and stats fields
3. Update `server.js` to add routes for the new language
4. Update `ApiHandler.js` to handle the new language endpoint
5. Add a language button in `App.js`

## Deployment

### Live App
- **Frontend**: https://mesutdurukal.github.io/nihongoV3
- **Backend**: Deployed on Vercel

### Deploy Your Own Instance

See [DEPLOY_STEPS.md](DEPLOY_STEPS.md) for quick deployment instructions or [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guide.

**Quick Steps:**
1. Deploy backend: `vercel --prod`
2. Update `.env.production` with your Vercel URL
3. Deploy frontend: `npm run deploy`

