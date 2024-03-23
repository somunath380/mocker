<script setup>
import Error from './components/Error.vue';
</script>

<template>
    <router-view></router-view>
    <div class="err">
        <error/>
    </div>
</template>

<style scoped>
.err {
    position: fixed; /* Ensures the element stays in place even when scrolling */
    bottom: 20px; /* Distance from the bottom edge */
    right: 50px; /* Distance from the right edge */
    /* z-index: 100; Ensures the error component remains on top of other elements */
}
</style>
