<template>
    <div class="container">
        <router-view></router-view>
        <van-tabbar v-model="active">
            <van-tabbar-item to="/update1" icon="home-o">组件</van-tabbar-item>
            <van-tabbar-item to="/update2" icon="setting-o">组件+插槽</van-tabbar-item>
        </van-tabbar>
    </div>
</template>

<script>
export default {
    components: {},
    props: {},
    data() {
        return {
            active: 0,
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {},
    methods: {},
};
</script>

<style scoped lang="less">
.container {
}
</style>
