
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export enum AuditStep {
  START = 'START',
  QUESTIONS = 'QUESTIONS',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT'
}

export interface UserData {
  businessType: string;
  budget: string;
  channels: string;
  funnelFocus: string;
  kpiAndFrustration: string;
}
