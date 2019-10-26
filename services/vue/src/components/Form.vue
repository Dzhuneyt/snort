<template>
    <div class="hello">
        <h1>Snort - URL shortening service</h1>
        <md-field>
            <label>URL here</label>
            <md-input v-model="url"></md-input>
            <md-button v-on:click="shorten" class="md-dense md-raised md-primary">Shorten</md-button>
        </md-field>

        <div v-if="hashed_url !== ''">{{hashed_url}}</div>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        name: 'Form',
        props: {},
        data: () => ({
            url: '',
            hashed_url: '',
            encrypted: '',
        }),
        methods: {
            shorten() {
                axios
                    .post('http://0.0.0.0:8081/api/link', {
                        // Try to get a component data variable
                        url: this.url
                    })
                    .then((res) => {
                        const hash = res.data.hash;
                        this.hashed_url = 'http://localhost:8080/' + hash;
                        // Do something with the response
                    });
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .hello {
        width: 700px;
        margin: auto;
    }
</style>
