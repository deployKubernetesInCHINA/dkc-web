import Vue from 'vue'
import VueRouter from 'vue-router'
import EditView from "../views/EditView";
import LoadFromYaml from "../components/LoadFromYaml";
import Aliyun from "../components/Aliyun";
import Offline from "../components/Offline";
Vue.use(VueRouter)

const routes = [
  {
    path: '/edit/:num',
    name: 'Home',
    component: EditView,
    props: true
  },
  {
    path: '/edit',
    name: 'Home',
    component: EditView,
    props: true
  },
  {
    path: '/loadfromyaml',
    name: 'LoadFromYaml',
    component: LoadFromYaml,
    props: true
  },
  {
    path: '/aliyun',
    name: 'Aliyun',
    component: Aliyun,
    props: true
  },
  {
    path: '/offline',
    name: 'Offline',
    component: Offline,
    props: true
  },
  // {
  //   path: '/edit/3',
  //   name: 'Home',
  //   component: EditView,
  //   props: 3
  // },
  // {
  //   path: '/edit/4',
  //   name: 'Home',
  //   component: EditView,
  //   props: 4
  // },
  // {
  //   path: '/edit/5',
  //   name: 'Home',
  //   component: EditView,
  //   props: 5
  // },
  // {
  //   path: '/edit/6',
  //   name: 'Home',
  //   component: EditView,
  //   props: 6
  // },
  // {
  //   path: '/edit/8',
  //   name: 'Home',
  //   component: EditView,
  //   props: 8
  // },
  {
    path: '/',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
