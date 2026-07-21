export interface Source {
  source: string;
  content: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}
