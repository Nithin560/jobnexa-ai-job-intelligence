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
  hiring_role?: string;
  salary_min_lpa?: number;
  salary_max_lpa?: number;
  salary_label?: string;
  skills: string[];
  apply_url: string;
  source_type?: 'career_portal' | 'job_portal';
  source_name?: string;
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
  it_role_family?: string;
  confidence_score?: number;
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
  experience_tier?: 'fresher' | 'experienced';
  work_mode: string;
  skills: string[];
}

export interface AdminOverview {
  total_companies: number;
  active_sources: number;
  total_jobs: number;
  career_portal_jobs?: number;
  job_portal_jobs?: number;
  bengaluru_jobs: number;
  new_jobs_today: number;
  expired_jobs: number;
  fresher_jobs: number;
  experienced_jobs: number;
  total_users?: number;
  active_users?: number;
  fresher_users?: number;
  experienced_users?: number;
  last_scan_time?: string;
  next_scan_time?: string;
  crawler_success_rate: number;
  system_health: {
    backend_api: string;
    database_postgresql: string;
    redis_queue: string;
    ai_service_ollama: string;
    scheduler_cron: string;
    disk_storage: string;
  };
  top_skills?: { name: string; count: number; percent: number }[];
  company_type_breakdown?: { name: string; count: number; value: number; color: string }[];
  day_wise_job_trends?: DayWiseJobItem[];
}

export interface AdminUserItem {
  id: string;
  email: string;
  full_name: string;
  role: string;
  experience_tier: 'fresher' | 'experienced' | 'admin' | string;
  years_experience: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  created_at_iso: string;
}

export interface AdminUsersResponse {
  total_registered: number;
  total_active: number;
  fresher_count: number;
  experienced_count: number;
  admin_count: number;
  users: AdminUserItem[];
  registration_trends: { date: string; count: number }[];
  demographics: {
    fresher_percent: number;
    experienced_percent: number;
    admin_percent: number;
  };
}

export interface DayWiseJobItem {
  date: string;
  short_date: string;
  fresher_jobs: number;
  experienced_jobs: number;
  total_jobs: number;
  new_jobs: number;
  scans_count: number;
}

export interface DayWiseJobsResponse {
  day_wise: DayWiseJobItem[];
  summary: {
    total_fresher: number;
    total_experienced: number;
    total_jobs: number;
    fresher_ratio_percent: number;
    experienced_ratio_percent: number;
    peak_day: string;
  };
}

export interface AdminNotificationItem {
  id: string;
  category: 'user_registration' | 'scan_update' | 'job_metrics' | string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  formatted_time: string;
  data: Record<string, any>;
}

export interface AdminNotificationsResponse {
  unread_count: number;
  live_metrics: {
    expired_jobs: number;
    new_jobs: number;
    fresher_jobs: number;
    experienced_jobs: number;
    total_jobs: number;
  };
  notifications: AdminNotificationItem[];
}

export interface ScanRunItem {
  id: string;
  scan_time: string;
  status: string;
  companies: number;
  jobs_found: number;
  new: number;
  updated: number;
  expired: number;
  duration: string;
}

export interface SkillInsight {
  name: string;
  count: number;
  percent: number;
}

export interface ExperienceInsight {
  name: string;
  value: number;
  count: number;
  color: string;
}

export interface RecentScanInsight {
  time: string;
  count: string;
  companies_scanned: number;
  new_jobs: number;
}

export interface MarketInsights {
  total_jobs: number;
  total_companies: number;
  top_skills: SkillInsight[];
  experience_breakdown: ExperienceInsight[];
  work_modes: { [key: string]: number };
  company_tiers: { [key: string]: number };
  recent_scans: RecentScanInsight[];
  latest_scan: {
    companies_scanned: number;
    jobs_found: number;
    new_jobs: number;
    time: string;
  };
}

