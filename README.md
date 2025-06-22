# Mini Model Playground

A simple, clean, and functional interface to interact with a curated list of serverless models from Fireworks AI. This application allows users to select a model, chat with it, and view real-time performance metrics.

Built with Next.js, TypeScript, and Tailwind CSS.

## Live Site

https://mini-model-playground-nine.vercel.app/

## Features

- **Model Selection**: Dynamically fetches and displays a list of available models from the Fireworks AI API.
- **Chat Interface**: A familiar, chat-like UI for sending prompts and receiving streaming responses.
- **Real-time Streaming**: Handles Server-Sent Events (SSE) to display assistant responses as they are generated.
- **Performance Metrics**: Calculates and displays Time To First Token (TTFT), total Response Time (RT), and Tokens Per Second (TPS) for each message.
- **Loading & Error States**: Provides clear loading indicators and handles API/network errors gracefully.
- **Auto-Scrolling**: The chat view automatically scrolls to the latest message.
- **Markdown Rendering**: Properly renders markdown in responses, including syntax highlighting for code blocks.
- **Responsive Design**: Optimized for desktop and mobile devices with smooth transitions.
- **Accessibility**: Full keyboard navigation and screen reader support.

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
    MOCK_FIREWORKS=true  # Set to false to use real API
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000).

## Testing

Run the test suite:
```bash
npm test
```

The project includes comprehensive tests for:
- Component behavior and user interactions
- API route functionality
- Custom hooks and utilities
- Error handling scenarios

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
-   `app/components/`: Reusable React components that make up the UI (`Chat`, `ChatInput`, `ChatMessage`, `ModelSelector`, etc.).
-   `app/hooks/`: Custom React hooks (`useModels`, `useStreamReader`) to encapsulate and reuse stateful logic.
-   `app/lib/`: Core application logic, including services (`chat-service`, `models-service`) that interact with the Fireworks SDK.

### Key Architectural Choices

#### UI/UX Design Decisions

**Centered Input Experience**: The application starts with a centered input interface (similar to Google's search page) that transitions to a traditional chat layout after the first message. This design choice:
- Provides a clean, focused initial experience
- Reduces cognitive load for new users
- Creates a smooth onboarding flow
- Maintains context during the transition

**Component Composition**: The chat interface is broken down into focused, reusable components:
- `Chat.tsx`: Main container managing layout and state transitions
- `ChatInput.tsx`: Form handling with validation and auto-resize
- `ChatMessage.tsx`: Individual message display with markdown support
- `ModelSelector.tsx`: Dropdown for model selection

**Responsive Design**: The layout adapts seamlessly across devices using:
- Flexbox for dynamic spacing and centering
- CSS transitions for smooth state changes
- Mobile-first responsive breakpoints
- Proper touch targets for mobile interaction

#### Technical Architecture

**Service Abstraction**: Logic for interacting with the Fireworks API is placed in dedicated "service" files (`chat-service.ts`, `models-service.ts`). This separates business logic from the UI and makes the code easier to test and maintain.

**Custom Hooks for State Management**: Instead of a complex state management library, the application relies on custom React hooks (`useModels`, `useStreamReader`) to manage state. This keeps the component logic clean and focused. `useStreamReader` is particularly important, as it abstracts away the complexity of handling SSE streams.

**Robust Error Handling**: The application includes error handling at multiple levels:
- **API Routes**: Catch and log errors from the backend services.
- **Frontend**: Display user-friendly error messages in the chat interface if a request fails.
- **Input Validation**: The UI prevents users from submitting empty prompts.
- **Network Resilience**: Graceful handling of connection issues and timeouts.

**Comprehensive Testing**: The project has a strong test suite that covers components, hooks, and services. Mocks are used for external dependencies (like `fetch`) and browser APIs that are unavailable in the test environment (like `scrollIntoView`), ensuring that tests are fast and reliable.

**Performance Optimizations**:
- **Caching**: Model list is cached for 5 minutes to reduce API calls
- **Streaming**: Real-time response streaming for better perceived performance
- **Memoization**: Strategic use of React.memo and useMemo for expensive operations
- **Bundle Optimization**: Tree shaking and code splitting for minimal bundle size

### Testing Strategy

**Component Testing**: Each component has comprehensive unit tests covering:
- User interactions (typing, form submission, button clicks)
- State changes and prop updates
- Accessibility features (ARIA labels, keyboard navigation)
- Error states and edge cases

**Integration Testing**: API routes and service interactions are tested with:
- Mock implementations for external dependencies
- Error scenario simulation
- Response format validation
- Performance metric calculations

**Best Practices Applied**:
- Proper mocking strategies using `vi.mock()`
- Type-safe test implementations
- Async testing with `act()` wrapper
- Accessibility-focused element selection

## Potential Improvements

### Short-term Enhancements

**User Experience**:
- **Conversation History**: Implement localStorage-based conversation persistence
- **Export Functionality**: Allow users to export conversations as markdown or JSON
- **Keyboard Shortcuts**: Add shortcuts for common actions (Ctrl+Enter to send, Ctrl+K for model selection)
- **Message Actions**: Add copy, edit, and delete functionality for individual messages
- **Theme Support**: Implement dark/light mode toggle

**Performance**:
- **Virtual Scrolling**: For long conversations, implement virtual scrolling to maintain performance
- **Message Pagination**: Load older messages on demand
- **Optimistic Updates**: Show user messages immediately while waiting for API response
- **Connection Recovery**: Automatic retry logic for failed requests

**Features**:
- **Model Comparison**: Side-by-side comparison of different models
- **Prompt Templates**: Pre-built prompt templates for common use cases
- **Image Generation**: Support for image generation models
- **File Upload**: Allow users to upload files for analysis

### Medium-term Improvements

**Architecture**:
- **State Management**: Consider Zustand or Redux Toolkit for more complex state requirements
- **Database Integration**: Add PostgreSQL or SQLite for persistent conversation storage
- **User Authentication**: Implement user accounts with conversation syncing
- **API Rate Limiting**: Add rate limiting for production deployments

**Advanced Features**:
- **Multi-modal Support**: Handle images, audio, and other media types
- **Conversation Threading**: Support for branching conversations
- **Collaborative Features**: Share conversations or work on prompts together
- **Advanced Analytics**: Detailed usage analytics and model performance metrics

### Long-term Considerations

**Scalability**:
- **Microservices**: Break down into smaller, focused services
- **Caching Layer**: Implement Redis for distributed caching
- **Load Balancing**: Handle multiple concurrent users efficiently
- **CDN Integration**: Optimize static asset delivery

**Enterprise Features**:
- **Team Management**: Multi-user support with role-based access
- **Audit Logging**: Comprehensive logging for compliance requirements
- **API Management**: Rate limiting, usage quotas, and billing integration
- **Custom Model Support**: Integration with custom fine-tuned models

## Development Workflow

1. **Setup**: Clone repository, install dependencies with `npm install`
2. **Development**: Run `npm run dev` for local development
3. **Testing**: Run `npm test` for test suite
4. **Mock Mode**: Set `MOCK_FIREWORKS=true` for testing without API key
5. **Production**: Set `NODE_ENV=production` for optimized logging

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `FIREWORKS_API_KEY` | Your Fireworks AI API key | Yes (unless using mock mode) | - |
| `MOCK_FIREWORKS` | Use mock implementation for testing | No | `false` |
| `NODE_ENV` | Environment mode | No | `development` |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.