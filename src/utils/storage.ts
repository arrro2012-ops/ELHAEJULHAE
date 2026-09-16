/**
 * 이래저래 (ElhaeJulhae) v2 - localStorage 저장소 관리
 * @module storage
 * @version 1.0.0
 */

import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Partner,
  Todo,
  Routine,
  TodoCompletion,
  DDay,
  Character,
  AppState,
  OnboardingProgress,
  OnboardingStep,
  STORAGE_KEYS,
  DEFAULT_VALUES,
} from '../types';

const STORAGE_VERSION = '1.0.0';
const LOG_PREFIX = '[ElhaeJulhae Storage]';

// ============================================================================
// 1. 스토리지 초기화
// ============================================================================

/**
 * 스토리지 초기화 (앱 실행 시 한 번)
 */
export function initializeStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.VERSION)) {
    localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);
    console.log(LOG_PREFIX, '스토리지 초기화 완료');
  }
}

/**
 * 스토리지 버전 조회
 */
export function getStorageVersion(): string {
  return localStorage.getItem(STORAGE_KEYS.VERSION) || '0.0.0';
}

// ============================================================================
// 2. User 관련
// ============================================================================

/**
 * User 저장
 */
export function saveUser(user: User): boolean {
  try {
    if (!validateUser(user)) {
      console.error(LOG_PREFIX, 'User 유효하지 않음');
      return false;
    }

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    updateLastModified();
    return true;
  } catch (e) {
    handleStorageError(e, 'User 저장 실패');
    return false;
  }
}

/**
 * User 로드
 */
export function loadUser(): User | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) return null;

    const user = JSON.parse(data);

    if (!validateUser(user)) {
      console.error(LOG_PREFIX, 'User 스키마 유효하지 않음');
      return null;
    }

    return user;
  } catch (e) {
    handleStorageError(e, 'User 로드 실패');
    return null;
  }
}

/**
 * User 검증
 */
function validateUser(user: any): user is User {
  return (
    typeof user.id === 'string' &&
    (user.gender === 'female' || user.gender === 'male') &&
    typeof user.birthDate === 'string' &&
    ['natural', 'artificial', 'ivf'].includes(user.stage) &&
    (user.role === 'owner' || user.role === 'partner') &&
    typeof user.createdAt === 'string'
  );
}

// ============================================================================
// 3. Partner 관련
// ============================================================================

/**
 * Partner 저장
 */
export function savePartner(partner: Partner): boolean {
  try {
    if (!validatePartner(partner)) {
      console.error(LOG_PREFIX, 'Partner 유효하지 않음');
      return false;
    }

    localStorage.setItem(STORAGE_KEYS.PARTNER, JSON.stringify(partner));
    updateLastModified();
    return true;
  } catch (e) {
    handleStorageError(e, 'Partner 저장 실패');
    return false;
  }
}

/**
 * Partner 로드
 */
export function loadPartner(): Partner | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PARTNER);
    if (!data) return null;

    const partner = JSON.parse(data);

    if (!validatePartner(partner)) {
      console.error(LOG_PREFIX, 'Partner 스키마 유효하지 않음');
      return null;
    }

    return partner;
  } catch (e) {
    handleStorageError(e, 'Partner 로드 실패');
    return null;
  }
}

/**
 * Partner 검증
 */
function validatePartner(partner: any): partner is Partner {
  return (
    (partner.gender === 'female' || partner.gender === 'male') &&
    typeof partner.birthDate === 'string'
  );
}

/**
 * Partner 삭제 (커플 연결 해제 시)
 */
export function deletePartner(): void {
  localStorage.removeItem(STORAGE_KEYS.PARTNER);
  updateLastModified();
}

// ============================================================================
// 4. Todo 관련
// ============================================================================

/**
 * 모든 Todo 저장
 */
export function saveTodos(todos: Todo[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    updateLastModified();
    return true;
  } catch (e) {
    handleStorageError(e, 'Todos 저장 실패');
    return false;
  }
}

/**
 * 모든 Todo 로드
 */
export function loadTodos(): Todo[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TODOS);
    if (!data) return [];

    const todos = JSON.parse(data);
    return Array.isArray(todos) ? todos : [];
  } catch (e) {
    handleStorageError(e, 'Todos 로드 실패');
    return [];
  }
}

/**
 * Todo 추가
 */
export function addTodo(todo: Todo): boolean {
  const todos = loadTodos();
  todos.push(todo);
  return saveTodos(todos);
}

/**
 * Todo 업데이트
 */
export function updateTodo(id: string, updates: Partial<Todo>): boolean {
  const todos = loadTodos();
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    console.warn(LOG_PREFIX, `Todo ${id} 찾을 수 없음`);
    return false;
  }

  todos[index] = { ...todos[index], ...updates };
  return saveTodos(todos);
}

/**
 * Todo 삭제 (소프트)
 */
export function deleteTodo(id: string): boolean {
  return updateTodo(id, { deletedAt: new Date().toISOString() });
}

/**
 * 활성 Todo 조회 (삭제되지 않은 것들)
 */
export function getActiveTodos(): Todo[] {
  return loadTodos().filter((t) => !t.deletedAt);
}

/**
 * 특정 날짜의 Todo 조회
 */
export function getTodosByDate(date: string): Todo[] {
  return getActiveTodos().filter((t) => t.date === date);
}

// ============================================================================
// 5. Routine 관련
// ============================================================================

/**
 * 모든 Routine 저장
 */
export function saveRoutines(routines: Routine[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
    updateLastModified();
    return true;
  } catch (e) {
    handleStorageError(e, 'Routines 저장 실패');
    return false;
  }
}

/**
 * 모든 Routine 로드
 */
export function loadRoutines(): Routine[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    if (!data) return [];

    const routines = JSON.parse(data);
    return Array.isArray(routines) ? routines : [];
  } catch (e) {
    handleStorageError(e, 'Routines 로드 실패');
    return [];
  }
}

/**
 * Routine 추가
 */
export function addRoutine(routine: Routine): boolean {
  const routines = loadRoutines();
  routines.push(routine);
  return saveRoutines(routines);
}

/**
 * Routine 업데이트
 */
export function updateRoutine(id: string, updates: Partial<Routine>): boolean {
  const routines = loadRoutines();
  const index = routines.findIndex((r) => r.id === id);

  if (index === -1) {
    console.warn(LOG_PREFIX, `Routine ${id} 찾을 수 없음`);
    return false;
  }

  routines[index] = { ...routines[index], ...updates };
  return saveRoutines(routines);
}

/**
 * Routine 삭제 (소프트)
 */
export function deleteRoutine(id: string): boolean {
  return updateRoutine(id, { deletedAt: new Date().toISOString() });
}

/**
 * 활성 Routine 조회 (삭제되지 않은 것들)
 */
export function getActiveRoutines(): Routine[] {
  return loadRoutines().filter((r) => !r.deletedAt);
}

// ============================================================================
// 6. TodoCompletion 관련
// ============================================================================

/**
 * 모든 TodoCompletion 저장
 */
export function saveTodoCompletions(completions: TodoCompletion[]): boolean {
  try {
    localStorage.setItem(
      STORAGE_KEYS.TODO_COMPLETIONS,
      JSON.stringify(completions)
    );
    updateLastModified();
    return true;
  } catch (e) {
    handleStorageError(e, 'TodoCompletions 저장 실패');
    return false;
  }
}

/**
 * 모든 TodoCompletion 로드
 */
export function loadTodoCompletions(): TodoCompletion[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TODO_COMPLETIONS);
    if (!data) return [];

    const completions = JSON.parse(data);
    return Array.isArray(completions) ? completions : [];
  } catch (e) {
    handleStorageError(e, 'TodoCompletions 로드 실패');
    return [];
  }
}

/**
 * TodoCompletion 추가
 */
export function addTodoCompletion(completion: TodoCompletion): boolean {
  const completions = loadTodoCompletions();
  completions.push(completion);
  return saveTodoCompletions(completions);
}

/**
 * 특정 루틴의 특정 날짜 완료 여부 조회
 */
export function isTodoCompleted(routineId: string, date: string): boolean {
  const completions = loadTodoCompletions();
  return completions.some(
    (c) => c.routineId === routineId && c.date === date && c.completed
  );
}

/**
 * 특정 루틴의 특정 날짜 완료 상태 업데이트
 */
export function setTodoCompletion(
  routineId: string,
  date: string,
  completed: boolean
): boolean {
  const completions = loadTodoCompletions();
  const existing = completions.find(
    (c) => c.routineId === routineId && c.date === date
  );

  if (existing) {
    existing.completed = completed;
    existing.completedAt = completed ? new Date().toISOString() : undefined;
  } else if (completed) {
    completions.push({
      id: uuidv4(),
      routineId,
      date,
      completed: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
  }

  return saveTodoCompletions(completions);
}

// ============================================================================
// 7. DDay 관련
// ============================================================================

/**
 * DDay 저장
 */
export function saveDDay(dday: DDay): boolean {
  try {
    if (!validateDDay(dday)) {
      console.error(LOG_PREFIX, 'DDay 유효하지 않음');
      return false;
    }

    localStorage.setItem(STORAGE_KEYS.DDAY, JSON.stringify(dday));
    updateLastModified();
    return true;
  } catch (e) {
    handleStorageError(e, 'DDay 저장 실패');
    return false;
  }
}

/**
 * DDay 로드
 */
export function loadDDay(): DDay | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DDAY);
    if (!data) return null;

    const dday = JSON.parse(data);

    if (!validateDDay(dday)) {
      console.error(LOG_PREFIX, 'DDay 스키마 유효하지 않음');
      return null;
    }

    return dday;
  } catch (e) {
    handleStorageError(e, 'DDay 로드 실패');
    return null;
  }
}

/**
 * DDay 검증
 */
function validateDDay(dday: any): dday is DDay {
  return (
    typeof dday.id === 'string' &&
    ['natural', 'artificial', 'ivf'].includes(dday.type) &&
    typeof dday.targetDate === 'string' &&
    typeof dday.name === 'string'
  );
}

// ============================================================================
// 8. Character 관련
// ============================================================================

/**
 * Character 저장
 */
export function saveCharacter(character: Character): boolean {
  try {
    if (!validateCharacter(character)) {
      console.error(LOG_PREFIX, 'Character 유효하지 않음');
      return false;
    }

    localStorage.setItem(STORAGE_KEYS.CHARACTER, JSON.stringify(character));
    updateLastModified();
    return true;
  } catch (e) {
    handleStorageError(e, 'Character 저장 실패');
    return false;
  }
}

/**
 * Character 로드
 */
export function loadCharacter(): Character | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHARACTER);
    if (!data) return null;

    const character = JSON.parse(data);

    if (!validateCharacter(character)) {
      console.error(LOG_PREFIX, 'Character 스키마 유효하지 않음');
      return null;
    }

    return character;
  } catch (e) {
    handleStorageError(e, 'Character 로드 실패');
    return null;
  }
}

/**
 * Character 검증
 */
function validateCharacter(character: any): character is Character {
  return (
    typeof character.level === 'number' &&
    typeof character.currentExp === 'number' &&
    typeof character.totalExp === 'number' &&
    typeof character.nextLevelExp === 'number'
  );
}

/**
 * EXP 추가 및 자동 레벨업
 */
export function addExp(amount: number): boolean {
  const character = loadCharacter();
  if (!character) return false;

  character.currentExp += amount;
  character.totalExp += amount;

  // 자동 레벨업
  while (character.currentExp >= character.nextLevelExp) {
    character.currentExp -= character.nextLevelExp;
    character.level += 1;
  }

  return saveCharacter(character);
}

// ============================================================================
// 9. 온보딩 관련
// ============================================================================

/**
 * 온보딩 진행 상태 저장
 */
export function saveOnboardingProgress(progress: OnboardingProgress): boolean {
  try {
    localStorage.setItem(
      STORAGE_KEYS.ONBOARDING_PROGRESS,
      JSON.stringify(progress)
    );
    return true;
  } catch (e) {
    handleStorageError(e, 'OnboardingProgress 저장 실패');
    return false;
  }
}

/**
 * 온보딩 진행 상태 로드
 */
export function loadOnboardingProgress(): OnboardingProgress | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ONBOARDING_PROGRESS);
    if (!data) return null;

    return JSON.parse(data);
  } catch (e) {
    handleStorageError(e, 'OnboardingProgress 로드 실패');
    return null;
  }
}

/**
 * 온보딩 완료 (최종 데이터 생성)
 */
export function completeOnboarding(
  gender: string,
  birthDate: string,
  stage: string,
  ddayDate: string
): boolean {
  try {
    // User 생성
    const user: User = {
      id: uuidv4(),
      gender: gender as 'female' | 'male',
      birthDate,
      stage: stage as 'natural' | 'artificial' | 'ivf',
      role: 'owner',
      createdAt: new Date().toISOString(),
    };

    // DDay 생성
    const ddayNameMap = {
      natural: '배란일',
      artificial: '시술일',
      ivf: '이식일',
    };

    const dday: DDay = {
      id: uuidv4(),
      type: user.stage,
      targetDate: ddayDate,
      name: ddayNameMap[user.stage] as '배란일' | '시술일' | '이식일',
      createdAt: new Date().toISOString(),
    };

    // Character 생성
    const character: Character = {
      level: DEFAULT_VALUES.LEVEL,
      currentExp: DEFAULT_VALUES.CURRENT_EXP,
      totalExp: DEFAULT_VALUES.TOTAL_EXP,
      nextLevelExp: DEFAULT_VALUES.NEXT_LEVEL_EXP,
    };

    // 저장
    const success = saveUser(user) && saveDDay(dday) && saveCharacter(character);

    if (success) {
      // 초기 배열 생성
      saveTodos([]);
      saveRoutines([]);
      saveTodoCompletions([]);

      // 온보딩 진행 상태 삭제
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_PROGRESS);

      console.log(LOG_PREFIX, '온보딩 완료');
    }

    return success;
  } catch (e) {
    handleStorageError(e, '온보딩 완료 실패');
    return false;
  }
}

// ============================================================================
// 10. AppState 관련 (일괄 저장/로드)
// ============================================================================

/**
 * AppState 일괄 저장
 */
export function saveAppState(state: AppState): boolean {
  try {
    const success =
      saveUser(state.user) &&
      saveDDay(state.dday) &&
      saveCharacter(state.character) &&
      saveTodos(state.todos) &&
      saveRoutines(state.routines) &&
      saveTodoCompletions(state.todoCompletions);

    if (state.partner) {
      savePartner(state.partner);
    }

    return success;
  } catch (e) {
    handleStorageError(e, 'AppState 저장 실패');
    return false;
  }
}

/**
 * AppState 일괄 로드
 */
export function loadAppState(): AppState | null {
  try {
    const user = loadUser();
    const dday = loadDDay();
    const character = loadCharacter();

    if (!user || !dday || !character) {
      console.warn(LOG_PREFIX, '핵심 데이터 손실');
      return null;
    }

    return {
      user,
      dday,
      character,
      partner: loadPartner() || undefined,
      todos: loadTodos(),
      routines: loadRoutines(),
      todoCompletions: loadTodoCompletions(),
    };
  } catch (e) {
    handleStorageError(e, 'AppState 로드 실패');
    return null;
  }
}

// ============================================================================
// 11. 앱 상태 확인
// ============================================================================

/**
 * 앱 초기화 상태 확인
 */
export interface AppInitState {
  hasUser: boolean;
  hasDDay: boolean;
  mode: 'single' | 'couple' | 'onboarding';
}

export function checkAppState(): AppInitState {
  const user = loadUser();
  const partner = loadPartner();

  if (!user) {
    return {
      hasUser: false,
      hasDDay: false,
      mode: 'onboarding',
    };
  }

  return {
    hasUser: true,
    hasDDay: !!loadDDay(),
    mode: partner ? 'couple' : 'single',
  };
}

/**
 * 필수 데이터 재생성 (데이터 손상 시)
 */
export function ensureRequiredData(): void {
  const user = loadUser();

  if (!user) {
    console.warn(LOG_PREFIX, 'User 데이터 없음');
    return;
  }

  const dday = loadDDay();
  if (!dday) {
    console.warn(LOG_PREFIX, 'DDay 데이터 손실, 재생성 중...');
    const ddayNameMap = {
      natural: '배란일',
      artificial: '시술일',
      ivf: '이식일',
    };

    const newDDay: DDay = {
      id: uuidv4(),
      type: user.stage,
      targetDate: new Date().toISOString().split('T')[0],
      name: ddayNameMap[user.stage] as '배란일' | '시술일' | '이식일',
      createdAt: new Date().toISOString(),
    };

    saveDDay(newDDay);
  }

  const character = loadCharacter();
  if (!character) {
    console.warn(LOG_PREFIX, 'Character 데이터 손실, 재생성 중...');
    const newCharacter: Character = {
      level: DEFAULT_VALUES.LEVEL,
      currentExp: DEFAULT_VALUES.CURRENT_EXP,
      totalExp: DEFAULT_VALUES.TOTAL_EXP,
      nextLevelExp: DEFAULT_VALUES.NEXT_LEVEL_EXP,
    };

    saveCharacter(newCharacter);
  }
}

// ============================================================================
// 12. 데이터 초기화
// ============================================================================

/**
 * 투두/루틴 초기화 (프로필 유지)
 */
export function clearAllData(): boolean {
  try {
    saveTodos([]);
    saveRoutines([]);
    saveTodoCompletions([]);

    // Character 리셋
    const character: Character = {
      level: DEFAULT_VALUES.LEVEL,
      currentExp: DEFAULT_VALUES.CURRENT_EXP,
      totalExp: DEFAULT_VALUES.TOTAL_EXP,
      nextLevelExp: DEFAULT_VALUES.NEXT_LEVEL_EXP,
    };

    saveCharacter(character);

    console.log(LOG_PREFIX, '데이터가 초기화되었습니다.');
    return true;
  } catch (e) {
    handleStorageError(e, '데이터 초기화 실패');
    return false;
  }
}

/**
 * 완전 리셋 (모든 데이터 삭제) - Phase 2+
 */
export function resetApp(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });

  console.log(LOG_PREFIX, '앱이 리셋되었습니다.');
}

// ============================================================================
// 13. 마이그레이션 (Phase 2+)
// ============================================================================

/**
 * 데이터 마이그레이션 (버전별)
 */
export function migrateData(fromVersion: string, toVersion: string): void {
  console.log(LOG_PREFIX, `마이그레이션: ${fromVersion} → ${toVersion}`);

  // Phase 2+에서 구현
  // 예: 1.0.0 → 1.1.0 시 Routine에 category 기본값 추가 등
}

// ============================================================================
// 14. 유틸리티
// ============================================================================

/**
 * 마지막 수정 시각 업데이트
 */
function updateLastModified(): void {
  localStorage.setItem(
    STORAGE_KEYS.LAST_UPDATED,
    new Date().toISOString()
  );
}

/**
 * 에러 처리
 */
function handleStorageError(error: unknown, context: string): void {
  if (error instanceof Error) {
    if (error.name === 'QuotaExceededError') {
      console.error(LOG_PREFIX, `${context} - localStorage 용량 초과`);
      // Phase 2+: 오래된 데이터 정리 로직
    } else {
      console.error(LOG_PREFIX, `${context}:`, error.message);
    }
  } else {
    console.error(LOG_PREFIX, `${context}: 알 수 없는 에러`);
  }
}

// ============================================================================
// 15. Export (편의 함수 모음)
// ============================================================================

/**
 * 전체 저장소 서비스
 */
export const StorageService = {
  // 초기화
  initialize: initializeStorage,
  getVersion: getStorageVersion,

  // User
  saveUser,
  loadUser,

  // Partner
  savePartner,
  loadPartner,
  deletePartner,

  // Todo
  saveTodos,
  loadTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  getActiveTodos,
  getTodosByDate,

  // Routine
  saveRoutines,
  loadRoutines,
  addRoutine,
  updateRoutine,
  deleteRoutine,
  getActiveRoutines,

  // TodoCompletion
  saveTodoCompletions,
  loadTodoCompletions,
  addTodoCompletion,
  isTodoCompleted,
  setTodoCompletion,

  // DDay
  saveDDay,
  loadDDay,

  // Character
  saveCharacter,
  loadCharacter,
  addExp,

  // Onboarding
  saveOnboardingProgress,
  loadOnboardingProgress,
  completeOnboarding,

  // AppState
  saveAppState,
  loadAppState,
  checkAppState,
  ensureRequiredData,

  // 초기화
  clearAllData,
  resetApp,

  // 마이그레이션
  migrateData,
};
