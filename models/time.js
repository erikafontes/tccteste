import conexao from '../config/conexao.js'

const Time = conexao.Schema({
    nome: {type:String, required:true},
    estadio:{type:String},
    classificacao:{type:Number},
    datafundacao:{type:String},
    pontos:{type:Number},
    escudo:{type:String, required:false}
});

export default conexao.model('Time',Time)
