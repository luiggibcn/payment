import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "./auth.store";
import type { User, Session } from "@supabase/supabase-js";

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

import { supabase } from "@/clients/supabase";
import { redirectTo } from "@/utils";

describe("auth.store", () => {
  let store: ReturnType<typeof useAuthStore>;

  const mockUser: User = {
    id: "user-123",
    email: "test@example.com",
    user_metadata: { role: "user" },
    app_metadata: {},
    aud: "authenticated",
    created_at: "2026-02-15T00:00:00Z",
    identities: [],
  } as User;

  const mockSession: Session = {
    access_token: "mock-token",
    refresh_token: "mock-refresh",
    user: mockUser,
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: "bearer",
  } as Session;

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

    it("should have default user role", () => {
      expect(store.userRole).toBe("user");
      expect(store.isUser).toBe(true);
      expect(store.isAdmin).toBe(false);
      expect(store.isModerator).toBe(false);
    });

    it("should have empty user email and id", () => {
      expect(store.userEmail).toBe("");
      expect(store.userId).toBe("");
    });
  });

  describe("signUp", () => {
    it("should sign up successfully with new user", async () => {
      const newUser = {
        ...mockUser,
        identities: [{ provider: "email", id: "identity-123" }],
      } as User;

      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: {
          user: newUser,
          session: null,
        },
        error: null,
      } as any);

      const result = await store.signUp("test@example.com", "password123");

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.user).toEqual(newUser);
      expect(result.session).toBeNull();
      expect(store.loading).toBe(false);
    });

    it('should throw error when user already exists (has session)', async () => {
  // Usuario con identities pero también con sesión (usuario existente auto-logueado)
  const existingUser = {
    ...mockUser,
    identities: [{ provider: 'email', id: 'identity-123' }] // ✅ Tiene identities
  } as User

  vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
    data: {
      user: existingUser,
      session: mockSession // ✅ Y también tiene sesión
    },
    error: null
  } as any)

  await expect(
    store.signUp('existing@example.com', 'password123')
  ).rejects.toThrow('This email is already registered. Please sign in instead.')

  expect(store.loading).toBe(false)
})

    it("should throw error when user already exists (identities empty)", async () => {
      const existingUser = {
        ...mockUser,
        identities: [],
      } as User;

      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: {
          user: existingUser,
          session: null,
        },
        error: null,
      } as any);

      await expect(
        store.signUp("existing@example.com", "password123"),
      ).rejects.toThrow(
        "This email is already registered. Please sign in instead.",
      );

      expect(store.loading).toBe(false);
    });

    it("should throw error when user already exists (has session)", async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      } as any);

      await expect(
        store.signUp("existing@example.com", "password123"),
      ).rejects.toThrow(
        "This email is already registered. Please sign in instead.",
      );
    });

    it("should handle Supabase errors with already registered message", async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: {
          user: null,
          session: null,
        },
        error: {
          message: "User already registered",
          name: "AuthApiError",
          status: 400,
          code: "user_already_exists",
          __isAuthError: true,
        },
      } as any);

      await expect(
        store.signUp("existing@example.com", "password123"),
      ).rejects.toThrow(
        "This email is already registered. Please sign in instead.",
      );
    });

    it("should handle other Supabase errors", async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: {
          user: null,
          session: null,
        },
        error: {
          message: "Invalid email format",
          name: "AuthApiError",
          status: 400,
          code: "invalid_email",
          __isAuthError: true,
        },
      } as any);

      await expect(
        store.signUp("invalid-email", "password123"),
      ).rejects.toThrow("Invalid email format");
    });

    it("should set loading state correctly", async () => {
      vi.mocked(supabase.auth.signUp).mockClear(); // 👈 Limpiar mock anterior

      const newUser = {
        ...mockUser,
        identities: [{ provider: "email", id: "identity-123" }],
      } as User;

      vi.mocked(supabase.auth.signUp).mockImplementationOnce(() => {
        expect(store.loading).toBe(true);
        return Promise.resolve({
          data: {
            user: newUser,
            session: null,
          },
          error: null,
        } as any);
      });

      await store.signUp("test@example.com", "password123");
      expect(store.loading).toBe(false);
    });
  });

  describe("signIn", () => {
    it("should sign in successfully", async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      } as any);

      const result = await store.signIn("test@example.com", "password123");

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(store.user).toEqual(mockUser);
      expect(store.session).toEqual(mockSession);
      expect(store.isAuthenticated).toBe(true);
      expect(result.user).toEqual(mockUser);
    });
      it('should handle sign in without setting user when data is incomplete', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: {
        user: mockUser,
        session: null // Sin sesión, no entra en el if
      },
      error: null
    } as any)

    const result = await store.signIn('test@example.com', 'password123')

    expect(result.user).toEqual(mockUser)
  })

    it("should handle invalid credentials", async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: null,
          session: null,
        },
        error: {
          message: "Invalid login credentials",
          name: "AuthApiError",
          status: 400,
          code: "invalid_credentials",
          __isAuthError: true,
        },
      } as any);

      await expect(
        store.signIn("wrong@example.com", "wrongpass"),
      ).rejects.toThrow("Invalid login credentials");

      expect(store.user).toBeNull();
      expect(store.session).toBeNull();
    });
  });

  describe("signOut", () => {
    it("should sign out successfully", async () => {
      store.user = mockUser;
      store.session = mockSession;

      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: null,
      });

      await store.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(store.user).toBeNull();
      expect(store.session).toBeNull();
      expect(redirectTo).toHaveBeenCalledWith("/login");
    });

    it("should handle signOut errors", async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: {
          message: "Network error",
          name: "AuthApiError",
          status: 500,
          code: "network_error",
          __isAuthError: true,
        },
      } as any);

      await expect(store.signOut()).rejects.toThrow("Network error");
    });
  });

  describe("fetchUser", () => {
    it("should fetch user successfully", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      } as any);

      const result = await store.fetchUser();

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(store.user).toEqual(mockUser);
      expect(result).toEqual(mockUser);
    });

    it("should handle fetch user error", async () => {
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

      const result = await store.fetchUser();

      expect(store.user).toBeNull();
      expect(result).toBeNull();
    });
  });

  describe("fetchSession", () => {
    it("should fetch session successfully", async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      } as any);

      const result = await store.fetchSession();

      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(store.session).toEqual(mockSession);
      expect(result).toEqual(mockSession);
    });

    it("should handle no session", async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      } as any);

      const result = await store.fetchSession();

      expect(store.session).toBeNull();
      expect(result).toBeNull();
    });
      it('should handle getSession error and set session to null', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: {
        message: 'Session expired',
        name: 'AuthApiError',
        status: 401,
        code: 'session_expired',
        __isAuthError: true
      }
    } as any)

    const result = await store.fetchSession()

    expect(supabase.auth.getSession).toHaveBeenCalled()
    expect(store.session).toBeNull()
    expect(result).toBeNull()
  })
  });

  describe("resetPassword", () => {
    it("should send reset password email", async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
        data: {},
        error: null,
      } as any);

      await store.resetPassword("test@example.com");

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        "test@example.com",
        { redirectTo: `${window.location.origin}/reset-password` },
      );
    });

    it("should handle reset password errors", async () => {
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

      await expect(store.resetPassword("notfound@example.com")).rejects.toThrow(
        "Email not found",
      );
    });
  });

  describe("updateUserRole", () => {
    it("should update user role to admin", async () => {
      const updatedUser = {
        ...mockUser,
        user_metadata: { role: "admin" },
      } as User;

      vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
        data: { user: updatedUser },
        error: null,
      } as any);

      await store.updateUserRole("admin");

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: { role: "admin" },
      });
      expect(store.user).toEqual(updatedUser);
      expect(store.userRole).toBe("admin");
      expect(store.isAdmin).toBe(true);
    });
      it('should not update store when user is null in response', async () => {
    const previousUser = mockUser
    store.user = previousUser

    vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
      data: { user: null }, // Sin user, no entra en el if
      error: null
    } as any)

    await store.updateUserRole('admin')

    // No debería cambiar el user del store
    expect(store.user).toEqual(previousUser)
  })
      it('should handle updateUserRole error', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
      data: { user: null },
      error: {
        message: 'Unauthorized',
        name: 'AuthApiError',
        status: 403,
        code: 'unauthorized',
        __isAuthError: true
      }
    } as any)

    await expect(
      store.updateUserRole('admin')
    ).rejects.toThrow('Unauthorized')

    expect(store.loading).toBe(false)
  })
  });

  describe("updateProfile", () => {
    it("should update user profile", async () => {
      const updates = { name: "John Doe", avatar: "avatar.jpg" };
      const updatedUser = {
        ...mockUser,
        user_metadata: { ...mockUser.user_metadata, ...updates },
      } as User;

      vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
        data: { user: updatedUser },
        error: null,
      } as any);

      await store.updateProfile(updates);

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: updates,
      });
      expect(store.user).toEqual(updatedUser);
    });
      it('should not update store when user is null in response', async () => {
    const previousUser = mockUser
    store.user = previousUser

    vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
      data: { user: null }, // Sin user, no entra en el if
      error: null
    } as any)

    await store.updateProfile({ name: 'Test' })

    // No debería cambiar el user del store
    expect(store.user).toEqual(previousUser)
  })
      it('should handle updateProfile error', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
      data: { user: null },
      error: {
        message: 'Update failed',
        name: 'AuthApiError',
        status: 500,
        code: 'update_failed',
        __isAuthError: true
      }
    } as any)

    await expect(
      store.updateProfile({ name: 'Test' })
    ).rejects.toThrow('Update failed')

    expect(store.loading).toBe(false)
  })
  });

  describe("Computed Properties", () => {
    it("should compute isAuthenticated correctly", () => {
      expect(store.isAuthenticated).toBe(false);

      store.user = mockUser;
      store.session = mockSession;

      expect(store.isAuthenticated).toBe(true);
    });

    it("should compute user role correctly", () => {
      expect(store.userRole).toBe("user");

      store.user = { ...mockUser, user_metadata: { role: "admin" } } as User;
      expect(store.userRole).toBe("admin");
      expect(store.isAdmin).toBe(true);
      expect(store.isUser).toBe(false);
    });

    it("should compute moderator role correctly", () => {
      store.user = {
        ...mockUser,
        user_metadata: { role: "moderator" },
      } as User;
      expect(store.userRole).toBe("moderator");
      expect(store.isModerator).toBe(true);
      expect(store.isAdmin).toBe(false);
      expect(store.isUser).toBe(false);
    });

    it("should compute userEmail correctly", () => {
      expect(store.userEmail).toBe("");

      store.user = mockUser;
      expect(store.userEmail).toBe("test@example.com");
    });

    it("should compute userId correctly", () => {
      expect(store.userId).toBe("");

      store.user = mockUser;
      expect(store.userId).toBe("user-123");
    });
  });

  describe("initialize", () => {
    it("should initialize only once", async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      await store.initialize();
      expect(store.initialized).toBe(true);

      // Llamar de nuevo
      await store.initialize();

      // Solo debería haberse llamado una vez
      expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
    });

    it("should setup auth state change listener", async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      await store.initialize();

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
    it('should handle auth state change with new session', async () => {
    let authCallback: any

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    } as any)
    
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null
    } as any)

    // Capturar el callback
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementationOnce((callback) => {
      authCallback = callback
      return {
        data: { subscription: { unsubscribe: vi.fn() } }
      } as any
    })

    await store.initialize()

    // Simular cambio de auth con nueva sesión
    await authCallback('SIGNED_IN', mockSession)

    expect(store.session).toEqual(mockSession)
    expect(supabase.auth.getUser).toHaveBeenCalled()
  })

  // 👇 NUEVO TEST - callback sin sesión (logout)
  it('should handle auth state change without session', async () => {
    let authCallback: any

    // Setup inicial con usuario logueado
    store.user = mockUser
    store.session = mockSession

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null
    } as any)
    
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null
    } as any)

    // Capturar el callback
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementationOnce((callback) => {
      authCallback = callback
      return {
        data: { subscription: { unsubscribe: vi.fn() } }
      } as any
    })

    await store.initialize()

    // Simular logout (sin sesión)
    await authCallback('SIGNED_OUT', null)

    expect(store.session).toBeNull()
    expect(store.user).toBeNull()
  })
  });
});
