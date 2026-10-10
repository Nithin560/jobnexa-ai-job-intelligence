export interface MatchBreakdown {
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  skills_match_percent: number;
  experience_match_percent: number;
  location_match_percent: number;
  role_match_percent: number;
}

export interface Job {
  id: string;
  title: string;
  company_name: string;
  company_type: string;
  company_logo?: string;
  location: string;
  work_mode: string;
  employment_type: string;
  experience_min: number;
  experience_max: number;
  experience_label: string;
  skills: string[];
  apply_url: string;
  status: string;
  posted_at?: string;
  last_seen_at: string;
  is_new: boolean;
  is_saved: boolean;
  match?: MatchBreakdown;
  description?: string;
  canonical_url?: string;
  company_domain?: string;
  company_careers_url?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'candidate' | 'admin';
}

export interface CandidateProfile {
  user_id: string;
  email: string;
  target_titles: string[];
  location_preferences: string[];
  years_experience: number;
  work_mode: string;
  skills: string[];
}

export interface AdminOverview {
  total_companies: number;
  active_sources: number;
  total_jobs: number;
  bengaluru_jobs: number;
  new_jobs_today: number;
  expired_jobs: number;
  crawler_success_rate: number;
  system_health: {
    backend_api: string;
    database_postgresql: string;
    redis_queue: string;
    ai_service_ollama: string;
    scheduler_cron: string;
    disk_storage: string;
  };
}
