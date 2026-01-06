export default {
  server: {
    host: 'lingshin',  
    port: 8080
  },

    urlbase: function() { return `http://${this.server.host}:${this.server.port}` }
}