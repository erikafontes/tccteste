import conexao from '../config/conexao.js'

const Usuario = conexao.Schema({
    nome: {type:String, required:true},
    numero: {type:Number, required:true},
    email: {type:String, required:true},
    senha: {type:String, required:true},
    datanasc:{type: Date, required:true}
})

export default conexao.model('Usuario',Usuario)