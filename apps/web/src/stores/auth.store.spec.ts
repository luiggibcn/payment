import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "./auth.store";

// Mock de Supabase
vi.mock("@/clients/supabase", () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

// Mock de redirect util
vi.mock("@/utils", () => ({
  redirectTo: vi.fn(),
}));


describe("auth.store", () => {
  let store: ReturnType<typeof useAuthStore>;


  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAuthStore();
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should have initial state", () => {
      expect(store.user).toBeNull();
      expect(store.session).toBeNull();
      expect(store.loading).toBe(false);
      expect(store.initialized).toBe(false);
    });

    it("should not be authenticated initially", () => {
      expect(store.isAuthenticated).toBe(false);
    });
    });
});
