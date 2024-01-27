/* eslint-disable */
import {createRouter, createWebHistory} from "vue-router";
import Login from '../components/Login.vue'
import Root from '../components/Root.vue';
import Signup from '../components/Signup.vue'
import Profile from '../components/Profile.vue'

const routes = [
    {
        name: "Login",
        path: "/login",
        component: Login
    },
    {
        name: "Root",
        path: "/",
        component: Root
    },
    {
        name: "Signup",
        path: "/signup",
        component: Signup
    },
    {
        name: "Profile",
        path: "/profile/:userid",
        component: Profile
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router

