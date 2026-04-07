import express from 'express';
import multer from 'multer';

const router = express.Router();

// Configuração do multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/imagem');
    },
    filename: function (req, file, cb) {
        const nome = Date.now() + '-' + file.originalname;
        cb(null, nome);
    }
});

const upload = multer({ storage });

// Importando os controllers
import {
    home,
    // Time
    abreadddenuncia,
    abreadddenunciaUsuario,
    adddenuncia,
    adddenunciaUsuario,
    listardenuncia,
    listardenunciaUsuario,
    filtrardenuncia,
    deletardenuncia,
    abreedtdenuncia,
    edtdenuncia,
    alertarExclusaoDenuncia,
    testewpp,
    abreverdenuncia,
    abreverdenunciaUsuario,
    solicitarInativacaoDenuncia,


    //relatorio
    listarrelatorio,
    listarrelatorioUsuario,
    // // Jogador
    // abreaddjogador,
    // addjogador,
    // listarjogador,
    // filtrarjogador,
    // deletajogador,
    // abreedtjogador,
    // edtjogador,

    // Partida
    // abreaddpartida,
    // addpartida,
    // listarpartida,
    // filtrarpartida,
    // deletapartida,
    // abreedtpartida,
    // edtpartida

} from '../controllers/controller.js';

// ----------------------
// ROTAS

// Página inicial
router.get('/', home);

// // ----- Denuncia -----
// router.get('/admin/denuncia/add', abreadddenuncia);
// router.post('/admin/denuncia/add', upload.single('foto'), adddenuncia);
router.get('/admin/denuncia/add2', abreadddenuncia);
router.post('/admin/denuncia/add2', upload.single('foto'), adddenuncia);

router.get('/admin/denuncia/lst', listardenuncia);
router.post('/admin/denuncia/lst', filtrardenuncia);

router.get('/admin/denuncia/del/:ndenuncia', alertarExclusaoDenuncia);

router.get('/admin/denuncia/edt/:id', abreedtdenuncia);
router.post('/admin/denuncia/edt/:id', upload.single('foto'), edtdenuncia);
router.get('/admin/denuncia/ver/:id', abreverdenuncia);
router.get('/admin/denuncia/testwpp', testewpp);

// ----- Relatorio -----
router.get('/admin/relatorio/lst', listarrelatorio);

// ----- Usuario -----
router.get('/usuario/denuncia/add', abreadddenunciaUsuario);
router.post('/usuario/denuncia/add', upload.single('foto'), adddenunciaUsuario);
router.get('/usuario/denuncia/lst', listardenunciaUsuario);
router.get('/usuario/denuncia/ver/:id', abreverdenunciaUsuario);
router.get('/usuario/denuncia/solicitar-inativacao/:ndenuncia', solicitarInativacaoDenuncia);

router.get('/usuario/relatorio/lst', listarrelatorioUsuario);

// // ----- JOGADOR -----
// router.get('/admin/jogador/add', abreaddjogador);
// router.post('/admin/jogador/add', upload.single('foto'), addjogador);

// router.get('/admin/jogador/lst', listarjogador);
// router.post('/admin/jogador/lst', filtrarjogador);

// router.get('/admin/jogador/del/:id', deletajogador);

// router.get('/admin/jogador/edt/:id', abreedtjogador);
// router.post('/admin/jogador/edt/:id', upload.single('foto'), edtjogador);

// // ----- PARTIDA -----
// router.get('/admin/partida/add', abreaddpartida);
// router.post('/admin/partida/add', addpartida);

// router.get('/admin/partida/lst', listarpartida);
// router.post('/admin/partida/lst', filtrarpartida);

// router.get('/admin/partida/del/:id', deletapartida);

// router.get('/admin/partida/edt/:id', abreedtpartida);
// router.post('/admin/partida/edt/:id', edtpartida);


// Exportando
export default router;
