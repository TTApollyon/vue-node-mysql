import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import setJson from '@/components/HelloWorld'
import testShow from '@/components/testShow'

Vue.use(VueRouter)
Vue.use(VueResource)

export default new VueRouter({
    routes:[
        {
            path:'/sendJson',
            component:setJson
        },
        {
            path:'/testShow',
            component:testShow
        }
    ]
})