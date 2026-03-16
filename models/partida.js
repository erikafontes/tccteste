import conexao from '../config/conexao.js'

const Partida = conexao.Schema({
  timedecasa: { type: conexao.Schema.Types.ObjectId, ref: 'Time', required: true },
  timedefora: { type: conexao.Schema.Types.ObjectId, ref: 'Time', required: true },
  golcasa: { type: Number},
  golfora: { type: Number},
  datapartida: { type: String }
})

export default conexao.model('Partida', Partida)
