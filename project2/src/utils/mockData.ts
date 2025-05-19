import { Conversation, Message, RetrievedContext } from '../types';

// Generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Create sample contexts
const createSampleContexts = (): RetrievedContext[] => {
  return [
    {
      id: generateId(),
      content: "Section 2201: All naval personnel must maintain their uniforms in a clean, serviceable condition. Uniforms shall be properly fitted and conform to current regulations.",
      relevanceScore: 0.95,
      source: "Navy Regulations Part II, Chapter 22"
    },
    {
      id: generateId(),
      content: "Section 2203: Working uniforms are authorized for wear while commuting and conducting normal business.",
      relevanceScore: 0.85,
      source: "Navy Regulations Part II, Chapter 22"
    },
    {
      id: generateId(),
      content: "Section 2205: Commanding officers may prescribe appropriate uniforms for personnel within their command.",
      relevanceScore: 0.75,
      source: "Navy Regulations Part II, Chapter 22"
    }
  ];
};

// Create sample messages
const createSampleMessages = (): Message[] => {
  return [
    {
      id: generateId(),
      content: "What are the general regulations regarding uniform requirements?",
      role: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
    },
    {
      id: generateId(),
      content: "According to Navy Regulations Part II, all naval personnel must wear the prescribed uniform appropriate to their rank and duty assignment. The uniform must be kept in good condition and worn with pride. Specific requirements vary by duty station and can be found in sections 2201-2215 of the regulations.",
      role: 'assistant',
      timestamp: new Date(Date.now() - 1000 * 60 * 4.5), // 4.5 minutes ago
      contexts: createSampleContexts()
    }
  ];
};

// Create sample conversations
export const sampleConversations: Conversation[] = [
  {
    id: generateId(),
    title: "Uniform Regulations",
    messages: createSampleMessages(),
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 4.5) // 4.5 minutes ago
  },
  {
    id: generateId(),
    title: "Leave Policies",
    messages: [
      {
        id: generateId(),
        content: "Can you explain the emergency leave policy?",
        role: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        id: generateId(),
        content: "Emergency leave may be granted in cases of family emergencies such as serious illness, injury, or death of an immediate family member. The standard duration is up to 30 days, which can be extended under exceptional circumstances. You'll need to submit your request through your commanding officer with appropriate documentation.",
        role: 'assistant',
        timestamp: new Date(Date.now() - 1000 * 60 * 29.5), // 29.5 minutes ago
        contexts: [
          {
            id: generateId(),
            content: "Section 3301: Emergency leave may be granted for up to 30 days in cases of immediate family emergencies.",
            relevanceScore: 0.92,
            source: "Navy Regulations Part II, Chapter 33"
          },
          {
            id: generateId(),
            content: "Section 3302: Extensions beyond 30 days require commanding officer approval and supporting documentation.",
            relevanceScore: 0.88,
            source: "Navy Regulations Part II, Chapter 33"
          }
        ]
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 29.5) // 29.5 minutes ago
  },
  {
    id: generateId(),
    title: "Chain of Command",
    messages: [
      {
        id: generateId(),
        content: "What does the regulation say about bypassing the chain of command?",
        role: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
      },
      {
        id: generateId(),
        content: "Navy Regulations strictly prohibit bypassing the chain of command except in specific circumstances. Section 1020 states that all personnel must communicate through official channels, following the established hierarchy. Exceptions are permitted for whistleblower cases, equal opportunity complaints, or when reporting illegal activities. Unauthorized bypassing may result in disciplinary action.",
        role: 'assistant',
        timestamp: new Date(Date.now() - 1000 * 60 * 59.5), // 59.5 minutes ago
        contexts: [
          {
            id: generateId(),
            content: "Section 1020: Communication through the chain of command is mandatory except in specified circumstances.",
            relevanceScore: 0.96,
            source: "Navy Regulations Part II, Chapter 10"
          },
          {
            id: generateId(),
            content: "Section 1021: Exceptions to chain of command include whistleblower complaints and reports of illegal activities.",
            relevanceScore: 0.89,
            source: "Navy Regulations Part II, Chapter 10"
          }
        ]
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 59.5) // 59.5 minutes ago
  }
];

// Create a new empty conversation
export const createNewConversation = (): Conversation => {
  const now = new Date();
  return {
    id: generateId(),
    title: "New Conversation",
    messages: [],
    createdAt: now,
    updatedAt: now
  };
};