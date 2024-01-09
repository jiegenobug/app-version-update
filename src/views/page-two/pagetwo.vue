<template>
    <div>
        <update-version-two ref="com2">
            <template #default>
                <div @click="onClick">插槽调用检测更新></div>
            </template>
        </update-version-two>
    </div>
</template>

<script>
import UpdateVersionTwo from "./UpdateVersionTwo.vue";
export default {
    components: { UpdateVersionTwo },
    methods: {
        onClick() {
            this.$refs.com2.versionUpdate();
        },
    },
};
</script>

<style>
</style>