import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import AdminPage from '../components/AdminPage.vue'
import StudentPage from '../components/StudentPage.vue'
import TeacherPage from '../components/TeacherPage.vue'
import StudentsPage from '../components/StudentsPage.vue'
import TeachersPage from '../components/TeachersPage.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/Login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/Admin',
    name: 'Admin',
    component: AdminPage,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/Student',
    name: 'Student',
    component: StudentPage,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/Teacher',
    name: 'Teacher',
    component: TeacherPage,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/Students',
    name: 'Students',
    component: StudentsPage,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/Teachers',
    name: 'Teachers',
    component: TeachersPage,
    meta: { requiresAuth: true, role: 'admin' }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const userRole = token ? parseToken(token).rol : null

  if (to.path === '/' || (requiresAuth && !token)) {
    // Redirect to login page if accessing root path or if authentication is required but token is not present
    next('/login')
  } else if (requiresAuth && userRole !== to.meta.role) {
    // Redirect to corresponding role page if user role does not match the route's required role
    switch (userRole) {
      case 'admin':
        next('/Admin')
        break
      case 'student':
        next('/Student')
        break
      case 'teacher':
        next('/Teacher')
        break
      default:
        // Redirect to login page if user role is invalid
        next('/login')
    }
  } else {
    // Allow access to the route
    next()
  }
})

function parseToken (token) {
  // Assuming the token is in JWT format with a payload containing the user's role
  const [, payloadBase64] = token.split('.')
  const payloadJson = atob(payloadBase64)
  const payload = JSON.parse(payloadJson)
  return payload
}

export default router
