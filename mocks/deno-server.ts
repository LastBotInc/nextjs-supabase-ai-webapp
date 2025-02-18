// Mock Deno's serve function
export function serve(handler: (request: Request) => Promise<Response> | Response): void {
  // Do nothing in tests
}

// Mock Deno's Response class
export class Response extends globalThis.Response {
  constructor(body?: BodyInit | null, init?: ResponseInit) {
    super(body, init);
  }
}

// Mock Deno's Request class
export class Request extends globalThis.Request {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, init);
  }
} 