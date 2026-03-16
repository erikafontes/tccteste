import conexao from '../config/conexao.js';

const Jogador = new conexao.Schema({
    nome: { type: String, required: true },
    camisa: { type: String, required: true },
    time: { type: conexao.Types.ObjectId, ref: 'Time', required: false },
    posicao: { type: String, required: true },
    foto: { type: String, required: false }
});

export default conexao.model('Jogador', Jogador);
