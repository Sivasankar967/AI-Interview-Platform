export type QuestionType = 'Technical' | 'Behavioral' | 'Code Question' | 'Mixed';
export type Difficulty = 'Junior' | 'Mid' | 'Senior';

export interface Question {
  id: string;
  type: QuestionType;
  topic: string;
  difficulty: Difficulty;
  role: 'Frontend Dev' | 'Backend Dev' | 'Full Stack' | 'Data Scientist' | string;
  timeLimit: number; // in seconds
  question: string;
  ariaComment: string;
  hints: string[];
  keywords: string[];
  followUps: string[];
  initialCode?: string;
  description?: string;
  examples?: { input: string; output: string; explanation?: string }[];
  constraints?: string[];
}

export const questions: Question[] = [
  // ================= FRONTEND DEV =================
  {
    id: 'fe-1',
    type: 'Technical',
    topic: 'React Performance',
    difficulty: 'Senior',
    role: 'Frontend Dev',
    timeLimit: 180,
    question: "How do you optimize a large React application experiencing performance issues caused by unnecessary re-renders?",
    ariaComment: "Performance is critical for building responsive user experiences. Let's start here.",
    hints: [
      "Mention memoization using useMemo and useCallback.",
      "Talk about code-splitting via React.lazy and Suspense.",
      "Consider state management strategies and avoiding pushing state too high."
    ],
    keywords: ["memo", "memoization", "usecallback", "usememo", "virtualization", "lazy", "splitting"],
    followUps: [
      "How would you identify the exact components that are re-rendering using standard developer tools?",
      "Can you explain the potential pitfalls of overusing useMemo or useCallback?"
    ]
  },
  {
    id: 'fe-2',
    type: 'Code Question',
    topic: 'JavaScript Closures',
    difficulty: 'Mid',
    role: 'Frontend Dev',
    timeLimit: 300,
    question: "Write a function that debounces a given callback function.",
    ariaComment: "Let's check your coding foundations. Debouncing is a common UI optimization technique.",
    description: "Write a debounce function that limits the rate at which a function can fire. The function should only execute after a specific delay has passed without further calls.",
    examples: [
      { input: "let log = debounce(console.log, 100);\nlog('A'); log('B'); log('C');", output: "Console prints 'C' after 100ms", explanation: "All consecutive calls before 100ms are cancelled, executing only the last one after 100ms of quiet time." }
    ],
    constraints: [
      "Must return a closure wrapper function",
      "Should preserve correct execution scope and arguments",
      "Repeated calls should restart the delay timer"
    ],
    initialCode: "function debounce(fn, delay) {\n  let timeoutId;\n  return function(...args) {\n    // Write your solution here\n  };\n}",
    hints: [
      "Use clearTimeouts to cancel pending executions.",
      "Return a function that maintains references using closures."
    ],
    keywords: ["closure", "timeout", "cleartimeout", "delay", "debounce"],
    followUps: [
      "How would you modify this to support an 'immediate' execution option on the leading edge?",
      "How would you handle cleanups if the debounced component unmounts?"
    ]
  },
  {
    id: 'fe-3',
    type: 'Technical',
    topic: 'CSS Architecture',
    difficulty: 'Mid',
    role: 'Frontend Dev',
    timeLimit: 120,
    question: "What are the primary differences between CSS Grid and Flexbox, and how do you decide which layout method to use?",
    ariaComment: "Creating flexible, modern layouts is a frontend core skill.",
    hints: [
      "Flexbox is one-dimensional (row OR column), Grid is two-dimensional (row AND column).",
      "Content-out vs Layout-in design philosophy."
    ],
    keywords: ["dimension", "flexbox", "grid", "content", "axis", "rows", "columns"],
    followUps: [
      "How does subgrid help when creating nested aligned grids?",
      "When is it beneficial to combine both Flexbox and Grid in a single interface?"
    ]
  },
  {
    id: 'fe-4',
    type: 'Behavioral',
    topic: 'Team Collaboration',
    difficulty: 'Junior',
    role: 'Frontend Dev',
    timeLimit: 180,
    question: "Describe a situation where a design spec was technically unfeasible or bad for web performance. How did you discuss it with UX designers?",
    ariaComment: "Collaboration between frontend and design is vital. I'd love to hear your experiences.",
    hints: [
      "Focus on productive, respectful communication.",
      "Provide alternative, performant alternatives instead of just saying no."
    ],
    keywords: ["performance", "communication", "alternative", "compromise", "ux"],
    followUps: [
      "How did you present your metrics to explain the performance impacts?",
      "What did you learn about designer perspectives from that interaction?"
    ]
  },
  {
    id: 'fe-5',
    type: 'Technical',
    topic: 'Web Security',
    difficulty: 'Senior',
    role: 'Frontend Dev',
    timeLimit: 150,
    question: "Explain what Cross-Site Scripting (XSS) is and how you would prevent it in modern single-page applications.",
    ariaComment: "Security is non-negotiable on the web today.",
    hints: [
      "Sanitizing user inputs before rendering.",
      "Using Content Security Policies (CSP).",
      "Avoiding dangerouslySetInnerHTML or equivalent bypasses."
    ],
    keywords: ["xss", "sanitize", "csp", "content security", "dangerously", "escape"],
    followUps: [
      "How does HttpOnly flag help protect session cookies from malicious scripts?",
      "What tools or libraries do you use to sanitize dynamic HTML inputs?"
    ]
  },

  // ================= BACKEND DEV =================
  {
    id: 'be-1',
    type: 'Technical',
    topic: 'Database Scaling',
    difficulty: 'Senior',
    role: 'Backend Dev',
    timeLimit: 180,
    question: "What strategies would you employ to optimize database query performance on a table containing hundreds of millions of records?",
    ariaComment: "Data volume and database bottlenecks are classic backend scalability topics.",
    hints: [
      "Explain indexing and composite keys.",
      "Mention query optimization, execution plans, and pagination.",
      "Consider horizontal scaling options like sharding or replication."
    ],
    keywords: ["index", "sharding", "replica", "partitioning", "execution plan", "caching", "indexing"],
    followUps: [
      "What are the downsides of over-indexing a highly active transactional database?",
      "How does read-write splitting work with database replication?"
    ]
  },
  {
    id: 'be-2',
    type: 'Technical',
    topic: 'API Design',
    difficulty: 'Mid',
    role: 'Backend Dev',
    timeLimit: 150,
    question: "Compare REST, GraphQL, and gRPC. In what scenarios would you choose one architectural style over the others?",
    ariaComment: "API architecture forms the interface for all backend systems.",
    hints: [
      "REST is resource-based and simple, but suffers from over-fetching.",
      "GraphQL offers client-driven queries, ideal for mobile or complex data graphs.",
      "gRPC uses HTTP/2 and Protocol Buffers, perfect for high-speed microservices."
    ],
    keywords: ["rest", "graphql", "grpc", "protobuf", "over-fetching", "microservices", "latency"],
    followUps: [
      "How do you handle schema versioning in a highly distributed microservice network using gRPC?",
      "How would you address N+1 query problems commonly found in GraphQL servers?"
    ]
  },
  {
    id: 'be-3',
    type: 'Code Question',
    topic: 'Algorithms',
    difficulty: 'Mid',
    role: 'Backend Dev',
    timeLimit: 300,
    question: "Implement a basic rate-limiting algorithm using token bucket.",
    ariaComment: "Protecting servers from overload is essential. Let's look at algorithmic control.",
    description: "Write a token bucket rate limiter class. It should initialized with a capacity and fill rate, and offer an 'allowRequest()' method.",
    examples: [
      { input: "let limiter = new RateLimiter(3, 1);\nlimiter.allowRequest(); // true\nlimiter.allowRequest(); // true\nlimiter.allowRequest(); // true\nlimiter.allowRequest(); // false", output: "Returns true for first 3 requests, then false", explanation: "Capacity is 3. Since fill rate is 1 token/sec, the 4th immediate request exceeds the bucket limit." }
    ],
    constraints: [
      "Must correctly calculate bucket refills using millisecond time deltas",
      "Bucket tokens should never exceed maximum capacity limit",
      "Should be stateless in class context (no global variables)"
    ],
    initialCode: "class RateLimiter {\n  constructor(capacity, fillRate) {\n    this.capacity = capacity;\n    this.fillRate = fillRate;\n    this.tokens = capacity;\n    this.lastRefill = Date.now();\n  }\n  allowRequest() {\n    // Implement rate limiting logic here\n  }\n}",
    hints: [
      "Refill tokens based on the elapsed time since the last request.",
      "Keep track of the last refill timestamp."
    ],
    keywords: ["token", "bucket", "timestamp", "refill", "capacity"],
    followUps: [
      "How would you store these bucket states in a distributed system like Redis?",
      "What is the difference between a leaky bucket and a token bucket rate limiter?"
    ]
  },
  {
    id: 'be-4',
    type: 'Technical',
    topic: 'System Reliability',
    difficulty: 'Senior',
    role: 'Backend Dev',
    timeLimit: 150,
    question: "How does the Circuit Breaker pattern work, and why is it crucial in microservice architectures?",
    ariaComment: "Fault tolerance is what separates fragile systems from resilient ones.",
    hints: [
      "Three states: Closed, Open, and Half-Open.",
      "Failing fast when downstream services are down to save system resources."
    ],
    keywords: ["circuit", "closed", "open", "half-open", "fail fast", "fallback"],
    followUps: [
      "How do you configure thresholds for moving from an Open state to a Half-Open state?",
      "What metrics would you monitor to trigger or reset a circuit breaker?"
    ]
  },
  {
    id: 'be-5',
    type: 'Behavioral',
    topic: 'Incident Management',
    difficulty: 'Mid',
    role: 'Backend Dev',
    timeLimit: 150,
    question: "Tell me about a high-severity production outage or bug you had to debug under pressure. What was your step-by-step process?",
    ariaComment: "Every developer eventually faces production emergencies. I want to see how you react.",
    hints: [
      "First step: Mitigate impact (rollback, traffic rerouting) before debugging.",
      "Second: Root cause analysis via log review, monitoring alerts, and replication."
    ],
    keywords: ["rollback", "logs", "metrics", "monitoring", "post-mortem", "mitigate"],
    followUps: [
      "How did you communicate with external stakeholders during the outage?",
      "What long-term preventative measures did you introduce after this outage?"
    ]
  },

  // ================= FULL STACK =================
  {
    id: 'fs-1',
    type: 'Technical',
    topic: 'System Design',
    difficulty: 'Senior',
    role: 'Full Stack',
    timeLimit: 240,
    question: "Design a real-time collaborative document editing system (like Google Docs) handling concurrent edits.",
    ariaComment: "This requires deep synchronization and cross-network considerations.",
    hints: [
      "Discuss WebSockets for bi-directional communication.",
      "Compare Operational Transformation (OT) and Conflict-free Replicated Data Types (CRDT).",
      "Mention database structures for version storage."
    ],
    keywords: ["websocket", "crdt", "ot", "operational", "conflict", "concurrent", "diff"],
    followUps: [
      "What are the latency tradeoffs between client-side and server-side conflict resolution?",
      "How would you implement secure offline editing support for document creators?"
    ]
  },
  {
    id: 'fs-2',
    type: 'Technical',
    topic: 'Authentication & Security',
    difficulty: 'Mid',
    role: 'Full Stack',
    timeLimit: 150,
    question: "Compare Session-based authentication with JWT Token-based authentication. Which would you use for a scalable microservices web app?",
    ariaComment: "Securing modern full-stack web applications is complex but vital.",
    hints: [
      "Session-based is stateful, requiring DB or Redis lookup; highly secure for immediate revocation.",
      "JWT is stateless, verified via signature; harder to revoke but extremely scalable."
    ],
    keywords: ["jwt", "session", "stateless", "stateful", "redis", "cookie", "token"],
    followUps: [
      "How do you implement secure token blacklisting or sliding sessions using stateless JWTs?",
      "Explain the risks of storing sensitive JWTs in LocalStorage versus HttpOnly cookies."
    ]
  },
  {
    id: 'fs-3',
    type: 'Code Question',
    topic: 'System Integration',
    difficulty: 'Mid',
    role: 'Full Stack',
    timeLimit: 300,
    question: "Implement a utility that fetches paginated data from an API and aggregates results sequentially.",
    ariaComment: "Let's check how you handle network operations and array processing.",
    description: "Write a function `fetchAndMerge` that makes repeated GET requests to a paginated API (using page query parameters) until all data records are loaded.",
    examples: [
      { input: "fetchAndMerge('/api/items', 3)", output: "Promise resolving to Array of all fetched records", explanation: "Fetches '/api/items?page=1', '/api/items?page=2', and '/api/items?page=3' sequentially and returns a merged array." }
    ],
    constraints: [
      "Must fetch pages sequentially using async/await",
      "Stop pagination if API returns empty array or page count exceeds maxPages",
      "Handle API rejection or error throws gracefully"
    ],
    initialCode: "async function fetchAndMerge(url, maxPages) {\n  let allRecords = [];\n  // Implement network aggregation here\n  return allRecords;\n}",
    hints: [
      "Use loop checks for pagination boundaries (e.g. empty results or total counts).",
      "Handle API errors and network timeouts gracefully."
    ],
    keywords: ["paginate", "async", "await", "fetch", "loop", "pagination"],
    followUps: [
      "How would you run some pagination calls concurrently without overloading the target server?",
      "How do you implement an exponential backoff retry mechanism in this crawler?"
    ]
  },
  {
    id: 'fs-4',
    type: 'Technical',
    topic: 'Caching Strategies',
    difficulty: 'Senior',
    role: 'Full Stack',
    timeLimit: 180,
    question: "Explain the difference between Cache-Aside, Write-Through, and Write-Behind caching strategies. When would you use each?",
    ariaComment: "Caching speeds up applications, but managing cache invalidation is tricky.",
    hints: [
      "Cache-aside: App manages cache loading on demand.",
      "Write-through: Write directly to cache and DB simultaneously.",
      "Write-behind: Write to cache first, write to DB asynchronously."
    ],
    keywords: ["aside", "through", "behind", "invalidation", "eviction", "redis", "memcached"],
    followUps: [
      "How do you handle race conditions in Cache-Aside when multiple servers update data concurrently?",
      "What are the typical eviction policies (LRU, LFU) and how do they impact hit ratios?"
    ]
  },
  {
    id: 'fs-5',
    type: 'Behavioral',
    topic: 'Technical Debt',
    difficulty: 'Senior',
    role: 'Full Stack',
    timeLimit: 150,
    question: "How do you advocate for fixing technical debt when product managers want to focus solely on launching new user features?",
    ariaComment: "Handling the balance between speed and quality is a hallmark of senior engineering.",
    hints: [
      "Quantify technical debt in terms of lost productivity, slower releases, or crash rates.",
      "Frame technical debt as stability and maintenance metrics instead of styling complaints."
    ],
    keywords: ["debt", "quantify", "stability", "velocity", "compromise", "refactor"],
    followUps: [
      "How do you track refactoring needs in your daily team backlog?",
      "What is an acceptable percentage of dev sprint capacity to allocate purely for engineering health?"
    ]
  },

  // ================= DATA SCIENTIST =================
  {
    id: 'ds-1',
    type: 'Technical',
    topic: 'Machine Learning Foundations',
    difficulty: 'Senior',
    role: 'Data Scientist',
    timeLimit: 180,
    question: "What is the Bias-Variance tradeoff, and how does it relate to overfitting and underfitting in classification algorithms?",
    ariaComment: "Let's dive into core predictive principles in ML models.",
    hints: [
      "Bias represents simplification errors, leading to underfitting.",
      "Variance represents sensitivity to training data noise, leading to overfitting.",
      "Regularization methods help balance this tradeoff."
    ],
    keywords: ["bias", "variance", "tradeoff", "overfitting", "underfitting", "regularization"],
    followUps: [
      "How does cross-validation help in identifying bias and variance in custom datasets?",
      "Which regularization techniques (L1/L2) would you apply to combat high variance?"
    ]
  },
  {
    id: 'ds-2',
    type: 'Technical',
    topic: 'Feature Engineering',
    difficulty: 'Mid',
    role: 'Data Scientist',
    timeLimit: 150,
    question: "How do you handle highly unbalanced datasets in classification tasks, particularly for fraud detection?",
    ariaComment: "Real-world data is rarely perfect. Handling asymmetry is key.",
    hints: [
      "Resampling techniques: Over-sampling (SMOTE) or Under-sampling.",
      "Evaluation metrics: Use Precision, Recall, F1-Score, or ROC-AUC instead of raw Accuracy.",
      "Algorithmic adjustments like class weights."
    ],
    keywords: ["unbalanced", "smote", "resampling", "f1", "auc", "precision", "recall", "weights"],
    followUps: [
      "Why is accuracy a highly deceptive metric for evaluating sparse fraud models?",
      "How does SMOTE generate synthetic samples without creating carbon-copy data?"
    ]
  },
  {
    id: 'ds-3',
    type: 'Code Question',
    topic: 'Data Manipulation',
    difficulty: 'Mid',
    role: 'Data Scientist',
    timeLimit: 300,
    question: "Write an algorithm to calculate the moving average of a data stream.",
    ariaComment: "Processing stream metrics in real-time requires performant queues or lists.",
    description: "Write a function `movingAverage` that processes a stream of numeric updates and outputs their moving averages over a fixed window size.",
    examples: [
      { input: "let calc = getMovingAverageCalculator(3);\ncalc(10); // 10\ncalc(20); // 15\ncalc(30); // 20\ncalc(40); // 30", output: "Returns [10, 15, 20, 30] sequentially", explanation: "The window size is 3. When 40 is added, 10 is pushed out of the window, so average is (20 + 30 + 40)/3 = 30." }
    ],
    constraints: [
      "Maintain a window buffer representing recent inputs",
      "Older values exceeding windowSize should be discarded in FIFO order",
      "Ensure calculations handle floats and fractional results accurately"
    ],
    initialCode: "function getMovingAverageCalculator(windowSize) {\n  let values = [];\n  return function(newVal) {\n    // Implement queue-based moving average calculation here\n  };\n}",
    hints: [
      "Keep track of the running sum of the window elements.",
      "Remove older values once the buffer exceeds the specified window size."
    ],
    keywords: ["moving", "average", "window", "stream", "queue"],
    followUps: [
      "How would you optimize this to run in O(1) time complexity for each stream update?",
      "How would you scale this to handle millions of streaming data streams concurrently in production?"
    ]
  },
  {
    id: 'ds-4',
    type: 'Technical',
    topic: 'Deep Learning',
    difficulty: 'Senior',
    role: 'Data Scientist',
    timeLimit: 180,
    question: "Explain the vanishing gradient problem in deep neural networks and what architectures or methods address it.",
    ariaComment: "Deep networks can fail to learn when gradients shrink exponentially during backpropagation.",
    hints: [
      "Shrinking gradients in backpropagation when using activation functions like Sigmoid.",
      "Solutions: Using ReLU activation, batch normalization, and residual networks (ResNet)."
    ],
    keywords: ["vanishing", "gradient", "sigmoid", "relu", "resnet", "residual", "normalization"],
    followUps: [
      "Why does the Rectified Linear Unit (ReLU) prevent vanishing gradients in positive domains?",
      "How do residual skip connections enable the training of deep networks with hundreds of layers?"
    ]
  },
  {
    id: 'ds-5',
    type: 'Behavioral',
    topic: 'Model Explainability',
    difficulty: 'Senior',
    role: 'Data Scientist',
    timeLimit: 150,
    question: "How do you explain model decisions or 'black box' predictions to non-technical business stakeholders?",
    ariaComment: "Building complex models is only half the battle. Explaining them is how they get used.",
    hints: [
      "Use explainable AI frameworks like SHAP or LIME to explain key feature weights.",
      "Focus on tangible business scenarios and confidence thresholds instead of mathematical equations."
    ],
    keywords: ["explainable", "black box", "shap", "lime", "feature importance", "threshold"],
    followUps: [
      "Can you give an example of how you used feature importance to change a stakeholder's mind?",
      "What is the difference between global and local explainability in ML frameworks?"
    ]
  }
];
