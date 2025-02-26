import amqp from 'amqplib';
import http from 'http';
import { Server } from 'socket.io';
/*
npm install amqplib http socket.io nodemon
*/

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
    socket.on('disconnect', () => {
        console.log("Jogador desconectado!");
    })
})

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