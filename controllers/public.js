import Usuario from '../models/usuarios.js'


export async function abrecadastro(req, res){
    res.render('cadastro')
}

export async function cadastro(req, res){
    //esse comando equivale a um if
    const admin = false;

    const novousuario = new Usuario({
        nome: req.body.nome,
        email: req.body.email,
        senha: req.body.senha,
        numero: req.body.numero || req.body.telefone,
        datanasc: req.body.datanasc || new Date(),
        admin: admin,
        superadmin: false

        
    })

    try {
        const existente = await Usuario.findOne({ email: req.body.email });
        if (existente) {
            return res.status(409).render('cadastro', { erro: 'Email já cadastrado.' });
        }

        await novousuario.save();
        return res.redirect('/login');
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        return res.status(500).render('cadastro', { erro: 'Erro ao cadastrar usuário.' });
    }
}

export async function abrelogin(req, res){
    res.render('login')
}

export async function login(req, res){
    try {
        const { nome, senha, tipo } = req.body;
        const usuario = await Usuario.findOne({ nome, senha });

        if (!usuario) {
            return res.status(401).render('login', { erro: 'Usuário ou senha inválidos.' });
        }

        if (tipo === 'admin' && !usuario.admin && !usuario.superadmin) {
            return res.status(403).render('login', { erro: 'Usuário sem permissão de admin.' });
        }

        req.session.user = {
            id: usuario._id,
            nome: usuario.nome,
            role: tipo,
            superadmin: usuario.superadmin === true
        };

        return res.redirect(tipo === 'admin' ? '/admin/denuncia/lst' : '/usuario/denuncia/lst');
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).render('login', { erro: 'Erro ao realizar login.' });
    }
}

export async function abreCadastroAdmin(req, res) {
    return res.render('admin/usuarios/add');
}

export async function cadastroAdmin(req, res) {
    try {
        const { nome, email, senha } = req.body;
        const existente = await Usuario.findOne({ email });
        if (existente) {
            return res.status(409).render('admin/usuarios/add', { erro: 'Email já cadastrado.' });
        }

        const novoAdmin = new Usuario({
            nome,
            email,
            senha,
            admin: true,
            superadmin: false
        });

        await novoAdmin.save();
        return res.redirect('/admin/denuncia/lst');
    } catch (error) {
        console.error('Erro ao cadastrar admin:', error);
        return res.status(500).render('admin/usuarios/add', { erro: 'Erro ao cadastrar admin.' });
    }
}
