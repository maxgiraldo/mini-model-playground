# Mini Model Playground

A simple, clean, and functional interface to interact with a curated list of serverless models from Fireworks AI. This application allows users to select a model, chat with it, and view real-time performance metrics.

Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Model Selection**: Dynamically fetches and displays a list of available models from the Fireworks AI API.
- **Chat Interface**: A familiar, chat-like UI for sending prompts and receiving streaming responses.
- **Real-time Streaming**: Handles Server-Sent Events (SSE) to display assistant responses as they are generated.
- **Performance Metrics**: Calculates and displays Time To First Token (TTFT), total Response Time (RT), and Tokens Per Second (TPS) for each message.
- **Loading & Error States**: Provides clear loading indicators and handles API/network errors gracefully.
- **Auto-Scrolling**: The chat view automatically scrolls to the latest message.
- **Markdown Rendering**: Properly renders markdown in responses, including syntax highlighting for code blocks.

## How to Run Locally

1.  **Clone the repository.**

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    Create a file named `.env.local` in the root of the project and add your Fireworks API key:
    ```
    FIREWORKS_API_KEY=your_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000).

---

## Design Decisions & Architecture

This project was built with a focus on simplicity, maintainability, and a good user experience.

### Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router) was chosen for its robust features, including server-side components, API routes, and a great developer experience.
-   **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety and improved code quality.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first approach that allows for rapid UI development while maintaining a consistent design system.
-   **Testing**: [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) are used for unit and integration testing to ensure components and services are reliable.

### Code Structure

The application follows a standard Next.js App Router structure:

-   `app/api/`: Contains backend API routes for proxying requests to the Fireworks AI API.
-   `app/components/`: Reusable React components that make up the UI (`Chat`, `ModelSelector`, etc.).
-   `app/hooks/`: Custom React hooks (`useModels`, `useStreamReader`) to encapsulate and reuse stateful logic.
-   `app/lib/`: Core application logic, including services (`chat-service`, `models-service`) that interact with the Fireworks SDK.

### Key Architectural Choices

-   **Service Abstraction**: Logic for interacting with the Fireworks API is placed in dedicated "service" files (`chat-service.ts`, `models-service.ts`). This separates business logic from the UI and makes the code easier to test and maintain.
-   **Custom Hooks for State Management**: Instead of a complex state management library, the application relies on custom React hooks (`useModels`, `useStreamReader`) to manage state. This keeps the component logic clean and focused. `useStreamReader` is particularly important, as it abstracts away the complexity of handling SSE streams.
-   **Robust Error Handling**: The application includes error handling at multiple levels:
    -   **API Routes**: Catch and log errors from the backend services.
    -   **Frontend**: Display user-friendly error messages in the chat interface if a request fails.
    -   **Input Validation**: The UI prevents users from submitting empty prompts.
-   **Comprehensive Testing**: The project has a strong test suite that covers components, hooks, and services. Mocks are used for external dependencies (like `fetch`) and browser APIs that are unavailable in the test environment (like `scrollIntoView`), ensuring that tests are fast and reliable.

### Potential Improvements

-   **More Sophisticated State Management**: For a larger application, a more robust state management library like Redux Toolkit or Zustand could be beneficial for managing global state.
-   **Optimistic UI for User Messages**: User messages could be rendered optimistically before the API request is sent to improve perceived performance.
-   **Enhanced Error Details**: Provide more specific error messages to the user based on the API response.
-   **Conversation History**: Implement a feature to save and load previous conversations, potentially using `localStorage` or a database.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking