# Table 1837 Bar Web App

An AI-powered bar management web application featuring live menu updates, OCR capabilities, and natural language processing for admin operations.

## Features

- **Live Menu Management**: Real-time updates for wines, cocktails, and specials
- **AI-Powered Admin Panel**: Natural language commands for menu updates
- **OCR Processing**: Upload menu images and extract text automatically
- **86'd Items Tracking**: Real-time tracking of unavailable items
- **Auto-Commit to GitHub**: Automatic version control for all changes
- **Responsive Design**: Mobile-friendly interface cloning Table1837.com brand
- **Real-time Updates**: Live updates using Supabase subscriptions

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **AI/ML**: Google Gemini API, OpenRouter.ai, Tesseract.js
- **Image Storage**: Cloudinary
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Cloudinary account
- Google Gemini API key
- GitHub Personal Access Token

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BlackVaultEnterprises/table1837-bar-app.git
cd table1837-bar-app
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`

5. Set up the database schema in Supabase:
   - Run the SQL commands from `supabase_schema.sql`
   - Optionally run `supabase_seed_data.sql` for test data

6. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI APIs
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# GitHub (for auto-commits)
GITHUB_TOKEN=your_github_token
GITHUB_REPO_OWNER=BlackVaultEnterprises
GITHUB_REPO_NAME=table1837-bar-app

# Other
NEXTAUTH_SECRET=your_nextauth_secret
SENTRY_DSN=your_sentry_dsn
```

## API Endpoints

### Menu Management
- `GET /api/wines` - Fetch all wines
- `POST /api/wines` - Add new wine
- `PUT /api/wines` - Update wine
- `DELETE /api/wines` - Delete wine

- `GET /api/cocktails` - Fetch all cocktails
- `POST /api/cocktails` - Add new cocktail
- `PUT /api/cocktails` - Update cocktail
- `DELETE /api/cocktails` - Delete cocktail

### AI Features
- `POST /api/parse-nlp-command` - Process natural language commands
- `POST /api/ocr-process` - Upload and process menu images
- `POST /api/github-commit` - Auto-commit changes to GitHub

## Usage

### Admin Panel Natural Language Commands

The admin panel accepts natural language commands such as:

- "86 the Malbec" - Mark wine as unavailable
- "Add The Fig Old Fashioned to signature cocktails for $16"
- "Remove the happy hour special"
- "Un-86 the Chardonnay"

### OCR Menu Processing

1. Upload a menu image through the admin panel
2. The system will automatically extract text using Tesseract.js
3. AI will clean up and structure the extracted text
4. Review and confirm the processed data before publishing

## Deployment

The application is configured for automatic deployment to Vercel via GitHub Actions.

### GitHub Secrets Required

Add these secrets to your GitHub repository:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `GEMINI_API_KEY`
- `OPENROUTER_API_KEY`
- `GITHUB_TOKEN`
- `VERCEL_TOKEN`
- `NEXTAUTH_SECRET`
- `SENTRY_DSN`

## Database Schema

The application uses the following main tables:

- `wines` - Wine inventory and details
- `cocktails` - Cocktail recipes and information
- `specials` - Daily/weekly specials
- `eighty_sixed_items` - Tracking of unavailable items
- `menus` - OCR processed menu images
- `users` - Admin authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for Table 1837.

## Support

For support, contact the development team or create an issue in the GitHub repository.

