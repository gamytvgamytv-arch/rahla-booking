export interface PricingTier {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  duration_days: number;
  specialists_notified: number;
  min_answers: number;
  max_answers: number;
  response_speed: 'standard' | 'fast' | 'instant';
  price_usd: number;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export type QuestionStatus = 'new' | 'under_review' | 'active' | 'closed' | 'answered';
export type QuestionType = 'free' | 'paid';

export interface Question {
  id: string;
  specialty_key: string;
  specialty_category: string;
  title: string;
  body: string;
  question_type: QuestionType;
  tier_id: string | null;
  price_usd: number;
  status: QuestionStatus;
  votes: number;
  views: number;
  answer_count: number;
  max_answers: number;
  expires_at: string | null;
  author_name: string;
  country_code: string;
  created_at: string;
}

export interface QuestionAnswer {
  id: string;
  question_id: string;
  author_name: string;
  author_title: string;
  body: string;
  is_accepted: boolean;
  helpful_votes: number;
  created_at: string;
}
