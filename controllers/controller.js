import Time from '../models/time.js';
import Jogador from '../models/jogador.js';
import Partida from '../models/partida.js';

export const home = async (req, res) => {
    const times = await Time.find();
    const partidas = await Partida.find()
      .populate("timedecasa")
      .populate("timedefora");
  
    const classificacao = times.map(time => {
      let pontos = 0,
          vitorias = 0,
          empates = 0,
          derrotas = 0,
          golsPro = 0,
          golsContra = 0;
  
      partidas.forEach(partida => {
        const isCasa = partida.timedecasa._id.equals(time._id);
        const isFora = partida.timedefora._id.equals(time._id);
  
        if (isCasa || isFora) {
          const golsFeitos = isCasa ? partida.golcasa : partida.golfora;
          const golsSofridos = isCasa ? partida.golfora : partida.golcasa;
  
          golsPro += golsFeitos;
          golsContra += golsSofridos;
  
          if (golsFeitos > golsSofridos) {
            vitorias++;
            pontos += 3;
          } else if (golsFeitos === golsSofridos) {
            empates++;
            pontos += 1;
          } else {
            derrotas++;
          }
        }
      });
  
      return {
        nome: time.nome,
        pontos,
        vitorias,
        empates,
        derrotas,
        golsPro,
        golsContra,
        saldo: golsPro - golsContra
      };
    });
  
    classificacao.sort((a, b) => b.pontos - a.pontos || b.saldo - a.saldo);
  
    res.render("admin/index", {
      classificacao,
      times,
      partidas
    });
  };





















export async function abreaddtime(req, res) {
    res.render('admin/time/add')
}
export async function addtime(req, res) {
    var escudoupload=null
    if(req.file!=null)
{
    escudoupload=req.file.filename
}
else
{
    escudoupload=null
}
    await Time.create({
        nome:req.body.nome,
        estadio:req.body.estadio,
        classificacao:req.body.classificacao,
        datafundacao:req.body.datafundacao,
        pontos: 0,
        escudo:escudoupload
    })
    res.redirect('/admin/time/add')
}
export async function listartime(req, res) {
    const resultado = await Time.find({}).catch(function(err){console.log(err)});
    res.render('admin/time/lst',{Times: resultado});
}
export async function filtrartime(req, res) {
    const resposta = await Time.find({nome: new RegExp(req.body.pesquisar,"i")})
    res.render('admin/time/lst',{Times: resposta});
}

export async function deletatime(req, res) {
    await Time.findByIdAndDelete(req.params.id)
    res.redirect('/admin/time/lst')
}
export async function abreedttime(req, res){
    const resultado = await Time.findById(req.params.id)
    res.render('admin/time/edt',{Time: resultado})
}
export async function edttime(req, res) {
  try {
    const updateData = {
      nome: req.body.nome,
      estadio: req.body.estadio,
    };

    if (req.file) {
      updateData.escudo = req.file.filename;
    } else if (req.body.escudoatual) {
      updateData.escudo = req.body.escudoatual;
    } else {
      updateData.escudo = null;
    }

    // Força retorno do documento atualizado (útil para depurar)
    const timeAtualizado = await Time.findByIdAndUpdate(req.params.id, updateData, { new: true });
    console.log('Time atualizado:', timeAtualizado);

    res.redirect('/admin/time/lst');
  } catch (error) {
    console.error('Erro ao atualizar time:', error);
    res.status(500).send('Erro ao atualizar time');
  }
}


export async function abreaddjogador(req, res) {
    const resultado = await Time.find({}).catch(function(err){console.log(err)})
    res.render('admin/jogador/add',{Times:resultado})
}
export async function addjogador(req, res) {
    var jtime = null;
    if(req.body.time!=null)
    {
        jtime = await Time.findById(req.body.time)
    }    
    var fotoupload=null
        if(req.file!=null)
    {
        fotoupload=req.file.filename
    }
        else
    {
        fotoupload=null
    }
await Jogador.create({
    nome: req.body.nome,
    camisa: req.body.camisa,
    time: jtime,
    posicao: req.body.posicao,
    foto: fotoupload, // <<< aqui
})

    res.redirect('/admin/jogador/add')
}
export async function listarjogador(req, res) {
    const resultado = await Jogador.find({}).populate('time').catch(err => console.log(err));
    res.render('admin/jogador/lst', { jogadores: resultado });
}

export async function filtrarjogador(req, res) {
    const resposta = await Jogador.find({ nome: new RegExp(req.body.pesquisar, "i") }).populate('time');
    res.render('admin/jogador/lst', { jogadores: resposta });
}


export async function deletajogador(req, res) {
    await Jogador.findByIdAndDelete(req.params.id)
    res.redirect('/admin/jogador/lst')
}
export async function abreedtjogador(req, res) {
    try {
        const resultado = await Jogador.findById(req.params.id);
        const jtimes = await Time.find({}).catch(function(err){ console.log(err) });

        if (!resultado) {
            // Se o jogador não for encontrado, retorna erro 404
            return res.status(404).send("Jogador não encontrado");
        }

        // Renderiza a view com o jogador e os times
        res.render('admin/jogador/edt', {
            Jogador: resultado,
            Times: jtimes
        });

    } catch (err) {
        console.error("Erro ao carregar jogador:", err);
        res.status(500).send("Erro interno do servidor");
    }
}

export async function edtjogador(req, res) {
  try {
    const jogador = await Jogador.findById(req.params.id);

    if (!jogador) {
      return res.status(404).send("Jogador não encontrado");
    }

    // Atualiza os campos básicos
    jogador.nome = req.body.nome || jogador.nome;
    jogador.camisa = req.body.camisa || jogador.camisa;
    jogador.posicao = req.body.posicao || jogador.posicao;

    // Se o time foi enviado, atualiza (senão mantém)
    if (req.body.time) {
      jogador.time = req.body.time;
    }

    // Se enviou uma nova foto, atualiza
    if (req.file) {
      jogador.foto = req.file.filename;
    } else if (req.body.fotoatual) {
      // Mantém a foto atual, se não enviou nova
      jogador.foto = req.body.fotoatual;
    }

    await jogador.save();

    res.redirect('/admin/jogador/lst');
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar jogador");
  }
}




export async function abreaddpartida(req, res) {
    const resultado = await Time.find({}).catch(function(err){console.log(err)})
    res.render('admin/partida/add',{Times:resultado})
}
export async function addpartida(req, res) {
    const timeCasa = await Time.findById(req.body.timedecasa);
    const timeFora = await Time.findById(req.body.timedefora);
    var pontocasa, pontofora

    if (req.body.golcasa > req.body.golfora) {
        pontocasa = 3;
        pontofora = 0;
    } else if (req.body.golcasa < req.body.golfora) {
        pontofora = 3;
        pontocasa = 0
    } else {
        pontocasa = 1;
        pontofora = 1;
    }
    await Partida.create({ 
        timedecasa: timeCasa,
        timedefora: timeFora,
        golcasa: req.body.golcasa,
        golfora: req.body.golfora,
        datapartida: req.body.datapartida,       
    })
    timeCasa.pontos = timeCasa.pontos+pontocasa;
    timeFora.pontos = timeFora.pontos+pontofora;

    await timeCasa.save()
    await timeFora.save()
    res.redirect('/admin/partida/add');

}
export async function listarpartida(req, res) {
    const resultado = await Partida.find({})
    .populate('timedecasa')
    .populate('timedefora')
    .catch(function(err){console.log(err)});
    res.render('admin/partida/lst',{Partidas: resultado});
}
export async function filtrarpartida(req, res) {
    const resposta = await Partida.find({nome: new RegExp(req.body.pesquisar,"i")})
    res.render('admin/partida/lst',{Partidas: resposta});
}

export async function deletapartida(req, res) {
    await Partida.findByIdAndDelete(req.params.id)
    res.redirect('/admin/partida/lst')
}

export async function abreedtpartida(req, res){
    const resultado = await Partida.findById(req.params.id)
    const jtimes = await Time.find({}).catch(function(err){console.log(err)})
    res.render('admin/partida/edt',{Partida: resultado,Times:jtimes})
}

export async function edtpartida(req, res){
    const partida = await Partida.findById(req.params.id);

    const timeCasa = await Time.findById(partida.timedecasa);
    const timeFora = await Time.findById(partida.timedefora);

    
    const golsAntigosCasa = partida.golcasa;
    const golsAntigosFora = partida.golfora;
       

    
    if (golsAntigosCasa > golsAntigosFora) {
        timeCasa.pontos -= 3;
    } else if (golsAntigosCasa < golsAntigosFora) {
        timeFora.pontos -= 3;
    } else {
        timeCasa.pontos -= 1;
        timeFora.pontos -= 1;
    }

   
    const novoGolCasa = parseInt(req.body.golcasa);
    const novoGolFora = parseInt(req.body.golfora);

    if (novoGolCasa > novoGolFora) {
        timeCasa.pontos += 3;
    } else if (novoGolCasa < novoGolFora) {
        timeFora.pontos += 3;
    } else {
        timeCasa.pontos += 1;
        timeFora.pontos += 1;
    }

    await Partida.findByIdAndUpdate(req.params.id, {
        golcasa: novoGolCasa,
        golfora: novoGolFora,
        datapartida: req.body.datapartida,
    });

    await timeCasa.save();
    await timeFora.save();

    res.redirect('/admin/partida/lst');
}


//edição de gols
/*else if (req.body.golcasa > req.body.golfora) {
    pontocasa = 3;
    pontofora = -3;
} 
else if(req.body.golcasa < req.body.golfora) {
    pontocasa = -3;
    pontofora = 3;
} 
else if(req.body.golcasa == req.body.golfora){
    pontocasa = -2;
    pontofora = 1;
}
else if(req.body.golcasa == req.body.golfora){
    pontocasa = 1;
    pontofora = -2;
}

*/
     
/*
          funccion para desfazier cagadióis 

const partidas = await Partida.find().populate('timedecasa timedefora')
const ruins = partidas.filter(p => !p.timedecasa || !p.timedefora)
await Partida.deleteMany({_id: { $in: ruins.map(p => p._id)}})

*/

