//@flow weak
import rethink from 'oolon-rethink'

export const db = rethink('rethinkdb://localhost:28015/gmfy')
export const r = require('rethinkdb')
