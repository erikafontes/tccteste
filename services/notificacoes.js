import Notificacao from '../models/notificacao.js';
import Usuario from '../models/usuarios.js';
import { enviarEmailNotificacao } from './email.js';

function normalizarTexto(valor) {
    return String(valor ?? '').trim();
}

function normalizarArquivos(arquivos) {
    return (Array.isArray(arquivos) ? arquivos : [])
        .map((arquivo) => String(arquivo))
        .sort()
        .join('|');
}

function arquivosDaDenuncia(denuncia) {
    return Array.isArray(denuncia?.evidencias) && denuncia.evidencias.length
        ? denuncia.evidencias
        : (denuncia?.foto ? [denuncia.foto] : []);
}

async function criarNotificacao(dados, enviarEmail = false) {
    const notificacao = await Notificacao.create(dados);

    if (enviarEmail && dados.usuarioEmail) {
        try {
            await enviarEmailNotificacao({
                to: dados.usuarioEmail,
                subject: dados.titulo,
                text: dados.mensagem
            });
        } catch (error) {
            console.warn('Falha ao enviar email de notificacao:', error);
        }
    }

    return notificacao;
}

async function buscarUsuarioDaDenuncia(denuncia) {
    if (!denuncia?.email) {
        return null;
    }

    return Usuario.findOne({ email: denuncia.email }).select('_id email').lean();
}

export async function notificarAdminsNovaDenuncia(denuncia) {
    return criarNotificacao({
        targetRole: 'admin',
        denunciaId: denuncia._id,
        ndenuncia: denuncia.ndenuncia,
        titulo: 'Nova denúncia recebida',
        mensagem: `A denúncia nº ${denuncia.ndenuncia} foi registrada por ${denuncia.nomedenunciante || 'um cidadão'}.`,
        tipo: 'nova-denuncia',
        link: `/admin/denuncia/ver/${denuncia._id}`
    });
}

export async function notificarUsuarioAlteracoesDenuncia(denunciaAntes, denunciaDepois) {
    const usuario = await buscarUsuarioDaDenuncia(denunciaDepois);
    const dadosBase = {
        targetRole: 'usuario',
        usuarioId: usuario?._id,
        usuarioEmail: denunciaDepois.email,
        denunciaId: denunciaDepois._id,
        ndenuncia: denunciaDepois.ndenuncia,
        link: `/usuario/denuncia/ver/${denunciaDepois._id}`
    };
    const tarefas = [];

    if (normalizarTexto(denunciaAntes.situacao) !== normalizarTexto(denunciaDepois.situacao)) {
        tarefas.push(criarNotificacao({
            ...dadosBase,
            titulo: 'Denúncia atualizada',
            mensagem: `Sua denúncia nº ${denunciaDepois.ndenuncia} teve a situação atualizada para ${denunciaDepois.situacao}.`,
            tipo: denunciaDepois.situacao === 'Resolvida' ? 'concluida' : 'situacao'
        }, true));
    }

    if (normalizarTexto(denunciaAntes.providencia) !== normalizarTexto(denunciaDepois.providencia)) {
        tarefas.push(criarNotificacao({
            ...dadosBase,
            titulo: 'Andamento da denúncia',
            mensagem: `As providências da denúncia nº ${denunciaDepois.ndenuncia} foram atualizadas.`,
            tipo: 'providencia'
        }, true));
    }

    if (normalizarArquivos(arquivosDaDenuncia(denunciaAntes)) !== normalizarArquivos(arquivosDaDenuncia(denunciaDepois))) {
        tarefas.push(criarNotificacao({
            ...dadosBase,
            titulo: 'Arquivos atualizados',
            mensagem: `Os arquivos/evidências da denúncia nº ${denunciaDepois.ndenuncia} foram atualizados.`,
            tipo: 'arquivo'
        }, true));
    }

    return Promise.all(tarefas);
}

export async function carregarNotificacoesUsuarioLogado(user) {
    if (!user) {
        return { notificacoes: [], totalNaoLidas: 0 };
    }

    const filtro = user.role === 'admin'
        ? { targetRole: 'admin' }
        : {
            targetRole: 'usuario',
            $or: [
                { usuarioId: user.id },
                { usuarioEmail: user.email }
            ]
        };

    const [notificacoes, totalNaoLidas] = await Promise.all([
        Notificacao.find(filtro).sort({ createdAt: -1 }).limit(5).lean(),
        Notificacao.countDocuments({ ...filtro, lida: false })
    ]);

    return { notificacoes, totalNaoLidas };
}
