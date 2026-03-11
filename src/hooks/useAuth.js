"use client"

import { useEffect } from 'react'
import useAuthStore from '@/store/useAuthStore'

/**
 * Initializes auth state from localStorage and handles OAuth callback.
 *
 * The OAuth flow works via the Cloudflare Worker:
 * 1. User clicks Sign In → redirected to accounts.elixpo.com
 * 2. After consent, redirected to Worker /api/auth/callback
 * 3. Worker exchanges code for tokens, creates session, returns JSON
 * 4. Worker redirects back to app with ?auth_token=...&auth_user=... in URL
 * 5. This hook picks up those params and stores them
 */
export default function useAuth() {
  const init = useAuthStore((s) => s.init)
  const handleCallback = useAuthStore((s) => s.handleCallback)

  useEffect(() => {
    // Check for OAuth callback params in URL
    const url = new URL(window.location.href)
    const authToken = url.searchParams.get('auth_token')
    const authUser = url.searchParams.get('auth_user')

    if (authToken && authUser) {
      try {
        const user = JSON.parse(decodeURIComponent(authUser))
        handleCallback(authToken, user)
      } catch (e) {
        console.warn('[Auth] Failed to parse callback params:', e)
      }

      // Clean URL params without reload
      url.searchParams.delete('auth_token')
      url.searchParams.delete('auth_user')
      window.history.replaceState(null, '', url.pathname + url.hash)
      return
    }

    // Normal init — restore from localStorage
    init()
  }, [init, handleCallback])
}
