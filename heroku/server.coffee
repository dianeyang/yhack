express = require 'express'
fs = require 'fs'
request = require 'request'
http = require 'http'
Client = require('request-json').JsonClient

port = process.env.PORT ? 9001

app = express()

server = http.createServer(app)

# app.get '/data', (req, res) ->
#     res.write "Dispatchers:\n\n"
#     for id, dispatcher of dispatchers
#         res.write "#{id} is " + (if dispatcher.busy then "busy" else "not busy") + "\n"   
#     res.end()

server.listen port, ->
    console.log "Listening on #{port}..."
