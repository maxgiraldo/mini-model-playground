# Mini Model Playground - Project Context

## Project Overview

The Mini Model Playground is a web application with a ChatGPT-like interface for interacting with various AI models from Fireworks AI. It's built with Next.js, TypeScript, and Tailwind CSS, featuring a modern streaming chat interface with real-time response generation.

## Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest with React Testing Library
- **Key Components**:
  - `Chat.tsx`: Main chat interface with streaming support
  - `ModelSelector.tsx`: Dropdown for model selection using Headless UI
  - `LoadingIndicator.tsx`: Visual feedback during response generation
  - `Message.tsx`: Individual message display with markdown support

### Backend
- **API Routes**: Next.js API routes for `/api/chat` and `/api/models`
- **Services**: 
  - `ChatService`: Handles chat completion requests
  - `ModelsService`: Manages model fetching with caching
- **SDK**: Custom Fireworks AI SDK with mock implementation for testing

## Coding Conventions

### Comments and Documentation
- **No unnecessary inline comments** - Only add comments that clarify confusing or complex code
- **Document public APIs** - Use JSDoc for exported functions, classes, and interfaces
- **Explain complex logic** - Comment on algorithms, calculations, or non-obvious business logic
- **Avoid obvious comments** - Don't comment on what the code clearly shows
- **Keep comments up-to-date** - Remove or update comments when code changes

### TypeScript
- **Strict typing** - Use explicit types for function parameters and return values
- **Interface segregation** - Create focused interfaces for specific use cases
- **Type exports** - Export types and interfaces for reuse across modules
- **Generic types** - Use generics for reusable components and utilities
- **Type guards** - Use type guards for runtime type checking when needed

### React Components
- **Functional components** - Use function components with hooks
- **Custom hooks** - Extract reusable logic into custom hooks
- **Props interface** - Define explicit interfaces for component props
- **Event handlers** - Use descriptive names for event handler functions
- **State management** - Use appropriate state management patterns (useState, useReducer)

### Error Handling
- **Comprehensive error boundaries** - Handle errors at appropriate levels
- **User-friendly messages** - Show meaningful error messages to users
- **Error propagation** - Propagate errors up the call stack with context
- **Graceful degradation** - Provide fallbacks when features fail
- **Error logging** - Log errors for debugging while showing user-friendly messages

### Testing
- **Unit tests first** - Write unit tests for business logic and utilities
- **Integration tests** - Test component interactions and API integrations
- **Mock external dependencies** - Use mocks for external services and APIs
- **Test descriptions** - Use descriptive test names that explain the scenario
- **Arrange-Act-Assert** - Structure tests clearly but avoid explicit comments

### File Organization
- **Feature-based structure** - Group related files by feature or domain
- **Consistent naming** - Use kebab-case for files, PascalCase for components
- **Index files** - Use index files for clean imports
- **Test co-location** - Keep test files close to the code they test
- **Type definitions** - Place types near where they're used

### Code Style
- **Consistent formatting** - Use Prettier for consistent code formatting
- **Meaningful names** - Use descriptive variable and function names
- **Single responsibility** - Each function/class should have one clear purpose
- **DRY principle** - Don't repeat yourself, extract common patterns
- **Early returns** - Use early returns to reduce nesting

### Performance
- **Memoization** - Use React.memo, useMemo, and useCallback appropriately
- **Lazy loading** - Implement lazy loading for large components
- **Caching** - Cache expensive operations and API responses
- **Bundle optimization** - Keep bundle size minimal with tree shaking
- **Streaming** - Use streaming for real-time data when appropriate

### API Design
- **RESTful principles** - Follow REST conventions for API endpoints
- **Consistent responses** - Use consistent response formats
- **Error status codes** - Return appropriate HTTP status codes
- **Request validation** - Validate input data at API boundaries
- **Rate limiting** - Implement rate limiting for public APIs

### Security
- **Input validation** - Validate all user inputs
- **Environment variables** - Use environment variables for sensitive data
- **CORS configuration** - Configure CORS appropriately
- **Content Security Policy** - Implement CSP headers
- **HTTPS only** - Use HTTPS in production

### Key Features

#### Chat Interface
- Real-time streaming responses with typing effect
- Markdown rendering with syntax highlighting
- Performance metrics display (TTFT, response time, tokens per second)
- Error handling with user-friendly messages
- Auto-resizing text input
- Model selection dropdown

#### Model Management
- Dynamic model fetching from Fireworks AI
- In-memory caching with 5-minute expiry
- Support for both real and mock models
- Environment-based configuration

#### Streaming Support
- Server-Sent Events (SSE) implementation
- Buffer handling for incomplete data chunks
- Support for both completions and chat completions API formats
- Graceful error handling for malformed JSON

## Recent Changes

### Comment Cleanup
Recently removed unnecessary inline comments throughout the codebase while preserving:
- JSDoc documentation for public APIs
- Comments explaining complex logic (e.g., token calculations)
- Comments clarifying confusing code patterns

### Files Modified:
- `app/components/Chat.tsx`: Removed redundant comments about UI updates
- `app/lib/models/models-service.ts`: Cleaned up caching-related comments
- `app/lib/fireworks/mock-fireworks-sdk.ts`: Removed obvious implementation comments
- `app/hooks/useStreamReader.ts`: Kept API format support comments
- `app/api/__tests__/chat-route.test.ts`: Removed Arrange/Act/Assert comments

## Technical Implementation Details

### Streaming Architecture
The application uses a custom `useStreamReader` hook that:
- Processes SSE data from Fireworks AI
- Supports both `choices[0].text` (completions) and `choices[0].delta.content` (chat completions) formats
- Handles incomplete chunks with buffering
- Provides callbacks for content chunks, errors, and completion

### Caching Strategy
- Models are cached in memory for 5 minutes
- Cache includes timestamp for expiry checking
- Manual cache clearing available for testing
- Separate caching for mock and real models

### Error Handling
- Comprehensive error propagation from SDK to UI
- User-friendly error messages in chat interface
- Graceful degradation for network issues
- Detailed error logging for debugging

### Testing Strategy
- Unit tests for all services and hooks
- Mock implementations for external dependencies
- Integration tests for API routes
- Component tests with React Testing Library

## Environment Configuration

### Required Environment Variables
- `FIREWORKS_API_KEY`: API key for Fireworks AI (optional in mock mode)
- `MOCK_FIREWORKS`: Set to 'true' to use mock implementation
- `NODE_ENV`: Determines logger implementation (ConsoleLogger vs NoOpLogger)

### Development vs Production
- Development: Uses ConsoleLogger for detailed logging
- Production: Uses NoOpLogger for performance
- Mock mode available for testing without API key

## File Structure

```
app/
├── api/
│   ├── chat/route.ts
│   ├── models/route.ts
│   └── __tests__/
├── components/
│   ├── Chat.tsx
│   ├── ModelSelector.tsx
│   ├── LoadingIndicator.tsx
│   ├── Message.tsx
│   └── __tests__/
├── hooks/
│   ├── useModels.ts
│   ├── useStreamReader.ts
│   └── __tests__/
├── lib/
│   ├── chat/chat-service.ts
│   ├── models/models-service.ts
│   ├── fireworks/
│   │   ├── fireworks-sdk.ts
│   │   ├── mock-fireworks-sdk.ts
│   │   └── fireworks-ai.ts
│   ├── logger.ts
│   └── __tests__/
├── globals.css
├── layout.tsx
└── page.tsx
```

## Current State

### Working Features
- ✅ Chat interface with streaming responses
- ✅ Model selection and fetching
- ✅ Markdown rendering with syntax highlighting
- ✅ Performance metrics display
- ✅ Error handling and user feedback
- ✅ Responsive design with Tailwind CSS
- ✅ Comprehensive test coverage
- ✅ Mock mode for development/testing

### Known Issues
- Some test failures related to error message expectations
- React warnings about state updates in tests
- Minor styling inconsistencies in test expectations

### Dependencies
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Headless UI
- React Markdown
- React Syntax Highlighter
- Vitest
- React Testing Library

## Development Workflow

1. **Setup**: Clone repository, install dependencies with `npm install`
2. **Development**: Run `npm run dev` for local development
3. **Testing**: Run `npm test` for test suite
4. **Mock Mode**: Set `MOCK_FIREWORKS=true` for testing without API key
5. **Production**: Set `NODE_ENV=production` for optimized logging

## Key Design Decisions

1. **Dependency Injection**: Services accept logger instances for better testability
2. **Interface Segregation**: Clear interfaces for Fireworks AI SDK
3. **Error Boundaries**: Comprehensive error handling at all layers
4. **Performance**: Caching and streaming for optimal user experience
5. **Accessibility**: Proper ARIA labels and keyboard navigation
6. **Testing**: Mock implementations for external dependencies

This project demonstrates modern React/Next.js patterns with a focus on real-time streaming, error handling, and maintainable code architecture. 