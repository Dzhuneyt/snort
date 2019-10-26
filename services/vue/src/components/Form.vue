<template>
    <div class="wrap">
        <h1>Snort - URL shortening service</h1>
        <md-field>
            <label>URL here</label>
            <md-input v-model="url"></md-input>
            <md-button v-on:click="shorten" class="md-dense md-raised md-primary">Shorten</md-button>
        </md-field>

        <div v-if="hashed_url !== ''">
            <router-link :to="{ name: 'visitlink', params: { hash: hash }}">{{hashed_url}}</router-link>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        name: 'Form',
        props: {},
        data: () => ({
            url: '',
            hash: '',
            hashed_url: '',
            encrypted: '',
        }),
        methods: {
            shorten() {
                axios
                    .post(process.env.VUE_APP_BACKEND + '/api/link', {
                        // Try to get a component data variable
                        url: this.url
                    })
                    .then((res) => {
                        const hash = res.data.hash;
                        this.hash = hash;
                        this.hashed_url = window.location.protocol + '//' + window.location.host + '/' + hash;
                        // Do something with the response
                    });
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .wrap {
        width: 700px;
        margin: auto;
    }
</style>
