import Usuario from '../models/usuario.js'


export async function abrecadastro(req, res){
    res.render('/views/cadastro')
}

export async function cadastro(req, res){
    //esse comando equivale a um if
    const admin = req.body.admin=="on" ? true : false;

    const novousuario = new Usuario({
        nome: req.body.nome,
        email: req.body.email,
        senha: req.body.senha,
        numero: req.body.numero,
        datanasc: req.body.datanasc

        
    })

    await novousuario.save();
    res.send("Cadastrado com sucesso!")
}

export async function abrelogin(req, res){
    res.render('/views/admin/index.ejs')
}

export async function login(req, res){
    res.redirect('/views/admin/index.ejs')
}
