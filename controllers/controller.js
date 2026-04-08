import Denuncia from '../models/denuncia.js';
import Alerta from '../models/alerta.js';
import Relatorio from '../models/relatorio.js';
// import Jogador from '../models/jogador.js';
// import Partida from '../models/partida.js';

export const home = async (req, res) => {
   
  
    res.render("admin/index");
  };

export async function abreadddenuncia(req, res) {
    res.render('admin/denuncia/add2')
}
export async function adddenuncia(req, res) {
    const fotoupload = req.file ? req.file.filename : null;

    await Denuncia.create({
        ndenuncia: req.body.ndenuncia,
        nomedenunciante: req.body.nomeDenunciante,
        email: req.body.email,
        fonte: req.body.fonte || 'Site',
        data: req.body.data,
        hora: req.body.hora,
        endereco: req.body.endereco,
        especie: req.body.especie,
        quantidade: req.body.quantidade,
        situacao: req.body.situacao,
        foto: fotoupload,
        nome: req.body.nome,
        cpf: req.body.cpf,
        telefone: req.body.telefone,
        enderecoProprietario: req.body.enderecoProprietario,
        providencia: req.body.providencia
    });
    res.redirect('/admin/denuncia/lst');
}
export async function listardenuncia(req, res) {
    const resultado = await Denuncia.find({}).catch(function(err){console.log(err)});
    res.render('admin/denuncia/lst',{Denuncias: resultado});
}
export async function filtrardenuncia(req, res) {
    const resposta = await Denuncia.find({nome: new RegExp(req.body.pesquisar,"i")})
    res.render('admin/denuncia/lst',{Denuncias: resposta});
}

export async function deletardenuncia(req, res) {
    await Denuncia.findByIdAndDelete(req.params.id)
    res.redirect('/admin/denuncia/lst')
}
export async function abreedtdenuncia(req, res){
    const resultado = await Denuncia.findById(req.params.id)
    res.render('admin/denuncia/edt',{Denuncia: resultado})
}
export async function abreverdenuncia(req, res){
    const resultado = await Denuncia.findById(req.params.id)
    res.render('admin/denuncia/ver',{Denuncia: resultado})
}
export async function edtdenuncia(req, res) {
  try {
    const updateData = {
      providencia: req.body.providencia
    };

    if (req.file) {
      updateData.foto = req.file.filename;
    } else if (req.body.fotoatual) {
      updateData.foto = req.body.fotoatual;
    } else {
      updateData.foto = null;
    }

    // Força retorno do documento atualizado (útil para depurar)
    const denunciaAtualizada = await Denuncia.findByIdAndUpdate(req.params.id, updateData, { new: true });
    console.log('Denuncia atualizada:', denunciaAtualizada);

    res.redirect('/admin/denuncia/lst');
  } catch (error) {
    console.error('Erro ao atualizar denuncia:', error);
    res.status(500).send('Erro ao atualizar denuncia');
  }
}



export async function listarrelatorio(req, res) {
    try {
        // denúncias para cards e gráficos 
        const denuncias = await Denuncia.find({});
        const totalDenuncias = denuncias.length;
        const totalResolvidas = denuncias.filter((denuncia) => denuncia.situacao === 'Resolvida').length;
        const totalPendentes = denuncias.filter((denuncia) => denuncia.situacao === 'Pendente').length;
        // denúncias p status  o gráfico de pizza
        const statusLabels = ['Pendente', 'Em Análise', 'Em Andamento', 'Resolvida', 'Arquivada'];
        const statusCounts = statusLabels.map((status) =>
            denuncias.filter((denuncia) => denuncia.situacao === status).length
        );
        // denúncias animais e ambientais
        const totalAnimais = denuncias.filter((denuncia) => denuncia.especie === 'Animais').length;
        const totalAmbiental = denuncias.filter((denuncia) => denuncia.especie === 'Ambiental').length;
        // porcentagem para  barras
        const percentualAnimais = totalDenuncias > 0
            ? ((totalAnimais / totalDenuncias) * 100).toFixed(1)
            : '0.0';
        const percentualAmbiental = totalDenuncias > 0
            ? ((totalAmbiental / totalDenuncias) * 100).toFixed(1)
            : '0.0';
        // taxa de resolução 
        const taxaResolucao = totalDenuncias > 0
            ? ((totalResolvidas / totalDenuncias) * 100).toFixed(1)
            : '0.0';

        res.render('admin/relatorio/lst', {
            totalDenuncias,
            totalResolvidas,
            totalPendentes,
            taxaResolucao,
            statusLabels,
            statusCounts,

            
            totalAnimais,
            totalAmbiental,
            percentualAnimais,
            percentualAmbiental
        });
    } catch (error) {
        console.error('Erro ao carregar relatório:', error);
        res.status(500).send('Erro ao carregar relatório');
    }
}

// export async function alertarExclusaoDenuncia(req, res) {
//     const { id } = req.params;

//     await Alerta.create({
//         nomealert: 'EXCLUSAO DA DENúNCIA',
//         denunciaId: id,
//         mensagem: `Tentativa de exclusão da denúncia ${id}`
//     });

//     // bloqueia a exclusão
//       res.status(500).send('Erro ao excluir. Alerta registrado.');
//     // res.status(403).send('Exclusão bloqueada. Alerta registrado.');
// }


/*
          funccion para desfazier cagadióis 

const partidas = await Partida.find().populate('timedecasa timedefora')
const ruins = partidas.filter(p => !p.timedecasa || !p.timedefora)
await Partida.deleteMany({_id: { $in: ruins.map(p => p._id)}})

*/
