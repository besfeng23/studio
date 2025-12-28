# **App Name**: Pandoras Box

## Core Features:

- Message Persistence: Save every user message to Firestore immediately upon receipt.
- Memory Lane: A Genkit flow which will update context notes, update pins, update last state, generate search queries, categorize intent, determine if clarification is needed, and if clarification is needed then return the single clarification question, otherwise this tool will take the conversation turn
- Vector Retrieval: Generate embeddings for search queries and run Firestore KNN vector search against history.
- Answer Lane: A Genkit flow which generates a grounded final reply, based on retrieved docs and pins/context
- Command Recognition: Recognize CONTINUE, RECAP, PIN, UNPIN, and DECISION commands and execute them.
- External API Endpoint: Create a POST /api/memory-chat endpoint for external access with API key authentication.
- Provider Plugin: Provider agnostic AI that is easily adaptable with external API services such as Vertex, OpenAI, etc.

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5), evokes feelings of wisdom and trust befitting of an information management application.
- Background color: Light gray (#EEEEEE), for a clean and neutral backdrop.
- Accent color: Teal (#009688), provides a modern and refreshing contrast.
- Body and headline font: 'Inter', sans-serif.
- Simple line icons for commands and status indicators.
- Clear division of chat, memory, and settings screens using a tab-based or sidebar navigation.
- Subtle loading animations during Firestore reads/writes and AI processing.