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
    abreaddtime,
    addtime,
    listartime,
    filtrartime,
    deletatime,
    abreedttime,
    edttime,

    // Jogador
    abreaddjogador,
    addjogador,
    listarjogador,
    filtrarjogador,
    deletajogador,
    abreedtjogador,
    edtjogador,

    // Partida
    abreaddpartida,
    addpartida,
    listarpartida,
    filtrarpartida,
    deletapartida,
    abreedtpartida,
    edtpartida

} from '../controllers/controller.js';

// ----------------------
// ROTAS

// Página inicial
router.get('/', home);

// ----- TIME -----
router.get('/admin/time/add', abreaddtime);
router.post('/admin/time/add', upload.single('escudo'), addtime);

router.get('/admin/time/lst', listartime);
router.post('/admin/time/lst', filtrartime);

router.get('/admin/time/del/:id', deletatime);

router.get('/admin/time/edt/:id', abreedttime);
router.post('/admin/time/edt/:id', upload.single('escudo'), edttime);

// ----- JOGADOR -----
router.get('/admin/jogador/add', abreaddjogador);
router.post('/admin/jogador/add', upload.single('foto'), addjogador);

router.get('/admin/jogador/lst', listarjogador);
router.post('/admin/jogador/lst', filtrarjogador);

router.get('/admin/jogador/del/:id', deletajogador);

router.get('/admin/jogador/edt/:id', abreedtjogador);
router.post('/admin/jogador/edt/:id', upload.single('foto'), edtjogador);

// ----- PARTIDA -----
router.get('/admin/partida/add', abreaddpartida);
router.post('/admin/partida/add', addpartida);

router.get('/admin/partida/lst', listarpartida);
router.post('/admin/partida/lst', filtrarpartida);

router.get('/admin/partida/del/:id', deletapartida);

router.get('/admin/partida/edt/:id', abreedtpartida);
router.post('/admin/partida/edt/:id', edtpartida);


// Exportando
export default router;
