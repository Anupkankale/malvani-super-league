// /admin needs a login; /login is skipped once you're signed in.
export default defineNuxtRouteMiddleware((to) => {
  const { isAdmin } = useLeague()
  if (to.path === '/admin' && !isAdmin.value) return navigateTo('/login')
  if (to.path === '/login' && isAdmin.value) return navigateTo('/admin')
})
