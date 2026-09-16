/**
 * 이래저래 (ElhaeJulhae) v2 - TypeScript 타입 정의
 * @version 1.0.0
 */

// ============================================================================
// 1. 기본 타입 정의
// ============================================================================

/**
 * 임신준비 단계
 */
export type PregnancyStage = 'natural' | 'artificial' | 'ivf';

/**
 * 성별
 */
export type Gender = 'female' | 'male';

/**
 * 사용자 역할
 */
export type UserRole = 'owner' | 'partner';

/**
 * 투두/루틴 카테고리
 */
export type TodoCategory = 'common' | 'mine' | 'partner';

/**
 * 루틴 반복 유형
 */
export type RepeatType = 'daily' | 'weekly' | 'biweekly' | 'monthly';

/**
 * 할당 대상
 */
export type AssignedTo = 'owner' | 'partner';

/**
 * 앱 모드
 */
export type AppMode = 'single' | 'couple';

/**
 * D-Day 타입
 */
export type DDayType = 'natural' | 'artificial' | 'ivf';

/**
 * D-Day 이름 (한글)
 */
export type DDayName = '배란일' | '시술일' | '이식일';

// ============================================================================
// 2. 사용자 관련 타입
// ============================================================================

/**
 * 사용자 정보
 */
export interface User {
  id: string;
  gender: Gender;
  birthDate: string; // ISO 8601: YYYY-MM-DD
  stage: PregnancyStage;
  role: UserRole;
  createdAt: string; // ISO 8601
  updatedAt?: string;
}

/**
 * 짝꿍 정보 (간소화)
 */
export interface Partner {
  gender: Gender;
  birthDate: string; // ISO 8601: YYYY-MM-DD
  connectedAt?: string; // 연결된 시각
}

// ============================================================================
// 3. 투두 관련 타입
// ============================================================================

/**
 * 투두 (단일 날짜)
 */
export interface Todo {
  id: string;
  text: string;
  date: string; // ISO 8601: YYYY-MM-DD (필수, 단일 날짜만)
  category: TodoCategory;
  assignedTo?: AssignedTo;
  completed: boolean;
  completedAt?: string; // ISO 8601
  createdAt: string;
  deletedAt?: string; // 소프트 삭제
}

/**
 * 루틴 (반복 투두)
 *
 * DB에는 정의만 저장하고, UI에서 동적으로 Todo 생성
 * @example
 * {
 *   id: "routine_001",
 *   text: "영양제 복용",
 *   repeat: "daily",
 *   startDate: "2026-09-01",
 *   endDate: undefined, // 무한
 *   time: "06:00",
 *   category: "common",
 * }
 */
export interface Routine {
  id: string;
  text: string;
  category: TodoCategory;
  assignedTo?: AssignedTo;

  // 반복 규칙
  repeat: RepeatType;

  // 시간 설정 (Phase 3 자동 알림 대비)
  time?: string; // "HH:MM" 형식
  times?: string[]; // ["06:00", "12:00", "18:00"]

  // 유효 기간
  startDate: string; // ISO 8601: YYYY-MM-DD
  endDate?: string; // ISO 8601: YYYY-MM-DD (없으면 무한)

  createdAt: string;
  deletedAt?: string; // 소프트 삭제
}

/**
 * 루틴 완료 추적
 *
 * Routine의 특정 날짜에 대한 완료 상태 기록
 * @example
 * {
 *   id: "completion_001",
 *   routineId: "routine_001",
 *   date: "2026-09-18",
 *   completed: true,
 *   completedAt: "2026-09-18T10:30:00Z"
 * }
 */
export interface TodoCompletion {
  id: string;
  routineId: string; // 어느 루틴인지
  date: string; // ISO 8601: YYYY-MM-DD
  completed: boolean;
  completedAt?: string; // ISO 8601
  createdAt: string;
}

// ============================================================================
// 4. D-Day 관련 타입
// ============================================================================

/**
 * D-Day (메인 목표 날짜)
 */
export interface DDay {
  id: string;
  type: DDayType;
  targetDate: string; // ISO 8601: YYYY-MM-DD (배란일/시술일/이식일)
  name: DDayName;
  suggestedTodos?: Todo[]; // 이벤트 기반 추천 투두
  suggestedRoutines?: Routine[]; // 루틴 기반 추천
  createdAt: string;
  updatedAt?: string;
}

// ============================================================================
// 5. 캐릭터 관련 타입
// ============================================================================

/**
 * 캐릭터/레벨 정보
 */
export interface Character {
  level: number; // 현재 레벨
  currentExp: number; // 현재 경험치 (0 ~ 100)
  totalExp: number; // 누적 경험치
  nextLevelExp: number; // 다음 레벨 필요 EXP (항상 100)
}

// ============================================================================
// 6. 온보딩 관련 타입
// ============================================================================

/**
 * 온보딩 Step 상태
 */
export type OnboardingStep = 1 | 2 | 3 | 4;

/**
 * 온보딩 데이터 (임시 저장)
 */
export interface OnboardingData {
  step: OnboardingStep;

  // Step 1: 개인정보
  gender?: Gender;
  birthDate?: string;
  stage?: PregnancyStage;

  // Step 2: 짝꿍정보
  mode?: AppMode;
  partner?: Partner;
  inviteCode?: string; // 수락 모달에서 입력한 코드

  // Step 3: D-Day
  dday?: DDay;

  // Step 4: 뷰 선택
  defaultView?: 'month' | 'week' | 'day';
}

// ============================================================================
// 7. 앱 전체 상태 타입
// ============================================================================

/**
 * 앱의 전체 상태
 * localStorage에 저장되는 구조
 */
export interface AppState {
  // 사용자 정보
  user: User;
  partner?: Partner;
  character: Character;

  // 투두/루틴
  todos: Todo[];
  routines: Routine[];
  todoCompletions: TodoCompletion[];

  // D-Day
  dday: DDay;

  // 앱 설정
  mode: AppMode;
  defaultView: 'month' | 'week' | 'day';

  // 타임스탐프
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 8. API/Firebase 관련 타입 (Phase 2+)
// ============================================================================

/**
 * 실시간 알림 메시지 (Phase 3)
 */
export interface Notification {
  id: string;
  from: string; // 발신자 userId
  to: string; // 수신자 userId
  message: string; // "A가 '난포검사' 확인해달라고 했어요! 🔔"
  todoId?: string; // 관련 투두 ID
  timestamp: string; // ISO 8601
  read?: boolean;
}

/**
 * 커플 연결 정보 (Phase 2)
 */
export interface CoupleConnection {
  id: string; // roomId
  owner: string; // 방장 userId
  partner: string; // 초대받은자 userId
  dday: string; // 공유 D-Day (targetDate)
  inviteCode: string; // 초대 코드
  codeExpiresAt: string; // 코드 만료 시각 (생성 후 7일)
  connectedAt?: string; // 실제 연결 시각
  createdAt: string;
}

// ============================================================================
// 9. 유틸리티 타입
// ============================================================================

/**
 * 페이지 파라미터
 */
export interface PageParams {
  year: number;
  month: number;
}

/**
 * 날짜 범위
 */
export interface DateRange {
  startDate: string; // ISO 8601: YYYY-MM-DD
  endDate: string; // ISO 8601: YYYY-MM-DD
}

/**
 * API 응답 (에러 처리용)
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// 10. localStorage 키 상수
// ============================================================================

export const STORAGE_KEYS = {
  USER: 'elhaejulhae_user',
  PARTNER: 'elhaejulhae_partner',
  CHARACTER: 'elhaejulhae_character',
  TODOS: 'elhaejulhae_todos',
  ROUTINES: 'elhaejulhae_routines',
  TODO_COMPLETIONS: 'elhaejulhae_todoCompletions',
  DDAY: 'elhaejulhae_dday',
  MODE: 'elhaejulhae_mode',
  DEFAULT_VIEW: 'elhaejulhae_defaultView',
  ONBOARDING: 'elhaejulhae_onboarding',
} as const;

// ============================================================================
// 11. 기본값 상수
// ============================================================================

export const DEFAULT_VALUES = {
  LEVEL: 1,
  CURRENT_EXP: 0,
  TOTAL_EXP: 0,
  NEXT_LEVEL_EXP: 100,
  EXP_PER_TODO: 10,
  MODE: 'single' as AppMode,
  DEFAULT_VIEW: 'month' as const,
  INVITE_CODE_LENGTH: 6,
  INVITE_CODE_EXPIRY_DAYS: 7,
} as const;

// ============================================================================
// Type Guards (타입 검증용)
// ============================================================================

/**
 * Todo인지 확인
 */
export function isTodo(obj: any): obj is Todo {
  return obj && typeof obj === 'object' && 'date' in obj && typeof obj.date === 'string';
}

/**
 * Routine인지 확인
 */
export function isRoutine(obj: any): obj is Routine {
  return obj && typeof obj === 'object' && 'repeat' in obj && typeof obj.repeat === 'string';
}

/**
 * User인지 확인
 */
export function isUser(obj: any): obj is User {
  return obj && typeof obj === 'object' && 'id' in obj && 'gender' in obj && 'stage' in obj;
}
