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
                .get('http://0.0.0.0:8081/api/link/' + hash)
                .then((res) => {
                    // Do something with the response
                    console.log(res)
                    window.location = res.data.url;
                });
        }
    }
</script>
<style scoped>

</style>
