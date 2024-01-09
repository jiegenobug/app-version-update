import Vue from "vue";
import Router from 'vue-router'
Vue.use(Router)

const routes = [
    {
        path: '/',
        redirect: '/update1'
    },
    {
        path: '/layout',
        name: 'layout',
        component: () => import('@/views/layout.vue'),
        children: [
            {
                path: '/update1',
                component: () => import('@/views/page-one/UpdateVersionOne.vue')
            },
            {
                path: '/update2',
                component: () => import('@/views/page-two/pagetwo.vue')
            }
        ]
    }

]

const router = new Router({
    routes
})

export default router