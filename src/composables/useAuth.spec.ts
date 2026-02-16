import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuth } from "./useAuth";
import { useAuthStore } from "@/stores/auth.store";
import type { User, Session } from "@supabase/supabase-js";

// Mock de Supabase
vi.mock("@/clients/supabase", () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
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

import { supabase } from "@/clients/supabase";

describe("useAuth", () => {
  let authStore: ReturnType<typeof useAuthStore>;

  const mockUser: User = {
    id: "user-123",
    email: "test@example.com",
    user_metadata: { role: "user" },
    app_metadata: {},
    aud: "authenticated",
    created_at: "2026-02-15T00:00:00Z",
  } as User;

  const mockSession: Session = {
    access_token: "mock-token",
    refresh_token: "mock-refresh",
    user: mockUser,
  } as Session;

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore();
    vi.clearAllMocks();
  });

  describe("Basic Functionality", () => {
    it("should return auth store properties", () => {
      const auth = useAuth();

      expect(auth.user).toBeDefined();
      expect(auth.session).toBeDefined();
      expect(auth.loading).toBeDefined();
      expect(auth.isAuthenticated).toBeDefined();
    });

    it("should return auth store methods", () => {
      const auth = useAuth();

      expect(auth.signUp).toBeDefined();
      expect(auth.signIn).toBeDefined();
      expect(auth.signOut).toBeDefined();
      expect(auth.getCurrentUser).toBeDefined();
      expect(auth.getCurrentSession).toBeDefined();
      expect(auth.resetPassword).toBeDefined();
      expect(auth.updateUserRole).toBeDefined();
    });

    it("should have initial unauthenticated state", () => {
      const auth = useAuth();

      expect(auth.user).toBeNull();
      expect(auth.session).toBeNull();
      expect(auth.loading).toBe(false);
      expect(auth.isAuthenticated).toBe(false);
    });
  });

  describe("State Properties", () => {
    it("should reflect authenticated user state", () => {
      authStore.user = mockUser;
      authStore.session = mockSession;

      const auth = useAuth();

      expect(auth.user).toEqual(mockUser);
      expect(auth.session).toEqual(mockSession);
      expect(auth.isAuthenticated).toBe(true);
    });

    it("should reflect loading state", () => {
      authStore.loading = true;

      const auth = useAuth();

      expect(auth.loading).toBe(true);
    });

    it("should update when store changes", () => {
      const auth = useAuth();

      expect(auth.user).toBeNull();

      // Cambiar el store
      authStore.user = mockUser;
      authStore.session = mockSession;

      // Nueva llamada debe reflejar el cambio
      const auth2 = useAuth();
      expect(auth2.user).toEqual(mockUser);
      expect(auth2.isAuthenticated).toBe(true);
    });
  });

  describe("signUp Method", () => {
    it("should call authStore.signUp", async () => {
      const auth = useAuth();

      // 👇 Añadir identities al usuario
      const newUser = {
        ...mockUser,
        identities: [{ provider: "email", id: "identity-123" }],
      } as User;

      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: {
          user: newUser, // 👈 Usar newUser en lugar de mockUser
          session: null,
        },
        error: null,
      } as any);

      await auth.signUp("test@example.com", "password123");

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: {
          data: {
            full_name: undefined
          }
        }
      });
    });

    it("should handle signUp errors", async () => {
      const auth = useAuth();

      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: {
          message: "Invalid email",
          name: "AuthApiError",
          status: 400,
          code: "invalid_email",
          __isAuthError: true,
        },
      } as any);

      await expect(auth.signUp("invalid", "password")).rejects.toThrow(
        "Invalid email",
      );
    });
  });

  describe("signIn Method", () => {
    it("should call authStore.signIn", async () => {
      const auth = useAuth();

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      } as any);

      await auth.signIn("test@example.com", "password123");

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should update auth state after successful signIn", async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      } as any);

      const auth = useAuth();
      await auth.signIn("test@example.com", "password123");

      const auth2 = useAuth();
      expect(auth2.user).toEqual(mockUser);
      expect(auth2.isAuthenticated).toBe(true);
    });
  });

  describe("signOut Method", () => {
    it("should call authStore.signOut", async () => {
      const auth = useAuth();

      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: null,
      });

      await auth.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it("should clear auth state after signOut", async () => {
      authStore.user = mockUser;
      authStore.session = mockSession;

      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: null,
      });

      const auth = useAuth();
      await auth.signOut();

      const auth2 = useAuth();
      expect(auth2.user).toBeNull();
      expect(auth2.session).toBeNull();
      expect(auth2.isAuthenticated).toBe(false);
    });
  });

  describe("getCurrentUser Method", () => {
    it("should call authStore.fetchUser", async () => {
      const auth = useAuth();

      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      } as any);

      const user = await auth.getCurrentUser();

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(user).toEqual(mockUser);
    });

    it("should handle getCurrentUser errors", async () => {
      const auth = useAuth();

      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: {
          message: "User not found",
          name: "AuthApiError",
          status: 404,
          code: "user_not_found",
          __isAuthError: true,
        },
      } as any);

      const user = await auth.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe("getCurrentSession Method", () => {
    it("should call authStore.fetchSession", async () => {
      const auth = useAuth();

      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      } as any);

      const session = await auth.getCurrentSession();

      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(session).toEqual(mockSession);
    });

    it("should return null when no session", async () => {
      const auth = useAuth();

      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      } as any);

      const session = await auth.getCurrentSession();

      expect(session).toBeNull();
    });
  });

  describe("resetPassword Method", () => {
    it("should call authStore.resetPassword", async () => {
      const auth = useAuth();

      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
        data: {},
        error: null,
      } as any);

      await auth.resetPassword("test@example.com");

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        "test@example.com",
        expect.objectContaining({
          redirectTo: expect.stringContaining("/reset-password"),
        }),
      );
    });

    it("should handle resetPassword errors", async () => {
      const auth = useAuth();

      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
        data: {},
        error: {
          message: "Email not found",
          name: "AuthApiError",
          status: 404,
          code: "email_not_found",
          __isAuthError: true,
        },
      } as any);

      await expect(auth.resetPassword("notfound@example.com")).rejects.toThrow(
        "Email not found",
      );
    });
  });

  describe("updateUserRole Method", () => {
    it("should call authStore.updateUserRole", async () => {
      const auth = useAuth();

      const updatedUser = {
        ...mockUser,
        user_metadata: { role: "admin" },
      } as User;

      vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
        data: { user: updatedUser },
        error: null,
      } as any);

      await auth.updateUserRole("admin");

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: { role: "admin" },
      });
    });
  });

  describe("Integration with Auth Store", () => {
    it("should use the same auth store instance", () => {
      const directStore = useAuthStore();

      // Modificar el store directamente
      directStore.user = mockUser;

      // Cualquier llamada a useAuth debe reflejar el cambio
      const auth1 = useAuth();
      const auth2 = useAuth();

      expect(auth1.user).toEqual(mockUser);
      expect(auth2.user).toEqual(mockUser);
    });

    it("should maintain method references", () => {
      const auth1 = useAuth();
      const auth2 = useAuth();

      // Los métodos deben ser las mismas funciones del store
      expect(auth1.signIn).toBe(auth2.signIn);
      expect(auth1.signOut).toBe(auth2.signOut);
      expect(auth1.signUp).toBe(auth2.signUp);
    });
  });

  describe("Method Aliases", () => {
    it("should alias fetchUser as getCurrentUser", () => {
      const auth = useAuth();
      const store = useAuthStore();

      expect(auth.getCurrentUser).toBe(store.fetchUser);
    });

    it("should alias fetchSession as getCurrentSession", () => {
      const auth = useAuth();
      const store = useAuthStore();

      expect(auth.getCurrentSession).toBe(store.fetchSession);
    });
  });
});
