import amqp from 'amqplib';
import http from 'http';
import { Server } from 'socket.io';

// array das palavras do jogo
const palavras = [
    "AREIA", "ARENA", "AUDIO", "AUREO", "BAILE", "BARCO", "BARRA", "BOLSA", "BORDA", // [A-B]
    "CLONE", "DRAMA", "FRETE", "GRAMA", "GRATO", "HOMEM", "IDEAL", "ITENS", "JEGUE", // [C-J]
    "MANGA", "MANTO", "MEIAS", "MOLHO", "NATAL", "NOITE", "PADRE", "PEDRA", "PODER", // [M-P]
    "PONTE", "POSTE", "SOBRE", "SAMBA", "TEMPO", "TERMO", "TRENA", "VASCO", "ZEBRA"  // [P-Z]
];
// definindo número máximo a ser sorteado
let max = palavras.length;

let palavraSortada = '';

// contador de players online
let numPlayers = 0;

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin:'*',
        methods: ["GET", "POST"],
    }
});

// Configuração do WebSocket
io.on('connection', (socket) => {
    console.log("Novo jogador conectado!");
    numPlayers++;
    console.log("Jogadores online: ", numPlayers);
    
    // quando tiver um único jogador, uma palavra é sorteada e enviada via socket
    if(numPlayers === 1){
        palavraSortada = sortear();
        io.emit("palavra", palavraSortada);
    } else // caso contrário, quando um jogar se conectar a palavra atual sorteada é enviada para ele
    socket.emit("palavra", palavraSortada);
    
    // quando um jogador acerta a palavra uma nova é enviada
    socket.on('acerto', (palavra) => {
        console.log("Palavra acertada: ", palavra);
        palavraSortada = sortear();
        io.emit("palavra", palavraSortada);
    })
    socket.on('disconnect', () => {
        console.log("Jogador desconectado!");
        numPlayers--;
        console.log("Jogadores online: ", numPlayers);
    })
})

function sortear(){
    let indexSorteado = Math.floor(Math.random()*max);
    let palavra = palavras[indexSorteado];
    return palavra;
}

// queue consumer
async function consumirMensagens(){
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'eventos';

    await channel.assertQueue(queue); // garante que a fila existe*

    console.log("Aguardando mensagens...");    

    await channel.consume(queue, (mensagem) => {
        if(!mensagem){
            console.error("Mensagem inválida recebida!");
            return;            
        }
        const msg = mensagem.content.toString();

        // envia a mensagem para os jogadores
        io.emit("evento", msg);

        channel.ack(mensagem);
    })
}

consumirMensagens().catch(console.error); // inicia o consumo de mensagens
io.listen(3001)