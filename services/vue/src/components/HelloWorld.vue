<template>
    <div class="hello">
        <h1>{{ msg }}</h1>
        <md-field>
            <label>URL here</label>
            <md-input v-model="url"></md-input>
            <md-button v-on:click="shorten" class="md-dense md-raised md-primary">Shorten</md-button>
        </md-field>
    </div>
</template>

<script>
    export default {
        name: 'HelloWorld',
        props: {
            msg: String
        },
        data: () => ({
            url: '',
        }),
        methods: {
            shorten: () => {
                debugger;
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

    h3 {
        margin: 40px 0 0;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        display: inline-block;
        margin: 0 10px;
    }

    a {
        color: #42b983;
    }
</style>
