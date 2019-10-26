<template>
    <div>
        Hash is: {{ $route.params.hash }}
    </div>
</template>
<script>
    import axios from 'axios';

    export default {
        name: "VisitedLink",
        mounted() {
            const hash = this.$route.params.hash;

            axios
                .get(process.env.VUE_APP_BACKEND + '/api/link/' + hash)
                .then((res) => {
                    // Do something with the response
                    window.location = res.data.url;
                });
        }
    }
</script>
<style scoped>

</style>
