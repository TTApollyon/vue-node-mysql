import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import setJson from '@/components/HelloWorld'

import testD3 from '@/components/testD3'

Vue.use(VueRouter)
Vue.use(VueResource)

export default new VueRouter({
    routes:[
        {
            path:'/sendJson',
            component:setJson
        },
        
        {
            path:'/testD3',
            component:testD3
        }
    ]
})