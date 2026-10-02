# EduGenie AI

EduGenie AI is a web application designed to provide educational assistance using advanced AI models. This README file outlines the project structure, setup instructions, and usage guidelines.

## Project Structure

```
edugenie-ai
├── app
│   ├── api
│   │   └── generate
│   │       └── route.ts        # API route for generating responses
│   ├── layout.tsx              # Layout component for the application
│   ├── page.tsx                # Main entry point for the application
│   └── globals.css             # Global CSS styles
├── lib
│   └── gemini.ts               # Utility functions for the Gemini API
├── .env.example                 # Template for environment variables
├── .gitignore                   # Files and directories to ignore by Git
├── next.config.ts              # Configuration settings for Next.js
├── package.json                 # npm configuration file
├── tsconfig.json                # TypeScript configuration file
└── README.md                    # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd edugenie-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy the `.env.example` file to `.env` and fill in the required values.

4. **Run the application:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`.

## Usage Guidelines

- The application provides an API endpoint at `/api/generate` for generating responses based on user input.
- The layout component ensures a consistent look and feel across all pages.
- Global styles are defined in `globals.css` to maintain uniformity in design.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.